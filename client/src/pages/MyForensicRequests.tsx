/**
 * MyForensicRequests — list the current user's Professional Forensic
 * Report requests.
 *
 * Route: /forensic/requests
 *
 * Backend contract (Phase 4):
 *   GET /api/forensic/requests
 *     resp: { requests: ForensicRequest[] }
 *
 * Each request item:
 *   { id, case_type, status, created_at, deadline, quote_amount? }
 *
 * Status workflow:
 *   new → under_review → quoted → accepted → in_production → delivered
 *   (or declined)
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchWithAuth } from "@/lib/api";
import { Loader2, FileText, Plus } from "lucide-react";

interface ForensicReq {
  id: string;
  case_type: string;
  status: string;
  created_at: string;
  deadline?: string | null;
  quote_amount?: number | null;
  organization?: string | null;
  additional_notes?: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Submitted",
  under_review: "Under Review",
  quoted: "Quote Sent",
  accepted: "Accepted",
  in_production: "In Production",
  delivered: "Delivered",
  declined: "Declined",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-500",
  under_review: "bg-yellow-500/20 text-yellow-500",
  quoted: "bg-purple-500/20 text-purple-500",
  accepted: "bg-forensic-cyan/20 text-forensic-cyan",
  in_production: "bg-forensic-cyan/20 text-forensic-cyan",
  delivered: "bg-forensic-green/20 text-forensic-green",
  declined: "bg-red-500/20 text-red-500",
};

const CASE_LABEL: Record<string, string> = {
  ddex: "DDEX Dispute (DSP)",
  association: "Copyright Association",
  court: "Court Litigation",
  catalog: "Catalog Audit",
  lawyer: "Lawyer Opinion",
  other: "Other",
};

export default function MyForensicRequests() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<ForensicReq[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    fetchWithAuth("/api/forensic/requests")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setData(d.requests ?? d ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "Failed to load forensic requests.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <ForensicLayout
      title="My Forensic Requests"
      subtitle="Track Professional Forensic Report requests"
    >
      <SEO
        title="My Forensic Requests — DetectX"
        description="View and track your Professional Forensic Report requests, quote status, and deliverables."
        path="/forensic/requests/"
      />
      <div className="max-w-5xl">
        <div className="forensic-panel">
          <div className="forensic-panel-header flex items-center justify-between">
            <span>Forensic Request History</span>
            <Button
              size="sm"
              onClick={() => setLocation("/forensic/request")}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Request
            </Button>
          </div>
          <div className="forensic-panel-content">
            {!isAuthenticated ? (
              <Alert>
                <AlertDescription>
                  Sign in to view your forensic request history.
                </AlertDescription>
              </Alert>
            ) : loading ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            ) : error ? (
              <Alert>
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            ) : !data || data.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No forensic requests yet.
                </p>
                <Button onClick={() => setLocation("/forensic/request")}>
                  Submit Your First Request
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left py-2 px-3">Request ID</th>
                      <th className="text-left py-2 px-3">Case Type</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Submitted</th>
                      <th className="text-left py-2 px-3">Deadline</th>
                      <th className="text-right py-2 px-3">Quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono text-xs">
                          {r.id.length > 16 ? r.id.slice(0, 16) + "…" : r.id}
                        </td>
                        <td className="py-2 px-3">
                          {CASE_LABEL[r.case_type] || r.case_type}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              STATUS_COLOR[r.status] || "bg-muted text-muted-foreground"
                            }`}
                          >
                            {STATUS_LABEL[r.status] || r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">
                          {r.deadline
                            ? new Date(r.deadline).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-xs">
                          {r.quote_amount != null
                            ? `$${r.quote_amount.toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
