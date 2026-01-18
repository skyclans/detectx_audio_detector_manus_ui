/**
 * Admin Users Page
 * 
 * Displays user list with search, filter, and management capabilities.
 * API: GET /api/admin/users
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from "lucide-react";

const API_BASE = "https://emjvw2an6oynf9-8000.proxy.runpod.net/api";

interface User {
  user_id: string;
  email: string;
  name: string;
  plan_type: string;
  monthly_limit: number;
  used_this_month: number;
  remaining: number;
  total_verifications: number;
  last_verification_at: string | null;
  created_at: string;
  reset_date: string;
}

interface UsersResponse {
  users: User[];
  count: number;
  total: number;
}

export default function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, planFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      if (search) params.append("search", search);
      if (planFilter) params.append("plan", planFilter);

      const response = await fetch(`${API_BASE}/admin/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Use mock data for development
      setData({
        users: [
          {
            user_id: "user_001",
            email: "user1@example.com",
            name: "John Doe",
            plan_type: "free",
            monthly_limit: 5,
            used_this_month: 3,
            remaining: 2,
            total_verifications: 45,
            last_verification_at: "2026-01-18T14:33:27",
            created_at: "2026-01-05T10:00:00",
            reset_date: "2026-02-01T00:00:00",
          },
          {
            user_id: "user_002",
            email: "pro@example.com",
            name: "Jane Smith",
            plan_type: "pro",
            monthly_limit: 30,
            used_this_month: 15,
            remaining: 15,
            total_verifications: 156,
            last_verification_at: "2026-01-19T09:15:00",
            created_at: "2026-01-01T08:00:00",
            reset_date: "2026-02-01T00:00:00",
          },
          {
            user_id: "user_003",
            email: "enterprise@company.com",
            name: "Enterprise User",
            plan_type: "enterprise",
            monthly_limit: 1000,
            used_this_month: 234,
            remaining: 766,
            total_verifications: 1250,
            last_verification_at: "2026-01-19T10:00:00",
            created_at: "2025-12-15T10:00:00",
            reset_date: "2026-02-01T00:00:00",
          },
        ],
        count: 3,
        total: 128,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleResetUsage = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's monthly usage?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/reset-usage`, {
        method: "POST",
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to reset usage:", err);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "pro":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "enterprise":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage DetectX users</p>
        </div>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-600 dark:text-yellow-400 text-sm">
            Using mock data: {error}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={() => { setSearch(""); setPlanFilter(""); setPage(0); fetchUsers(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({data?.total || 0} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usage</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Active</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.users.map((user) => (
                        <tr key={user.user_id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{user.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPlanBadgeColor(user.plan_type)}`}>
                              {user.plan_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    user.remaining === 0 ? "bg-red-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${(user.used_this_month / user.monthly_limit) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">
                                {user.used_this_month}/{user.monthly_limit}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.total_verifications.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {user.last_verification_at 
                              ? new Date(user.last_verification_at).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="py-3 px-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResetUsage(user.user_id)}
                              title="Reset monthly usage"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {page * limit + 1} - {Math.min((page + 1) * limit, data?.total || 0)} of {data?.total || 0}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">Page {page + 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * limit >= (data?.total || 0)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
