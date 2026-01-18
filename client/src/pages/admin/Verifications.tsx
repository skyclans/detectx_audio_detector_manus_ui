/**
 * Admin Verifications Page
 * 
 * Displays all verification records with filtering and export capabilities.
 * API: GET /api/admin/verifications
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
  Download,
  Bot,
  User,
  FileAudio
} from "lucide-react";

const API_BASE = "https://emjvw2an6oynf9-8000.proxy.runpod.net/api";

interface Verification {
  id: string;
  user_id: string;
  user_email: string;
  filename: string;
  verdict: string;
  cnn_score: number;
  exceeded_axes: string[];
  orientation: string;
  duration_sec: number;
  file_size: number;
  created_at: string;
}

interface VerificationsResponse {
  verifications: Verification[];
  count: number;
  total: number;
}

export default function AdminVerifications() {
  const [data, setData] = useState<VerificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchVerifications();
  }, [page, verdictFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      if (search) params.append("search", search);
      if (verdictFilter) params.append("verdict", verdictFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await fetch(`${API_BASE}/admin/verifications?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch verifications");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Use mock data for development
      setData({
        verifications: [
          {
            id: "6ffab5cf-934",
            user_id: "user_001",
            user_email: "user@example.com",
            filename: "741Hz Vibes.mp3",
            verdict: "AI signal evidence was observed.",
            cnn_score: 0.9987,
            exceeded_axes: ["CNN", "RECON_DIFF"],
            orientation: "enhanced",
            duration_sec: 234.24,
            file_size: 5614157,
            created_at: "2026-01-18T14:33:27",
          },
          {
            id: "abc123-456",
            user_id: "user_002",
            user_email: "pro@example.com",
            filename: "Original Song.wav",
            verdict: "No AI signal evidence observed.",
            cnn_score: 0.1234,
            exceeded_axes: [],
            orientation: "enhanced",
            duration_sec: 180.5,
            file_size: 32145678,
            created_at: "2026-01-19T09:15:00",
          },
          {
            id: "def789-012",
            user_id: "user_003",
            user_email: "enterprise@company.com",
            filename: "Podcast Episode 42.mp3",
            verdict: "No AI signal evidence observed.",
            cnn_score: 0.0521,
            exceeded_axes: [],
            orientation: "enhanced",
            duration_sec: 3600.0,
            file_size: 86400000,
            created_at: "2026-01-19T10:00:00",
          },
        ],
        count: 3,
        total: 659,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchVerifications();
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      const params = new URLSearchParams({ format });
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (verdictFilter) params.append("verdict", verdictFilter);

      const response = await fetch(`${API_BASE}/admin/verifications/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `verifications_export.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const isAIDetected = (verdict: string) => {
    return verdict.toLowerCase().includes("ai signal evidence was observed");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Verifications</h1>
          <p className="text-muted-foreground">View all verification records</p>
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
                <option value="">All Results</option>
                <option value="ai">AI Detected</option>
                <option value="human">Human Verified</option>
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
              <Button variant="outline" onClick={() => { 
                setSearch(""); 
                setVerdictFilter(""); 
                setStartDate("");
                setEndDate("");
                setPage(0); 
                fetchVerifications(); 
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verifications Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Verifications ({data?.total || 0} total)
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
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
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">File</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Result</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">CNN Score</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.verifications.map((v) => (
                        <tr key={v.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileAudio className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate max-w-[200px]" title={v.filename}>
                                {v.filename}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {v.user_email}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isAIDetected(v.verdict) ? (
                                <>
                                  <Bot className="h-4 w-4 text-red-500" />
                                  <span className="text-red-500 text-sm font-medium">AI Detected</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-4 w-4 text-green-500" />
                                  <span className="text-green-500 text-sm font-medium">Human</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-mono text-sm ${
                              v.cnn_score > 0.9 ? "text-red-500" : 
                              v.cnn_score > 0.5 ? "text-yellow-500" : "text-green-500"
                            }`}>
                              {(v.cnn_score * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDuration(v.duration_sec)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatFileSize(v.file_size)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(v.created_at).toLocaleDateString()}
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
