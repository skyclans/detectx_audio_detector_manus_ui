/**
 * Admin Email Compose — Gmail-style rewrite
 *
 * Backend endpoints:
 *   GET    /api/admin/email/templates
 *   POST   /api/admin/email/preview         → { subject, body_html, body_text, headers }
 *   GET    /api/admin/email/recipients/count
 *   POST   /api/admin/email/send            → body { ..., attachments? }
 *
 * Design notes:
 * - Single rich-text editor (TipTap) for body. Plain text is auto-derived
 *   for the text/plain fallback so we never ship `[object Object]`.
 * - Recipients selector is collapsed by default — just shows a recipient
 *   pill with the running count. Click to expand and edit.
 * - Advanced (type / category / template / language / schedule) collapsed
 *   under "Show more options".
 * - Preview is a toggle button next to Send → opens a modal drawer.
 * - Attachments via dedicated picker + page-wide drag-drop.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Send,
  Eye,
  RefreshCw,
  AlertCircle,
  TestTube,
  Users,
  ChevronRight,
  Clock,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/email/RichTextEditor";
import {
  AttachmentPicker,
  type Attachment,
} from "@/components/email/AttachmentPicker";

type EmailType = "transactional" | "marketing";

interface EmailTemplate {
  id: string;
  type?: string;
  category?: string;
  subjects?: Record<string, string> | string;
  body_html?: string;
  body_text?: string;
  description?: string;
  variables?: string[];
}

interface PreviewResponse {
  subject?: string;
  body_html?: string;
  body_text?: string;
  // Older API kept these names — accept both for forward compat
  rendered_html?: string;
  rendered_text?: string;
  headers?: Record<string, string>;
}

interface RecipientSample {
  email: string;
  name?: string | null;
}

interface RecipientsCountResponse {
  count: number;
  sample?: RecipientSample[];
}

type RecipientMode = "all" | "plan" | "dispute" | "individual" | "csv";

const PLAN_VALUES = ["free", "pro", "studio", "enterprise", "master"];
const DISPUTE_STATUSES = ["open", "resolved", "training_data", "none"];

const LANGUAGES: { value: string; label: string }[] = [
  { value: "auto", label: "Auto (recipient locale)" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
  { value: "ja", label: "日本語" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
  { value: "zh", label: "中文" },
];

const CATEGORY_OPTIONS = [
  { value: "announcement", label: "Announcement" },
  { value: "dispute_response", label: "Dispute response" },
  { value: "newsletter", label: "Newsletter" },
  { value: "billing", label: "Billing" },
  { value: "system", label: "System" },
  { value: "custom", label: "Custom" },
];

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let h: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (h) clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
}

function recipientModeLabel(mode: RecipientMode): string {
  switch (mode) {
    case "all":
      return "All users";
    case "plan":
      return "By plan";
    case "dispute":
      return "By dispute status";
    case "individual":
      return "Individual users";
    case "csv":
      return "Custom list";
  }
}

export default function AdminEmailCompose() {
  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateId, setTemplateId] = useState<string>("");

  // Form
  const [subject, setSubject] = useState("");
  const [emailType, setEmailType] = useState<EmailType>("transactional");
  const [category, setCategory] = useState<string>("announcement");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Recipients
  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [mode, setMode] = useState<RecipientMode>("all");
  const [planSel, setPlanSel] = useState<string[]>([]);
  const [disputeSel, setDisputeSel] = useState<string[]>([]);
  const [individualInput, setIndividualInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [recipientSample, setRecipientSample] = useState<RecipientSample[]>([]);
  const [countLoading, setCountLoading] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);

  // Schedule
  const [sendMode, setSendMode] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");

  // Advanced toggle
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLang, setPreviewLang] = useState("en");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Send state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Page-wide drag-drop visual
  const [pageDragOver, setPageDragOver] = useState(false);
  const dragCountRef = useRef(0);

  // ----- helpers --------------------------------------------------------

  const recipientFilter = useMemo(() => {
    const filter: Record<string, any> = { mode };
    if (mode === "plan") filter.plan = planSel;
    if (mode === "dispute") filter.dispute_status = disputeSel;
    if (mode === "individual") {
      filter.user_ids = individualInput
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (mode === "csv") {
      filter.emails = csvInput
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    filter.type = emailType;
    return filter;
  }, [mode, planSel, disputeSel, individualInput, csvInput, emailType]);

  // ----- fetch templates ------------------------------------------------

  const fetchTemplates = useCallback(async () => {
    try {
      const resp = await fetchWithAuth("/api/admin/email/templates");
      if (!resp.ok) return;
      const data = await resp.json();
      const list: EmailTemplate[] = Array.isArray(data)
        ? data
        : data.templates || [];
      setTemplates(list);
    } catch (err) {
      console.error("[EmailCompose] templates fetch failed", err);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // When a template is chosen — confirm if user already has content
  const applyTemplate = useCallback(
    (id: string) => {
      const tpl = templates.find((t) => t.id === id);
      if (!tpl) return;

      const hasContent = subject.trim() || bodyHtml.replace(/<[^>]*>/g, "").trim();
      if (hasContent) {
        const ok = window.confirm(
          "Loading a template will replace the current subject and body. Continue?",
        );
        if (!ok) return;
      }

      let subj = "";
      if (typeof tpl.subjects === "string") {
        subj = tpl.subjects;
      } else if (tpl.subjects && typeof tpl.subjects === "object") {
        subj =
          tpl.subjects[previewLang] ||
          tpl.subjects.en ||
          Object.values(tpl.subjects)[0] ||
          "";
      }
      setTemplateId(id);
      if (subj) setSubject(subj);
      if (tpl.body_html !== undefined) setBodyHtml(tpl.body_html);
      if (tpl.body_text !== undefined) setBodyText(tpl.body_text);
      if (tpl.category) setCategory(tpl.category);
      if (tpl.type === "marketing" || tpl.type === "transactional") {
        setEmailType(tpl.type);
      }
    },
    [templates, subject, bodyHtml, previewLang],
  );

  // ----- recipient count (manual refresh) -------------------------------

  const fetchRecipientCount = useCallback(async () => {
    setCountLoading(true);
    setCountError(null);
    try {
      const params = new URLSearchParams();
      params.set("mode", mode);
      params.set("type", emailType);
      if (mode === "plan" && planSel.length)
        params.set("plan", planSel.join(","));
      if (mode === "dispute" && disputeSel.length)
        params.set("dispute_status", disputeSel.join(","));
      if (mode === "individual" && individualInput.trim())
        params.set("user_ids", individualInput.replace(/\s+/g, ","));
      if (mode === "csv" && csvInput.trim()) {
        const emails = csvInput
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (emails.length) params.set("emails", emails.join(","));
      }
      const resp = await fetchWithAuth(
        `/api/admin/email/recipients/count?${params.toString()}`,
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data: RecipientsCountResponse = await resp.json();
      setRecipientCount(data.count ?? 0);
      setRecipientSample(data.sample || []);
    } catch (err) {
      setCountError(err instanceof Error ? err.message : "Unknown error");
      setRecipientCount(null);
      setRecipientSample([]);
    } finally {
      setCountLoading(false);
    }
  }, [mode, planSel, disputeSel, individualInput, csvInput, emailType]);

  // Auto-refresh count when recipient inputs settle
  const debouncedCount = useRef(
    debounce(() => {
      void fetchRecipientCount();
    }, 600),
  ).current;

  useEffect(() => {
    debouncedCount();
  }, [
    mode,
    planSel,
    disputeSel,
    individualInput,
    csvInput,
    emailType,
    debouncedCount,
  ]);

  // ----- preview --------------------------------------------------------

  const runPreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const payload = {
        template_id: templateId || undefined,
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        recipient_language: previewLang,
        email_type: emailType,
        sample_variables: {
          name: "Sample User",
          email: "sample@example.com",
          plan: "pro",
        },
      };
      const resp = await fetchWithAuth("/api/admin/email/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data: PreviewResponse = await resp.json();
      setPreviewSubject(data.subject || subject);
      setPreviewHtml(data.body_html || data.rendered_html || "");
      setPreviewText(data.body_text || data.rendered_text || "");
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }, [templateId, subject, bodyHtml, bodyText, previewLang, emailType]);

  const openPreview = () => {
    setPreviewOpen(true);
    void runPreview();
  };

  // Re-render preview when language changes while modal is open
  useEffect(() => {
    if (previewOpen) void runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewLang]);

  // ----- toggles --------------------------------------------------------

  const togglePlan = (p: string) =>
    setPlanSel((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  const toggleDispute = (s: string) =>
    setDisputeSel((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  // ----- send -----------------------------------------------------------

  const sendCampaign = useCallback(
    async (opts: { testOnly: boolean; confirmed: boolean }) => {
      setSending(true);
      try {
        const body: Record<string, any> = {
          subject,
          body_html: bodyHtml,
          body_text: bodyText,
          template_id: templateId || undefined,
          email_type: emailType,
          category,
          recipient_filter: recipientFilter,
          test_only: opts.testOnly,
          confirmed: opts.confirmed,
        };
        if (sendMode === "scheduled" && scheduledAt) {
          body.scheduled_at = new Date(scheduledAt).toISOString();
        }
        if (attachments.length > 0) {
          body.attachments = attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            content_type: a.content_type,
            size: a.size,
          }));
        }
        const resp = await fetchWithAuth("/api/admin/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!resp.ok) {
          if (resp.status === 413) {
            throw new Error("Attachments exceed 25 MB total");
          }
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        toast.success(
          opts.testOnly
            ? "Test email queued"
            : `Campaign queued: ${data.recipient_count ?? "?"} recipients`,
        );
        setConfirmOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Send failed");
      } finally {
        setSending(false);
      }
    },
    [
      subject,
      bodyHtml,
      bodyText,
      templateId,
      emailType,
      category,
      recipientFilter,
      sendMode,
      scheduledAt,
      attachments,
    ],
  );

  const handleSendTest = () =>
    sendCampaign({ testOnly: true, confirmed: true });

  const handleSendClick = () => {
    if (recipientCount === null) {
      toast.error("Refresh recipient count first.");
      return;
    }
    if (recipientCount === 0) {
      toast.error("No recipients selected.");
      return;
    }
    if (recipientCount > 100) {
      setConfirmOpen(true);
      return;
    }
    sendCampaign({ testOnly: false, confirmed: true });
  };

  // ----- page drag-drop -------------------------------------------------

  const onPageDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      dragCountRef.current += 1;
      setPageDragOver(true);
    }
  };
  const onPageDragLeave = () => {
    dragCountRef.current = Math.max(0, dragCountRef.current - 1);
    if (dragCountRef.current === 0) setPageDragOver(false);
  };
  const onPageDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
    }
  };
  const onPageDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCountRef.current = 0;
    setPageDragOver(false);
    if (!e.dataTransfer?.files?.length) return;
    // Delegate by simulating a click flow: append files via picker logic
    // by directly using FileReader here
    const incoming = Array.from(e.dataTransfer.files);
    const newAtts: Attachment[] = [];
    for (const f of incoming) {
      try {
        const result: string = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = () => rej(r.error);
          r.readAsDataURL(f);
        });
        const comma = result.indexOf(",");
        const content = comma >= 0 ? result.slice(comma + 1) : result;
        newAtts.push({
          filename: f.name,
          content,
          content_type: f.type || "application/octet-stream",
          size: f.size,
          previewUrl: f.type.startsWith("image/")
            ? URL.createObjectURL(f)
            : undefined,
        });
      } catch (err) {
        toast.error(`Failed to read ${f.name}`);
      }
    }
    if (newAtts.length) setAttachments((prev) => [...prev, ...newAtts]);
  };

  // ----------------------------------------------------------------------
  return (
    <AdminLayout>
      <div
        className="relative"
        onDragEnter={onPageDragEnter}
        onDragLeave={onPageDragLeave}
        onDragOver={onPageDragOver}
        onDrop={onPageDrop}
      >
        {/* Drag-drop overlay */}
        {pageDragOver && (
          <div className="pointer-events-none fixed inset-0 z-50 bg-primary/10 border-4 border-dashed border-primary flex items-center justify-center">
            <div className="bg-card border border-primary rounded-lg px-8 py-6 text-center">
              <div className="text-xl font-semibold text-primary">
                Drop files to attach
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Max 25 MB total
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/email/campaigns">
                <a className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  New Email
                </h1>
                <p className="text-xs text-muted-foreground">
                  Compliance footer is appended automatically.
                </p>
              </div>
            </div>
            <Link href="/admin/email/campaigns">
              <a className="hidden sm:inline-flex items-center text-xs px-3 py-1.5 rounded border border-border hover:bg-muted/50 transition-colors">
                <Layers className="h-3.5 w-3.5 mr-1" />
                Campaigns
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </a>
            </Link>
          </div>

          {/* Compose Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
            {/* To */}
            <RecipientsRow
              open={recipientsOpen}
              setOpen={setRecipientsOpen}
              mode={mode}
              setMode={setMode}
              planSel={planSel}
              togglePlan={togglePlan}
              disputeSel={disputeSel}
              toggleDispute={toggleDispute}
              individualInput={individualInput}
              setIndividualInput={setIndividualInput}
              csvInput={csvInput}
              setCsvInput={setCsvInput}
              recipientCount={recipientCount}
              recipientSample={recipientSample}
              countLoading={countLoading}
              countError={countError}
              refreshCount={fetchRecipientCount}
            />

            {/* Subject */}
            <div className="px-4 py-2 border-b border-border flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                Subject
              </span>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="DetectX update for {{name}}"
                className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9"
              />
            </div>

            {/* Body */}
            <div className="px-3 py-3">
              <RichTextEditor
                value={bodyHtml}
                onChange={(html, text) => {
                  setBodyHtml(html);
                  setBodyText(text);
                }}
                placeholder="Write your message…"
                minHeight="280px"
              />
            </div>

            {/* Attachments */}
            <div className="px-4 pb-3">
              <AttachmentPicker
                attachments={attachments}
                onChange={setAttachments}
              />
            </div>

            {/* Advanced options */}
            <div className="border-t border-border">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="w-full px-4 py-2 flex items-center justify-between text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {advancedOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  {advancedOpen ? "Hide" : "Show"} options
                </span>
                <span className="text-[11px]">
                  {emailType} · {category} ·{" "}
                  {sendMode === "now" ? "Send now" : `Scheduled`}
                </span>
              </button>
              {advancedOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 bg-background/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Template</Label>
                      <select
                        value={templateId}
                        onChange={(e) => {
                          if (e.target.value) applyTemplate(e.target.value);
                          else setTemplateId("");
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">— Blank —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id}
                            {t.description ? ` — ${t.description}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Language</Label>
                      <select
                        value={previewLang}
                        onChange={(e) => setPreviewLang(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email type</Label>
                      <div className="flex gap-2">
                        {(["transactional", "marketing"] as EmailType[]).map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setEmailType(t)}
                              className={cn(
                                "flex-1 px-3 py-1.5 text-xs rounded border transition-colors capitalize",
                                emailType === t
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "border-border text-muted-foreground hover:bg-muted/50",
                              )}
                            >
                              {t}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {CATEGORY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Schedule</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSendMode("now")}
                        className={cn(
                          "flex-1 px-3 py-1.5 text-xs rounded border transition-colors flex items-center justify-center gap-1.5",
                          sendMode === "now"
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/50",
                        )}
                      >
                        <Clock className="h-3.5 w-3.5" /> Send now
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMode("scheduled")}
                        className={cn(
                          "flex-1 px-3 py-1.5 text-xs rounded border transition-colors flex items-center justify-center gap-1.5",
                          sendMode === "scheduled"
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/50",
                        )}
                      >
                        <CalendarClock className="h-3.5 w-3.5" /> Schedule
                      </button>
                    </div>
                    {sendMode === "scheduled" && (
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="h-9 text-sm"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t border-border px-4 py-3 flex flex-wrap items-center gap-2 bg-background/40">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={sending || !subject || !bodyHtml}
              >
                <TestTube className="h-4 w-4 mr-1.5" />
                Send test
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={openPreview}
                disabled={!subject && !bodyHtml}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={handleSendClick}
                disabled={sending || !subject || !bodyHtml}
              >
                <Send className="h-4 w-4 mr-1.5" />
                {sending
                  ? "Sending…"
                  : recipientCount !== null
                    ? `Send (${recipientCount.toLocaleString()})`
                    : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Email preview
            </DialogTitle>
            <DialogDescription>
              Rendered with sample variables. Compliance footer is appended on
              send.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-2">
            <Label className="text-xs">Language</Label>
            <select
              value={previewLang}
              onChange={(e) => setPreviewLang(e.target.value)}
              className="h-8 rounded border border-input bg-background px-2 text-xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={runPreview}
              disabled={previewLoading}
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5 mr-1",
                  previewLoading && "animate-spin",
                )}
              />
              Refresh
            </Button>
          </div>

          {previewError && (
            <div className="text-xs text-red-500 flex items-center gap-1 mb-2">
              <AlertCircle className="h-3 w-3" /> {previewError}
            </div>
          )}

          <div className="border border-border rounded-md overflow-hidden bg-white">
            <div className="border-b border-border px-3 py-2 bg-muted/50 text-xs">
              <div className="font-medium text-foreground">
                {previewSubject || subject || "(no subject)"}
              </div>
            </div>
            {previewLoading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Rendering preview…
              </div>
            ) : (
              <iframe
                title="Email preview"
                srcDoc={previewHtml || "<p style='color:#888'>(empty)</p>"}
                className="w-full bg-white"
                style={{ minHeight: "420px" }}
                sandbox=""
              />
            )}
          </div>

          {previewText && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer text-muted-foreground">
                Plain text fallback
              </summary>
              <pre className="text-xs whitespace-pre-wrap font-mono p-3 mt-1 border border-border rounded bg-background max-h-48 overflow-auto">
                {previewText}
              </pre>
            </details>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm bulk send</DialogTitle>
            <DialogDescription>
              You are about to send to{" "}
              <span className="font-semibold">
                {recipientCount?.toLocaleString()} recipients
              </span>
              . This action cannot be undone once sending starts.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-1 py-2">
            <div>
              <span className="text-muted-foreground">Subject:</span>{" "}
              {subject || "(none)"}
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span> {emailType} /{" "}
              {category}
            </div>
            <div>
              <span className="text-muted-foreground">Attachments:</span>{" "}
              {attachments.length}
            </div>
            <div>
              <span className="text-muted-foreground">Schedule:</span>{" "}
              {sendMode === "now" ? "Send immediately" : `At ${scheduledAt}`}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                sendCampaign({ testOnly: false, confirmed: true })
              }
              disabled={sending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Confirm send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// =====================================================================
// Recipients row — pill summary + collapsible picker
// =====================================================================

interface RecipientsRowProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: RecipientMode;
  setMode: (m: RecipientMode) => void;
  planSel: string[];
  togglePlan: (p: string) => void;
  disputeSel: string[];
  toggleDispute: (s: string) => void;
  individualInput: string;
  setIndividualInput: (v: string) => void;
  csvInput: string;
  setCsvInput: (v: string) => void;
  recipientCount: number | null;
  recipientSample: RecipientSample[];
  countLoading: boolean;
  countError: string | null;
  refreshCount: () => void;
}

function RecipientsRow(props: RecipientsRowProps) {
  const {
    open,
    setOpen,
    mode,
    setMode,
    planSel,
    togglePlan,
    disputeSel,
    toggleDispute,
    individualInput,
    setIndividualInput,
    csvInput,
    setCsvInput,
    recipientCount,
    recipientSample,
    countLoading,
    countError,
    refreshCount,
  } = props;

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
          To
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary">
            <Users className="h-3 w-3" />
            {recipientModeLabel(mode)}
          </span>
          {countLoading ? (
            <span className="text-xs text-muted-foreground">counting…</span>
          ) : recipientCount !== null ? (
            <span className="text-xs text-muted-foreground">
              · {recipientCount.toLocaleString()} recipients
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">· not counted</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 bg-background/40">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { v: "all", l: "All users" },
                { v: "plan", l: "By plan" },
                { v: "dispute", l: "By dispute" },
                { v: "individual", l: "Individuals" },
                { v: "csv", l: "Email list" },
              ] as { v: RecipientMode; l: string }[]
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setMode(opt.v)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded border transition-colors",
                  mode === opt.v
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50",
                )}
              >
                {opt.l}
              </button>
            ))}
          </div>

          {mode === "plan" && (
            <div className="flex flex-wrap gap-1.5">
              {PLAN_VALUES.map((p) => (
                <label
                  key={p}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded border cursor-pointer capitalize",
                    planSel.includes(p)
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={planSel.includes(p)}
                    onChange={() => togglePlan(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          )}

          {mode === "dispute" && (
            <div className="flex flex-wrap gap-1.5">
              {DISPUTE_STATUSES.map((s) => (
                <label
                  key={s}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded border cursor-pointer",
                    disputeSel.includes(s)
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={disputeSel.includes(s)}
                    onChange={() => toggleDispute(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          )}

          {mode === "individual" && (
            <Textarea
              rows={2}
              value={individualInput}
              onChange={(e) => setIndividualInput(e.target.value)}
              placeholder="user-uuid-1, name@example.com"
              className="font-mono text-xs"
            />
          )}

          {mode === "csv" && (
            <Textarea
              rows={4}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={"alice@example.com\nbob@example.com"}
              className="font-mono text-xs"
            />
          )}

          <div className="flex items-center gap-3 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCount}
              disabled={countLoading}
              className="h-7 text-xs"
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3 mr-1",
                  countLoading && "animate-spin",
                )}
              />
              Refresh count
            </Button>
            {recipientSample.length > 0 && (
              <span className="text-muted-foreground truncate">
                Sample: {recipientSample.slice(0, 3).map((r) => r.email).join(", ")}
                {recipientSample.length > 3 && "…"}
              </span>
            )}
          </div>
          {countError && (
            <div className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {countError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
