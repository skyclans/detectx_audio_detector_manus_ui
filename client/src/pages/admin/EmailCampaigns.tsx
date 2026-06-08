/**
 * Admin Email Campaigns list
 *
 * Backend: GET /api/admin/email/campaigns?status=&limit=&offset=
 */

import { useCallback, useEffect, useState } from "react";
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
import {
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

interface Campaign {
  id: number | string;
  subject?: string;
  category?: string;
  email_type?: string;
  status?: string;
  recipient_count?: number;
  sent_count?: number;
  failed_count?: number;
  bounced_count?: number;
  complained_count?: number;
  opened_count?: number;
  clicked_count?: number;
  started_at?: string;
  created_at?: string;
  scheduled_at?: string;
}

interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

const STATUS_OPTIONS = [
  { v: "all", l: "All" },
  { v: "draft", l: "Draft" },
  { v: "scheduled", l: "Scheduled" },
  { v: "sending", l: "Sending" },
  { v: "sent", l: "Sent" },
  { v: "failed", l: "Failed" },
];

const TYPE_OPTIONS = [
  { v: "all", l: "All" },
  { v: "transactional", l: "Transactional" },
  { v: "marketing", l: "Marketing" },
];

function statusBadge(s?: string) {
  switch (s) {
    case "sent":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "sending":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    case "scheduled":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "failed":
      return "bg-red-500/20 text-red-400 border-red-500/40";
    case "draft":
      return "bg-muted/30 text-muted-foreground border-border";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
}

function typeBadge(t?: string) {
  if (t === "marketing")
    return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  } catch {
    return d;
  }
}

export default function AdminEmailCampaigns() {
  const [status, setStatus] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState<CampaignsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("limit", String(limit));
      params.set("offset", String((page - 1) * limit));
      const resp = await fetchWithAuth(
        `/api/admin/email/campaigns?${params.toString()}`
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const result: CampaignsResponse = await resp.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [status, typeFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const rows = data?.campaigns || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" /> Campaigns
            </h1>
            <p className="text-muted-foreground text-sm">
              Past and scheduled email campaigns ({total} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/email/compose">
              <a className="inline-flex items-center text-sm px-3 py-2 rounded border border-border hover:bg-muted/50 transition-colors">
                <Pencil className="h-4 w-4 mr-1" /> New campaign
              </a>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCampaigns}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-1", loading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => {
                        setStatus(o.v);
                        setPage(1);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors",
                        status === o.v
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="flex flex-wrap gap-1">
                  {TYPE_OPTIONS.map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => {
                        setTypeFilter(o.v);
                        setPage(1);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors",
                        typeFilter === o.v
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">From</div>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-40 text-xs"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">To</div>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-40 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load campaigns: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Campaign list</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No campaigns yet.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                          ID
                        </th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                          Subject
                        </th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                          Category
                        </th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="text-right py-3 px-3 font-medium text-muted-foreground">
                          Recipients
                        </th>
                        <th className="text-right py-3 px-3 font-medium text-muted-foreground">
                          Sent / Fail / Bounce / Cmpl
                        </th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                          Started
                        </th>
                        <th className="text-right py-3 px-3 font-medium text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((c) => (
                        <tr
                          key={String(c.id)}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <td className="py-3 px-3 text-muted-foreground font-mono text-xs">
                            #{c.id}
                          </td>
                          <td className="py-3 px-3 max-w-[260px]">
                            <span
                              className="truncate block"
                              title={c.subject}
                            >
                              {c.subject || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs">
                            {c.category || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                typeBadge(c.email_type)
                              )}
                            >
                              {c.email_type || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs">
                            {c.recipient_count?.toLocaleString() ?? "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs">
                            <span className="text-emerald-400">
                              {c.sent_count ?? 0}
                            </span>{" "}
                            /{" "}
                            <span className="text-red-400">
                              {c.failed_count ?? 0}
                            </span>{" "}
                            /{" "}
                            <span className="text-amber-400">
                              {c.bounced_count ?? 0}
                            </span>{" "}
                            /{" "}
                            <span className="text-purple-400">
                              {c.complained_count ?? 0}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                statusBadge(c.status)
                              )}
                            >
                              {c.status || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
                            {formatDate(
                              c.started_at ||
                                c.scheduled_at ||
                                c.created_at
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/admin/email/campaigns/${c.id}`}>
                              <a className="inline-flex items-center text-xs px-2 py-1 rounded border border-border hover:bg-muted/50 transition-colors">
                                <Eye className="h-3 w-3 mr-1" />
                                Open
                              </a>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
