/**
 * Admin Logs Page
 * 
 * Displays audit trail of all admin activities.
 * Features: Search, filter by action type, date range, pagination
 */

import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  User,
  Shield,
  Settings,
  RotateCcw
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Action type icons and labels
const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  plan_change: { icon: <Settings className="h-4 w-4" />, label: "Plan Change", color: "text-blue-400" },
  usage_modify: { icon: <FileText className="h-4 w-4" />, label: "Usage Modify", color: "text-yellow-400" },
  usage_reset: { icon: <RotateCcw className="h-4 w-4" />, label: "Usage Reset", color: "text-green-400" },
  admin_add: { icon: <Shield className="h-4 w-4" />, label: "Admin Add", color: "text-purple-400" },
  admin_remove: { icon: <Shield className="h-4 w-4" />, label: "Admin Remove", color: "text-red-400" },
  bulk_plan_change: { icon: <User className="h-4 w-4" />, label: "Bulk Plan Change", color: "text-blue-400" },
  bulk_usage_reset: { icon: <RotateCcw className="h-4 w-4" />, label: "Bulk Usage Reset", color: "text-green-400" },
};

export default function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Fetch logs from API
  const { data, isLoading, refetch } = trpc.admin.getLogs.useQuery({
    adminEmail: searchTerm || undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    page,
    limit: 20,
  });
  
  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  
  const handleSearch = () => {
    setPage(1);
    refetch();
  };
  
  const handleReset = () => {
    setSearchTerm("");
    setActionFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { 
      icon: <FileText className="h-4 w-4" />, 
      label: action, 
      color: "text-gray-400" 
    };
  };
  
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground">
              Audit trail of all admin activities
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Admin Email Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by admin email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Actions</option>
                <option value="plan_change">Plan Change</option>
                <option value="usage_modify">Usage Modify</option>
                <option value="usage_reset">Usage Reset</option>
                <option value="admin_add">Admin Add</option>
                <option value="admin_remove">Admin Remove</option>
                <option value="bulk_plan_change">Bulk Plan Change</option>
                <option value="bulk_usage_reset">Bulk Usage Reset</option>
              </select>
              
              {/* Start Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  placeholder="Start Date"
                />
              </div>
              
              {/* End Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                  placeholder="End Date"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Logs ({total} total)</CardTitle>
            <CardDescription>
              Complete history of admin actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => {
                  const actionConfig = getActionConfig(log.action);
                  return (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-muted ${actionConfig.color}`}>
                            {actionConfig.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${actionConfig.color}`}>
                                {actionConfig.label}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                by {log.adminEmail}
                              </span>
                            </div>
                            {log.targetEmail && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Target: {log.targetEmail}
                              </p>
                            )}
                            {log.details && (
                              <p className="text-sm mt-1">{log.details}</p>
                            )}
                            {/* Show value changes */}
                            {(() => {
                              const prevStr = log.previousValue ? formatValue(log.previousValue) : null;
                              const newStr = log.newValue ? formatValue(log.newValue) : null;
                              if (!prevStr && !newStr) return null;
                              return (
                                <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                                  {prevStr && (
                                    <div className="text-red-400">- {prevStr}</div>
                                  )}
                                  {newStr && (
                                    <div className="text-green-400">+ {newStr}</div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
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
