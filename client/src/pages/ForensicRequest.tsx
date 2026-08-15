/**
 * ForensicRequest — Professional Forensic Report request form.
 *
 * Route: /forensic/request[?record_id=<id>]
 *
 * Backend contract (Phase 4):
 *   POST /api/forensic/request
 *     body: {
 *       case_type, deadline, contact_name, contact_email,
 *       organization, phone, related_record_id, additional_notes
 *     }
 *     resp: { request_id: string }
 *
 * On success → /forensic/thank-you?request_id=…
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, ShieldCheck, ArrowRight, Calendar as CalendarIcon } from "lucide-react";

const CASE_TYPES: Array<{ value: string; label: string }> = [
  { value: "ddex", label: "DDEX Dispute (DSP)" },
  { value: "association", label: "Copyright Association / Royalty" },
  { value: "court", label: "Court Litigation Evidence" },
  { value: "catalog", label: "Catalog Audit (Bulk)" },
  { value: "lawyer", label: "Lawyer Opinion Support" },
  { value: "other", label: "Other" },
];

export default function ForensicRequest() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Read ?record_id=... directly from window.location (wouter has no useSearchParams)
  const [recordId, setRecordId] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRecordId(params.get("record_id"));
  }, []);

  const [form, setForm] = useState({
    case_type: "ddex",
    deadline: "",
    contact_name: "",
    contact_email: "",
    organization: "",
    phone: "",
    additional_notes: "",
  });

  // Prefill contact_email from logged-in user
  useEffect(() => {
    if (user?.email && !form.contact_email) {
      setForm((f) => ({
        ...f,
        contact_email: user.email!,
        contact_name: f.contact_name || user.name || "",
      }));
    }
  }, [user, form.contact_email]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.contact_email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/forensic/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          related_record_id: recordId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Submission failed (${res.status})`);
      }
      const data = await res.json();
      const requestId = data.request_id || data.id || "";
      toast.success("Request submitted — DetectX will respond within 1-7 business days.");
      const qs = requestId ? `?request_id=${encodeURIComponent(requestId)}` : "";
      setLocation(`/forensic/thank-you${qs}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ForensicLayout
      title="Professional Forensic Report"
      subtitle="Custom-quoted legal-grade evidence"
    >
      <SEO
        title="Request Professional Forensic Report — DetectX"
        description="Legal-grade AI music detection evidence for court, copyright associations, DSP disputes, and catalog cleanup. DetectX responds with a quote within 1-7 business days."
        path="/forensic/request/"
      />
      <div className="max-w-3xl">
        <div className="forensic-panel">
          <div className="forensic-panel-header flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            Request Professional Forensic Report
          </div>
          <div className="forensic-panel-content">
            <p className="text-sm text-muted-foreground mb-6">
              Legal-grade evidence for court, copyright associations, DSP
              disputes, and catalog cleanup. DetectX will respond with a quote
              within 1-7 business days.
            </p>

            {recordId && (
              <Alert className="mb-6">
                <AlertDescription className="text-xs">
                  Related to scan:{" "}
                  <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {recordId}
                  </code>
                </AlertDescription>
              </Alert>
            )}

            {!isAuthenticated && (
              <Alert className="mb-6">
                <AlertDescription className="text-xs">
                  You can submit a request without signing in, but signed-in
                  requests are easier to follow up. Replies will be sent by
                  email.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Case type */}
              <div>
                <Label htmlFor="case_type" className="mb-1.5 block">
                  Case Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="case_type"
                  value={form.case_type}
                  onChange={(e) => handleChange("case_type", e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {CASE_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div>
                <Label htmlFor="deadline" className="mb-1.5 block">
                  Submission Deadline
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="deadline"
                      type="button"
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      {form.deadline ? (
                        format(new Date(form.deadline + "T00:00:00"), "PPP")
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        form.deadline
                          ? new Date(form.deadline + "T00:00:00")
                          : undefined
                      }
                      onSelect={(d) =>
                        handleChange("deadline", d ? format(d, "yyyy-MM-dd") : "")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Optional — when you need to file or submit the evidence.
                </p>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name" className="mb-1.5 block">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact_name"
                    value={form.contact_name}
                    onChange={(e) => handleChange("contact_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email" className="mb-1.5 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => handleChange("contact_email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organization" className="mb-1.5 block">
                  Organization (Company / Label / Association)
                </Label>
                <Input
                  id="organization"
                  value={form.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-1.5 block">
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="additional_notes" className="mb-1.5 block">
                  Additional Notes
                </Label>
                <Textarea
                  id="additional_notes"
                  rows={5}
                  value={form.additional_notes}
                  onChange={(e) =>
                    handleChange("additional_notes", e.target.value)
                  }
                  placeholder="Describe your use case, urgency, jurisdictions, languages required, or specific requirements…"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting}
                variant="destructive"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                This is a request for a quote, not a payment. DetectX will
                respond by email with a tailored proposal.
              </p>
            </form>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
