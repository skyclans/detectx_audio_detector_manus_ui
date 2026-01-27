/**
 * Admin User Detail Page
 * 
 * Displays detailed user information including:
 * - User profile and plan info
 * - Verification statistics from RunPod API (total, AI observed, not observed)
 * - Verification history from RunPod API with date filtering
 */

import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  FileAudio,
  Bot,
  UserCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Server,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Plan badge colors
const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-400",
  pro: "bg-blue-500/20 text-blue-400",
  enterprise: "bg-purple-500/20 text-purple-400",
  master: "bg-amber-500/20 text-amber-400",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Professional",
  enterprise: "Enterprise (기관)",
  master: "Master (Unlimited)",
};

export default function AdminUserDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const userId = parseInt(params.id || "0", 10);
  
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // Check RunPod API health
  const { data: healthData } = trpc.admin.checkRunPodHealth.useQuery();
  
  // Fetch user info from Manus DB
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = trpc.admin.getUser.useQuery(
    { userId },
    { enabled: userId > 0 }
  );
  
  // Fetch user stats from RunPod API
  const { data: runpodStats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getRunPodUserStats.useQuery(
    { userId },
    { enabled: userId > 0 }
  );
  
  // Fetch user verifications from RunPod API
  const { data: verificationsData, isLoading: verificationsLoading, refetch: refetchVerifications, error: verificationsError } = trpc.admin.getRunPodUserVerifications.useQuery(
    { 
      userId,
      page,
      limit,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { enabled: userId > 0 }
  );
  
  const user = userData;
  const verifications = verificationsData?.verifications || [];
  const totalPages = verificationsData?.totalPages || 1;
  const totalVerifications = verificationsData?.total || 0;
  
  const handleSearch = () => {
    setPage(1);
    refetchVerifications();
  };
  
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    refetchVerifications();
  };
  
  const handleRefreshAll = () => {
    refetchUser();
    refetchStats();
    refetchVerifications();
  };
  
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  };
  
  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const formatDuration = (ms: number | null | undefined) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  if (userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading user data...</div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!user) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setLocation("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div className="text-center py-8 text-muted-foreground">
            User not found
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/admin/users")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Detail</h1>
              <p className="text-muted-foreground">
                View user information and verification history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* RunPod API Status */}
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              {healthData?.connected ? (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  RunPod
                </span>
              ) : (
                <span className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Offline
                </span>
              )}
            </div>
            <Button variant="outline" onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </div>
                <div className="font-medium">{user.name || "Unknown"}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Plan</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                    {PLAN_LABELS[user.plan] || user.plan}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Usage</div>
                <div className="font-medium">
                  {user.usageCount} / {user.monthlyLimit === -1 ? "∞" : user.monthlyLimit}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </div>
                <div className="font-medium text-sm">{formatDate(user.createdAt)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Active
                </div>
                <div className="font-medium text-sm">{formatDate(user.lastSignedIn)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Statistics Cards - From RunPod API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileAudio className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : runpodStats?.totalVerifications || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Verifications</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <Bot className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : runpodStats?.observedCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Observed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <UserCheck className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : runpodStats?.notObservedCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Not Observed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Error State */}
        {verificationsError && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to fetch verifications from RunPod API: {verificationsError.message}</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Verification History - From RunPod API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileAudio className="h-5 w-5" />
              Verification History ({totalVerifications} total)
              <span className="text-xs text-muted-foreground font-normal ml-2">(RunPod Server)</span>
            </CardTitle>
            <CardDescription>
              View all verification records for this user from RunPod server
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Date Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From:</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">To:</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            
            {/* Verifications Table */}
            {verificationsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading verifications...
              </div>
            ) : verifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No verifications found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">ID</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">File</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Result</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Duration</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Size</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date (UTC)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map((v) => (
                        <tr key={v.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            #{v.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileAudio className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate max-w-[200px]" title={v.fileName}>
                                {v.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {v.verdict === "observed" ? (
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-red-500" />
                                <span className="text-red-500 text-sm font-medium">AI Observed</span>
                              </div>
                            ) : v.verdict === "not_observed" ? (
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-500" />
                                <span className="text-green-500 text-sm font-medium">Not Observed</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-sm px-2 py-1 rounded ${
                              v.status === "completed" ? "bg-green-500/20 text-green-500" :
                              v.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                              v.status === "processing" ? "bg-blue-500/20 text-blue-500" :
                              v.status === "failed" ? "bg-red-500/20 text-red-500" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {v.status || "unknown"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDuration(v.duration)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatFileSize(v.fileSize)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDate(v.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
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
                        onClick={() => setPage(p => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
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
