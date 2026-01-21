/**
 * Admin Verifications Page
 * 
 * Displays all verification records with filtering and export capabilities.
 * Uses tRPC for real database operations
 */

import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bot,
  UserCheck,
  FileAudio
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminVerifications() {
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch verifications using tRPC
  const { data, isLoading, refetch } = trpc.admin.getVerifications.useQuery({
    search: search || undefined,
    verdict: verdictFilter !== "all" ? verdictFilter : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate + "T23:59:59") : undefined,
    page,
    limit,
  });

  const verifications = data?.verifications || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleReset = () => {
    setSearch("");
    setVerdictFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
    refetch();
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

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Verifications</h1>
          <p className="text-muted-foreground">View all verification records ({total} total)</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by filename..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Results</option>
                <option value="observed">AI Observed</option>
                <option value="not_observed">Not Observed</option>
              </select>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
                placeholder="End Date"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Verification Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
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
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">File</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Result</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date (UTC)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map((v) => (
                        <tr key={v.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileAudio className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate max-w-[200px]" title={v.fileName}>
                                {v.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {v.userId}
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
                              <span className="text-muted-foreground text-sm">Pending</span>
                            )}
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
