/**
 * Admin Dashboard Page
 * 
 * Displays overall statistics, trends, and charts for DetectX admin.
 * API: GET /api/admin/dashboard
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileCheck, 
  Users, 
  Bot, 
  User,
  TrendingUp,
  Activity
} from "lucide-react";

const API_BASE = "https://emjvw2an6oynf9-8000.proxy.runpod.net/api";

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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/dashboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Use mock data for development
      setData({
        total_verifications: 659,
        today_verifications: 45,
        ai_detected: 312,
        human_detected: 347,
        ai_detection_rate: 47.3,
        total_users: 128,
        active_users_today: 23,
        active_users_week: 89,
        verifications_trend: [
          { date: "2026-01-13", count: 42 },
          { date: "2026-01-14", count: 56 },
          { date: "2026-01-15", count: 38 },
          { date: "2026-01-16", count: 71 },
          { date: "2026-01-17", count: 63 },
          { date: "2026-01-18", count: 52 },
          { date: "2026-01-19", count: 45 },
        ],
        plan_distribution: {
          free: 98,
          pro: 25,
          enterprise: 5,
        },
      });
    } finally {
      setLoading(false);
    }
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
            Using mock data: {error}
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

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Verification Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {data.verifications_trend.map((item, index) => {
                    const maxCount = Math.max(...data.verifications_trend.map(t => t.count));
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                          style={{ height: `${height}%` }}
                          title={`${item.count} verifications`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="text-xs font-medium">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
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
