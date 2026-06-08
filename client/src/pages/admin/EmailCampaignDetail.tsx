/**
 * Admin Email Campaign detail
 *
 * Backend:
 *   GET /api/admin/email/campaigns/:id
 *   GET /api/admin/email/campaigns/:id/logs?limit=&offset=
 */

import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

interface Campaign {
  id: number | string;
  subject?: string;
  category?: string;
  email_type?: string;
  status?: string;
  body_html?: string;
  body_text?: string;
  admin_email?: string;
  recipient_count?: number;
  sent_count?: number;
  failed_count?: number;
  bounced_count?: number;
  complained_count?: number;
  opened_count?: number;
  clicked_count?: number;
  started_at?: string;
  scheduled_at?: string;
  created_at?: string;
  completed_at?: string;
}

interface CampaignLog {
  id: number | string;
  email?: string;
  status?: string;
  sent_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  error?: string | null;
}

interface CampaignDetailResponse {
  campaign: Campaign;
  recent_logs?: CampaignLog[];
}

interface CampaignLogsResponse {
  logs: CampaignLog[];
  total: number;
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  } catch {
    return d;
  }
}

function statusBadge(s?: string) {
  switch (s) {
    case "sent":
    case "delivered":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "sending":
    case "queued":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    case "scheduled":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "failed":
    case "bounced":
    case "complained":
      return "bg-red-500/20 text-red-400 border-red-500/40";
    case "opened":
      return "bg-purple-500/20 text-purple-400 border-purple-500/40";
    case "draft":
      return "bg-muted/30 text-muted-foreground border-border";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
}

export default function AdminEmailCampaignDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const campaignId = params.id || "";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchWithAuth(
        `/api/admin/email/campaigns/${campaignId}`
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data: CampaignDetailResponse = await resp.json();
      setCampaign(data.campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("offset", String((page - 1) * limit));
      const resp = await fetchWithAuth(
        `/api/admin/email/campaigns/${campaignId}/logs?${qs.toString()}`
      );
      if (!resp.ok) return;
      const data: CampaignLogsResponse = await resp.json();
      setLogs(data.logs || []);
      setLogsTotal(data.total ?? 0);
    } catch (err) {
      console.error("[CampaignDetail] logs fetch failed", err);
    } finally {
      setLogsLoading(false);
    }
  }, [campaignId, page]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(logsTotal / limit));

  // Delivery rate
  const sent = campaign?.sent_count ?? 0;
  const recipients = campaign?.recipient_count ?? 0;
  const deliveryRate =
    recipients > 0 ? ((sent / recipients) * 100).toFixed(1) : "—";

  // Stat tiles
  const STATS: { label: string; value: number | string; color: string }[] = [
    { label: "Recipients", value: recipients, color: "text-foreground" },
    { label: "Sent", value: sent, color: "text-emerald-400" },
    {
      label: "Failed",
      value: campaign?.failed_count ?? 0,
      color: "text-red-400",
    },
    {
      label: "Bounced",
      value: campaign?.bounced_count ?? 0,
      color: "text-amber-400",
    },
    {
      label: "Complained",
      value: campaign?.complained_count ?? 0,
      color: "text-purple-400",
    },
    {
      label: "Opened",
      value: campaign?.opened_count ?? 0,
      color: "text-blue-400",
    },
    {
      label: "Clicked",
      value: campaign?.clicked_count ?? 0,
      color: "text-cyan-400",
    },
    {
      label: "Delivery rate",
      value: `${deliveryRate}${typeof deliveryRate === "string" && deliveryRate !== "—" ? "%" : ""}`,
      color: "text-foreground",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/email/campaigns")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Campaign #{campaignId}
              </h1>
              <p className="text-muted-foreground text-sm truncate max-w-2xl">
                {campaign?.subject || "—"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchCampaign();
                fetchLogs();
              }}
              disabled={loading || logsLoading}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 mr-1",
                  (loading || logsLoading) && "animate-spin"
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load campaign: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header card */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Subject</div>
                <div className="font-medium break-all">
                  {campaign?.subject || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Status</div>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                    statusBadge(campaign?.status)
                  )}
                >
                  {campaign?.status || "—"}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Type</div>
                <div>
                  {campaign?.email_type || "—"} /{" "}
                  {campaign?.category || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Created</div>
                <div className="text-xs">
                  {formatDate(campaign?.created_at)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Started</div>
                <div className="text-xs">
                  {formatDate(campaign?.started_at)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Completed</div>
                <div className="text-xs">
                  {formatDate(campaign?.completed_at)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">
                  Sent by admin
                </div>
                <div className="text-xs font-mono">
                  {campaign?.admin_email || "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3">
                <div className="text-xs text-muted-foreground">
                  {s.label}
                </div>
                <div className={cn("text-xl font-bold", s.color)}>
                  {typeof s.value === "number"
                    ? s.value.toLocaleString()
                    : s.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Body preview */}
        <Card>
          <CardHeader>
            <CardTitle>Body preview</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign?.body_html ? (
              <iframe
                title="Campaign body"
                srcDoc={campaign.body_html}
                className="w-full min-h-[400px] bg-white rounded border border-border"
                sandbox=""
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                No body available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipients / logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recipients ({logsTotal})</span>
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Backend support pending"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Resend to failed (TODO)
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No logs yet.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                          Sent
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                          Opened
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                          Clicked
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr
                          key={String(l.id)}
                          className="border-b border-border hover:bg-muted/30"
                        >
                          <td className="py-2 px-3 font-mono text-xs">
                            {l.email || "—"}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                statusBadge(l.status)
                              )}
                            >
                              {l.status || "—"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {formatDate(l.sent_at)}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {formatDate(l.opened_at)}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {formatDate(l.clicked_at)}
                          </td>
                          <td className="py-2 px-3 text-xs text-red-400 max-w-[300px] truncate" title={l.error || ""}>
                            {l.error || "—"}
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

        {/* Link back */}
        <div>
          <Link href="/admin/email/campaigns">
            <a className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to campaigns
            </a>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
