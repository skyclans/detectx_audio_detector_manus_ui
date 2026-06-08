/**
 * Admin Dashboard Page
 *
 * Displays overall statistics, trends, and charts for DetectX admin.
 * API: GET /api/admin/dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileCheck,
  Users,
  Bot,
  User,
  TrendingUp,
  Activity,
  ShieldAlert,
  Eye,
  FileAudio
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  total_verifications: number;
  today_verifications: number;
  ai_detected: number;
  human_detected: number;
  ai_detection_rate: number;
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  verifications_trend: Array<{ date: string; count: number }>;
  plan_distribution: {
    free: number;
    pro: number;
    enterprise: number;
  };
}

type TrendPeriod = 7 | 30 | 90;

interface DisputeSummaryRow {
  id: number | string;
  request_id?: string | number;
  fileName?: string;
  filename?: string;
  user_email?: string | null;
  userId?: string | null;
  created_at?: string;
  createdAt?: string;
}

interface DisputeSummary {
  disputes: DisputeSummaryRow[];
  total: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>(7);
  const [disputes, setDisputes] = useState<DisputeSummary | null>(null);

  const fetchDashboard = useCallback(async (days: TrendPeriod) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/dashboard?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(trendPeriod);
  }, [trendPeriod, fetchDashboard]);

  // Fetch open disputes summary (5 most recent + total). Non-fatal on error.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetchWithAuth(
          "/api/admin/disputes?status=open&limit=5",
        );
        if (!resp.ok) return;
        const json = await resp.json();
        if (cancelled) return;
        setDisputes({
          disputes: Array.isArray(json?.disputes) ? json.disputes : [],
          total: Number(json?.total ?? 0),
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePeriodChange = (period: TrendPeriod) => {
    setTrendPeriod(period);
  };

  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (trendPeriod <= 7) {
      return d.toLocaleDateString("en-US", { weekday: "short" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of DetectX statistics</p>
        </div>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-600 dark:text-yellow-400 text-sm">
            Failed to load: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Verifications
                  </CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.total_verifications.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{data.today_verifications} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    AI Detected
                  </CardTitle>
                  <Bot className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{data.ai_detected.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.ai_detection_rate}% detection rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Human Verified
                  </CardTitle>
                  <User className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{data.human_detected.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {(100 - data.ai_detection_rate).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.total_users.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.active_users_today} active today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Open Disputes Card */}
            {disputes && (
              <Card
                className={
                  disputes.total > 0
                    ? "border-amber-500/40 bg-amber-500/5"
                    : undefined
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert
                        className={
                          disputes.total > 0
                            ? "h-5 w-5 text-amber-400"
                            : "h-5 w-5 text-muted-foreground"
                        }
                      />
                      Open Disputes
                      <span className="ml-2 text-2xl font-bold">
                        {disputes.total}
                      </span>
                    </CardTitle>
                    <Link href="/admin/disputes">
                      <a className="text-xs inline-flex items-center px-2 py-1 rounded border border-border hover:bg-muted/50 transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        View All
                      </a>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {disputes.disputes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      현재 진행 중인 분쟁이 없습니다.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border/40">
                      {disputes.disputes.map((d) => {
                        const reqId = d.request_id ?? d.id;
                        return (
                          <li
                            key={String(d.id)}
                            className="flex items-center justify-between py-2 text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileAudio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span
                                className="truncate max-w-[260px]"
                                title={d.fileName || d.filename}
                              >
                                {d.fileName || d.filename || `#${d.id}`}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2 truncate max-w-[180px]">
                                {d.user_email || d.userId || ""}
                              </span>
                            </div>
                            <Link href={`/admin/verifications/${reqId}`}>
                              <a className="text-xs inline-flex items-center px-2 py-1 rounded border border-border hover:bg-muted/50 transition-colors flex-shrink-0">
                                <Eye className="h-3 w-3 mr-1" />
                                Investigate
                              </a>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trend Chart with Recharts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Verification Trend
                  </CardTitle>
                  <div className="flex gap-1">
                    {([7, 30, 90] as TrendPeriod[]).map((period) => (
                      <Button
                        key={period}
                        variant={trendPeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePeriodChange(period)}
                        className="text-xs px-3"
                      >
                        {period}d
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.verifications_trend}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatChartDate}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        interval={trendPeriod <= 7 ? 0 : trendPeriod <= 30 ? 2 : 6}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                        labelFormatter={(label) => {
                          const d = new Date(label + "T00:00:00");
                          return d.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        formatter={(value: number) => [value, "Verifications"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution & User Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Plan Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span>Free</span>
                      </div>
                      <span className="font-medium">{data.plan_distribution.free}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full"
                        style={{ width: `${(data.plan_distribution.free / data.total_users) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Pro</span>
                      </div>
                      <span className="font-medium">{data.plan_distribution.pro}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(data.plan_distribution.pro / data.total_users) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Enterprise</span>
                      </div>
                      <span className="font-medium">{data.plan_distribution.enterprise}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(data.plan_distribution.enterprise / data.total_users) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Active Today</span>
                        <span className="font-medium">{data.active_users_today}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(data.active_users_today / data.total_users) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Active This Week</span>
                        <span className="font-medium">{data.active_users_week}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(data.active_users_week / data.total_users) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        Weekly engagement rate
                      </div>
                      <div className="text-2xl font-bold">
                        {((data.active_users_week / data.total_users) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
