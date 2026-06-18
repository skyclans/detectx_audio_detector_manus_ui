/**
 * Admin Forensic Request Detail.
 *
 * Route: /admin/forensic-requests/:id
 *
 * Backend contract (Phase 4):
 *   GET    /api/admin/forensic/requests/:id
 *     resp: ForensicRequest (full)
 *
 *   PATCH  /api/admin/forensic/requests/:id/status
 *     body: { status }
 *
 *   POST   /api/admin/forensic/requests/:id/quote
 *     body: { quote_amount, message }
 *     side effect: email sent to contact_email
 *
 *   POST   /api/admin/forensic/requests/:id/deliver
 *     body: FormData (file)  → uploads completed deliverable
 */

import { useEffect, useState, useCallback } from "react";
import { Link, useRoute } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Upload,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface ForensicReq {
  id: string;
  user_id?: string | null;
  contact_name: string;
  contact_email: string;
  organization?: string | null;
  phone?: string | null;
  case_type: string;
  status: string;
  created_at: string;
  deadline?: string | null;
  related_record_id?: string | null;
  additional_notes?: string | null;
  quote_amount?: number | null;
  quote_message?: string | null;
  deliverable_url?: string | null;
}

const STATUSES = [
  "new",
  "under_review",
  "quoted",
  "accepted",
  "in_production",
  "delivered",
  "declined",
];

const STATUS_LABEL: Record<string, string> = {
  new: "Submitted",
  under_review: "Under Review",
  quoted: "Quote Sent",
  accepted: "Accepted",
  in_production: "In Production",
  delivered: "Delivered",
  declined: "Declined",
};

const CASE_LABEL: Record<string, string> = {
  ddex: "DDEX Dispute (DSP)",
  association: "Copyright Association / Royalty",
  court: "Court Litigation Evidence",
  catalog: "Catalog Audit (Bulk)",
  lawyer: "Lawyer Opinion Support",
  other: "Other",
};

export default function AdminForensicRequestDetail() {
  const [, params] = useRoute("/admin/forensic-requests/:id");
  const id = params?.id;

  const [data, setData] = useState<ForensicReq | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusValue, setStatusValue] = useState<string>("new");
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [quoteMessage, setQuoteMessage] = useState<string>("");
  const [busy, setBusy] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetchWithAuth(`/api/admin/forensic/requests/${id}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d: ForensicReq = await r.json();
      setData(d);
      setStatusValue(d.status);
      setQuoteAmount(d.quote_amount != null ? String(d.quote_amount) : "");
      setQuoteMessage(d.quote_message ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async () => {
    if (!id) return;
    setBusy("status");
    try {
      const r = await fetchWithAuth(
        `/api/admin/forensic/requests/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusValue }),
        },
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success("Status updated.");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const sendQuote = async () => {
    if (!id) return;
    const amount = parseFloat(quoteAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid quote amount.");
      return;
    }
    setBusy("quote");
    try {
      const r = await fetchWithAuth(
        `/api/admin/forensic/requests/${id}/quote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote_amount: amount,
            message: quoteMessage,
          }),
        },
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success("Quote sent by email.");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const uploadDeliverable = async () => {
    if (!id || !file) return;
    setBusy("upload");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetchWithAuth(
        `/api/admin/forensic/requests/${id}/deliver`,
        {
          method: "POST",
          body: fd,
        },
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success("Deliverable uploaded.");
      setFile(null);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/forensic-requests">
              <a className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back
              </a>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-500" />
              Forensic Request
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <Alert>
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        ) : !data ? (
          <Alert>
            <AlertDescription>Not found.</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: case info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Request ID" mono>
                  {data.id}
                </Field>
                <Field label="Submitted">
                  {new Date(data.created_at).toLocaleString()}
                </Field>
                <Field label="Deadline">
                  {data.deadline
                    ? new Date(data.deadline).toLocaleDateString()
                    : "—"}
                </Field>
                <Field label="Case Type">
                  {CASE_LABEL[data.case_type] || data.case_type}
                </Field>
                <Field label="Contact Name">{data.contact_name}</Field>
                <Field label="Email" mono>
                  {data.contact_email}
                </Field>
                <Field label="Organization">{data.organization || "—"}</Field>
                <Field label="Phone">{data.phone || "—"}</Field>
                <Field label="Related Scan" mono>
                  {data.related_record_id ? (
                    <Link href={`/admin/verifications/${data.related_record_id}`}>
                      <a className="text-forensic-cyan hover:underline">
                        {data.related_record_id}
                      </a>
                    </Link>
                  ) : (
                    "—"
                  )}
                </Field>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Additional Notes
                  </div>
                  <div className="bg-muted/30 rounded-md p-3 text-xs whitespace-pre-wrap">
                    {data.additional_notes || "—"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: actions */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="status" className="mb-1.5 block text-xs">
                      Update Status
                    </Label>
                    <select
                      id="status"
                      value={statusValue}
                      onChange={(e) => setStatusValue(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s] || s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={updateStatus}
                    disabled={busy === "status" || statusValue === data.status}
                    size="sm"
                    className="w-full"
                  >
                    {busy === "status" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Save Status
                  </Button>
                </CardContent>
              </Card>

              {/* Quote */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="quote" className="mb-1.5 block text-xs">
                      Amount (USD)
                    </Label>
                    <Input
                      id="quote"
                      type="number"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g. 4000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote-msg" className="mb-1.5 block text-xs">
                      Message (sent in email)
                    </Label>
                    <Textarea
                      id="quote-msg"
                      rows={4}
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      placeholder="Scope of work, deliverables, turnaround…"
                    />
                  </div>
                  <Button
                    onClick={sendQuote}
                    disabled={busy === "quote"}
                    size="sm"
                    className="w-full"
                  >
                    {busy === "quote" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Quote
                  </Button>
                </CardContent>
              </Card>

              {/* Upload deliverable */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Deliverable
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {data.deliverable_url && (
                    <p className="text-[11px] text-muted-foreground">
                      Existing:{" "}
                      <a
                        href={data.deliverable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forensic-cyan hover:underline"
                      >
                        {data.deliverable_url}
                      </a>
                    </p>
                  )}
                  <Button
                    onClick={uploadDeliverable}
                    disabled={!file || busy === "upload"}
                    size="sm"
                    className="w-full"
                    variant="outline"
                  >
                    {busy === "upload" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground w-28 shrink-0">
        {label}
      </div>
      <div className={`text-sm ${mono ? "font-mono" : ""} break-all`}>
        {children}
      </div>
    </div>
  );
}
