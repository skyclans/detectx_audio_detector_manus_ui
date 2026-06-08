/**
 * Admin Disputes List
 *
 * Lists all disputes filterable by status (open / resolved / training_data).
 * Each row links to the investigation view (/admin/verifications/:id).
 *
 * Backend: GET /api/admin/disputes?status=open&page=&limit=
 */

import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileAudio,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

type DisputeStatus = "open" | "resolved" | "training_data";

interface DisputeRow {
  id: number | string;
  request_id?: string | number;
  fileName?: string;
  filename?: string;
  user_email?: string | null;
  userId?: string | null;
  verdict?: string | null;
  dispute_status?: DisputeStatus;
  admin_notes?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

interface DisputesResponse {
  disputes: DisputeRow[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  } catch {
    return d;
  }
}

const STATUS_OPTIONS: { value: "all" | DisputeStatus; label: string; Icon: any }[] = [
  { value: "open", label: "Open", Icon: ShieldAlert },
  { value: "resolved", label: "Resolved", Icon: ShieldCheck },
  { value: "training_data", label: "Training Data", Icon: GraduationCap },
  { value: "all", label: "All", Icon: Eye },
];

function statusBadge(s: DisputeStatus | undefined) {
  switch (s) {
    case "open":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "resolved":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "training_data":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
}

export default function AdminDisputes() {
  const [statusFilter, setStatusFilter] = useState<"all" | DisputeStatus>("open");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState<DisputesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const resp = await fetchWithAuth(`/api/admin/disputes?${params.toString()}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const result: DisputesResponse = await resp.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const rows = data?.disputes || [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
              분쟁 관리 (Disputes)
            </h1>
            <p className="text-muted-foreground text-sm">
              사용자가 이의 제기한 검증 결과를 조사·관리합니다 ({total} 건)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDisputes} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
            새로고침
          </Button>
        </div>

        {/* Status filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ value, label, Icon }) => (
                <Button
                  key={value}
                  variant={statusFilter === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>분쟁 조회 실패: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>분쟁 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                해당 상태의 분쟁이 없습니다.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">ID</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">File</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Verdict</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Created</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Updated</th>
                        <th className="text-right py-3 px-3 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const reqId = r.request_id ?? r.id;
                        return (
                          <tr
                            key={String(r.id)}
                            className="border-b border-border hover:bg-muted/50"
                          >
                            <td className="py-3 px-3 text-muted-foreground font-mono text-xs">
                              #{r.id}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2 max-w-[260px]">
                                <FileAudio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span
                                  className="truncate"
                                  title={r.fileName || r.filename}
                                >
                                  {r.fileName || r.filename || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-xs">
                              {r.user_email || r.userId || "—"}
                            </td>
                            <td className="py-3 px-3 text-xs font-mono">
                              {r.verdict || "—"}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={cn(
                                  "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                  statusBadge(r.dispute_status),
                                )}
                              >
                                {r.dispute_status || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground">
                              {formatDate(r.created_at ?? r.createdAt)}
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground">
                              {formatDate(r.updated_at ?? r.updatedAt)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Link href={`/admin/verifications/${reqId}`}>
                                <a className="inline-flex items-center text-xs px-2 py-1 rounded border border-border hover:bg-muted/50 transition-colors">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Investigate
                                </a>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
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
