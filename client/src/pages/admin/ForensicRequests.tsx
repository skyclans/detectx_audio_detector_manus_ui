/**
 * Admin Forensic Requests — list + status filter.
 *
 * Route: /admin/forensic-requests
 *
 * Backend contract (Phase 4):
 *   GET /api/admin/forensic/requests?status=<status>&page=<n>
 *     resp: { requests: ForensicReq[], total, page, totalPages }
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface ForensicReq {
  id: string;
  user_id?: string | null;
  contact_name: string;
  contact_email: string;
  organization?: string | null;
  case_type: string;
  status: string;
  created_at: string;
  deadline?: string | null;
  quote_amount?: number | null;
}

interface ListResp {
  requests: ForensicReq[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUSES = [
  "all",
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
  ddex: "DDEX",
  association: "Association",
  court: "Court",
  catalog: "Catalog",
  lawyer: "Lawyer",
  other: "Other",
};

export default function AdminForensicRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState<ListResp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetchWithAuth(
        `/api/admin/forensic/requests?${params.toString()}`,
      );
      if (response.ok) {
        const result: ListResp = await response.json();
        setData(result);
      } else {
        setError(`Failed to load forensic requests (HTTP ${response.status})`);
      }
    } catch (err) {
      setError((err as Error).message || "Failed to load forensic requests");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-500" />
              Forensic Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Professional Forensic Report requests — review, quote, deliver.
            </p>
          </div>
          <Button onClick={() => fetchRequests()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, email, organization, ID…"
                    className="pl-9"
                  />
                </div>
              </form>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setPage(1);
                    setStatusFilter(e.target.value);
                  }}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All" : STATUS_LABEL[s] || s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data?.total ?? 0} requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-6">Loading…</div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : !data?.requests?.length ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No forensic requests match the filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left py-2 px-3">ID</th>
                      <th className="text-left py-2 px-3">Contact</th>
                      <th className="text-left py-2 px-3">Organization</th>
                      <th className="text-left py-2 px-3">Case</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Submitted</th>
                      <th className="text-left py-2 px-3">Deadline</th>
                      <th className="text-right py-2 px-3">Quote</th>
                      <th className="text-right py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.requests.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono text-xs">
                          {r.id.slice(0, 12)}…
                        </td>
                        <td className="py-2 px-3">
                          <div className="text-sm">{r.contact_name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {r.contact_email}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-xs">
                          {r.organization || "—"}
                        </td>
                        <td className="py-2 px-3 text-xs">
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
                        <td className="py-2 px-3 text-right">
                          <Link href={`/admin/forensic-requests/${r.id}`}>
                            <a className="inline-flex items-center text-xs text-forensic-cyan hover:underline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-muted-foreground">
                  Page {data.page} of {data.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
