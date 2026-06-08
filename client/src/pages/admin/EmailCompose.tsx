/**
 * Admin Email Compose
 *
 * Compose and send marketing / transactional email campaigns.
 * Backend endpoints:
 *   GET    /api/admin/email/templates
 *   POST   /api/admin/email/preview
 *   GET    /api/admin/email/recipients/count
 *   POST   /api/admin/email/send
 *
 * Notes:
 * - Compliance footer is automatically appended by backend (informed in UI)
 * - Variable syntax: {{name}}, {{email}}, {{plan}}, {{unsubscribe_url}}, {{admin_message}}
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Mail,
  Send,
  Eye,
  RefreshCw,
  AlertCircle,
  Code,
  FileText,
  Layers,
  TestTube,
  Users,
  ChevronRight,
  Clock,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

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
  rendered_html: string;
  rendered_text: string;
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

const VARIABLE_BUTTONS = [
  "{{name}}",
  "{{email}}",
  "{{plan}}",
  "{{unsubscribe_url}}",
  "{{admin_message}}",
];

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let h: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (h) clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
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

  // Recipients
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

  // Preview
  const [previewMode, setPreviewMode] = useState<"html" | "text" | "raw">(
    "html"
  );
  const [previewLang, setPreviewLang] = useState("en");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Send state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

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
    if (emailType === "transactional" || emailType === "marketing") {
      filter.type = emailType;
    }
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

  // When a template is chosen, prefill subject/body
  useEffect(() => {
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    // subjects: either object keyed by lang or single string
    let subj = "";
    if (typeof tpl.subjects === "string") {
      subj = tpl.subjects;
    } else if (tpl.subjects && typeof tpl.subjects === "object") {
      subj = tpl.subjects[previewLang] || tpl.subjects.en || "";
    }
    if (subj) setSubject(subj);
    if (tpl.body_html) setBodyHtml(tpl.body_html);
    if (tpl.body_text) setBodyText(tpl.body_text);
    if (tpl.category) setCategory(tpl.category);
    if (tpl.type === "marketing" || tpl.type === "transactional") {
      setEmailType(tpl.type);
    }
  }, [templateId, templates, previewLang]);

  // ----- recipient count (debounced) ------------------------------------

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
        `/api/admin/email/recipients/count?${params.toString()}`
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

  // ----- preview (debounced) --------------------------------------------

  const debouncedPreview = useRef(
    debounce(async (payload: any) => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
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
        setPreviewHtml(data.rendered_html || "");
        setPreviewText(data.rendered_text || "");
      } catch (err) {
        setPreviewError(err instanceof Error ? err.message : "Preview failed");
      } finally {
        setPreviewLoading(false);
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (!subject && !bodyHtml && !bodyText) return;
    debouncedPreview({
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
    });
  }, [
    subject,
    bodyHtml,
    bodyText,
    templateId,
    previewLang,
    emailType,
    debouncedPreview,
  ]);

  // ----- helpers --------------------------------------------------------

  const insertVariable = (v: string) => {
    setBodyHtml((prev) => `${prev}${v}`);
  };

  const togglePlan = (p: string) => {
    setPlanSel((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };
  const toggleDispute = (s: string) => {
    setDisputeSel((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

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
        const resp = await fetchWithAuth("/api/admin/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        toast.success(
          opts.testOnly
            ? "Test email queued"
            : `Campaign queued: ${data.recipient_count ?? "?"} recipients`
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
    ]
  );

  const handleSendTest = () => sendCampaign({ testOnly: true, confirmed: true });

  const handleSendClick = () => {
    if (recipientCount === null) {
      toast.error("Refresh recipient count first.");
      return;
    }
    if (recipientCount === 0) {
      toast.error("No recipients selected.");
      return;
    }
    // Large send → confirm modal
    if (recipientCount > 100) {
      setConfirmOpen(true);
      return;
    }
    sendCampaign({ testOnly: false, confirmed: true });
  };

  // ----------------------------------------------------------------------
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Email Compose
            </h1>
            <p className="text-muted-foreground text-sm">
              Send announcements, newsletters, dispute responses, and other
              user communications.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/email/campaigns">
              <a className="inline-flex items-center text-sm px-3 py-2 rounded border border-border hover:bg-muted/50 transition-colors">
                <Layers className="h-4 w-4 mr-1" />
                Campaigns
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------- LEFT: FORM ---------- */}
          <div className="space-y-4">
            {/* Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Start from blank —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} {t.description ? `— ${t.description}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Templates load subject + body + category. You can still edit
                  after loading.
                </p>
              </CardContent>
            </Card>

            {/* Subject + type + category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="DetectX update for {{name}}"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email type</Label>
                    <div className="flex gap-2">
                      {(["transactional", "marketing"] as EmailType[]).map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEmailType(t)}
                            className={cn(
                              "flex-1 px-3 py-2 text-sm rounded border transition-colors",
                              emailType === t
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {t === "transactional"
                              ? "Transactional"
                              : "Marketing"}
                          </button>
                        )
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Transactional bypasses opt-out (account / billing /
                      dispute). Marketing requires consent.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Body (HTML)</Label>
                  <Textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={10}
                    placeholder="<p>Hello {{name}}, ...</p>"
                    className="font-mono text-xs"
                  />
                  <div className="flex flex-wrap gap-1">
                    {VARIABLE_BUTTONS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded border border-border hover:bg-muted/50"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Variables use {"{{var}}"} syntax. Per-recipient values are
                    substituted server-side at send time.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Body (plain text fallback)</Label>
                  <Textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={5}
                    placeholder="Hello {{name}}, ..."
                    className="font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { v: "all", l: "All users" },
                      { v: "plan", l: "By plan" },
                      { v: "dispute", l: "By dispute status" },
                      { v: "individual", l: "Individual users" },
                      { v: "csv", l: "Upload CSV / paste list" },
                    ] as { v: RecipientMode; l: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setMode(opt.v)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded border transition-colors",
                        mode === opt.v
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>

                {mode === "plan" && (
                  <div className="flex flex-wrap gap-2">
                    {PLAN_VALUES.map((p) => (
                      <label
                        key={p}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded border cursor-pointer",
                          planSel.includes(p)
                            ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                            : "border-border text-muted-foreground"
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
                  <div className="flex flex-wrap gap-2">
                    {DISPUTE_STATUSES.map((s) => (
                      <label
                        key={s}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded border cursor-pointer",
                          disputeSel.includes(s)
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                            : "border-border text-muted-foreground"
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
                  <div className="space-y-2">
                    <Label>User IDs or emails (comma- or space-separated)</Label>
                    <Textarea
                      rows={3}
                      value={individualInput}
                      onChange={(e) => setIndividualInput(e.target.value)}
                      placeholder="user-uuid-1, user-uuid-2, name@example.com"
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                {mode === "csv" && (
                  <div className="space-y-2">
                    <Label>One email per line</Label>
                    <Textarea
                      rows={6}
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                      placeholder={"alice@example.com\nbob@example.com"}
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRecipientCount}
                    disabled={countLoading}
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4 mr-1",
                        countLoading && "animate-spin"
                      )}
                    />
                    Refresh count
                  </Button>
                  <div className="text-sm">
                    {countLoading ? (
                      <span className="text-muted-foreground">
                        counting...
                      </span>
                    ) : recipientCount !== null ? (
                      <span>
                        <span className="font-semibold">
                          {recipientCount.toLocaleString()}
                        </span>{" "}
                        recipients selected
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        not refreshed yet
                      </span>
                    )}
                  </div>
                </div>
                {countError && (
                  <div className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {countError}
                  </div>
                )}

                {recipientSample.length > 0 && (
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="font-medium">Sample (first 5):</div>
                    {recipientSample.slice(0, 5).map((r) => (
                      <div key={r.email} className="font-mono">
                        {r.email}
                        {r.name ? ` — ${r.name}` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSendMode("now")}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm rounded border transition-colors flex items-center justify-center gap-2",
                      sendMode === "now"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Clock className="h-4 w-4" /> Send now
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendMode("scheduled")}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm rounded border transition-colors flex items-center justify-center gap-2",
                      sendMode === "scheduled"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <CalendarClock className="h-4 w-4" /> Schedule
                  </button>
                </div>
                {sendMode === "scheduled" && (
                  <div className="space-y-2">
                    <Label>Send at (local time)</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Converted to UTC ISO 8601 before submission.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSendTest}
                    disabled={sending || !subject || !bodyHtml}
                    className="sm:w-1/3"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send test to admin
                  </Button>
                  <Button
                    onClick={handleSendClick}
                    disabled={sending || !subject || !bodyHtml}
                    className="sm:flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending
                      ? "Sending..."
                      : recipientCount !== null
                      ? `Send to ${recipientCount.toLocaleString()} recipients`
                      : "Send"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  A compliance footer (unsubscribe link, postal address,
                  CAN-SPAM / KISA) is automatically appended by the server.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ---------- RIGHT: PREVIEW ---------- */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex gap-1">
                    {(
                      [
                        { v: "html", l: "HTML", Icon: Eye },
                        { v: "text", l: "Text", Icon: FileText },
                        { v: "raw", l: "Raw", Icon: Code },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setPreviewMode(opt.v)}
                        className={cn(
                          "px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1",
                          previewMode === opt.v
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <opt.Icon className="h-3 w-3" />
                        {opt.l}
                      </button>
                    ))}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Label className="text-xs">Lang</Label>
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
                  </div>
                </div>

                {previewError && (
                  <div className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {previewError}
                  </div>
                )}

                <div className="border border-border rounded-md p-3 min-h-[300px] max-h-[600px] overflow-auto bg-card">
                  {previewLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Rendering preview...
                    </div>
                  ) : previewMode === "html" ? (
                    previewHtml ? (
                      <iframe
                        title="Email preview"
                        srcDoc={previewHtml}
                        className="w-full min-h-[400px] bg-white rounded"
                        sandbox=""
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        (empty)
                      </div>
                    )
                  ) : previewMode === "text" ? (
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {previewText || "(empty)"}
                    </pre>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {previewHtml || "(empty)"}
                    </pre>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Compliance footer (unsubscribe / address /
                  jurisdiction-specific opt-out text) is appended on send.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
              <span className="text-muted-foreground">Subject:</span> {subject}
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span> {emailType} /{" "}
              {category}
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
