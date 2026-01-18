/**
 * History Page - Verification History with Server Integration
 *
 * Enhanced Mode: Classifier Engine + Reconstruction Engine
 * Connects to server History API for verification records.
 * Includes calendar-based date range filtering.
 */

import { ForensicLayout } from "@/components/ForensicLayout";
import {
  FileAudio,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://emjvw2an6oynf9-8001.proxy.runpod.net/api";

interface HistoryRecord {
  id: string;
  verification_id: string;
  user_id: string | null;
  original_filename: string;
  verdict: string;
  cnn_score: number | null;
  exceeded_axes: string[];
  orientation: string;
  duration_sec: number | null;
  sample_rate: number | null;
  geometry_exceeded: boolean | null;
  reconstruction_diff_exceeded: boolean | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface HistoryStats {
  total_verifications: number;
  ai_detected: number;
  human_detected: number;
  by_orientation: Record<string, number>;
}

interface HistoryResponse {
  history: HistoryRecord[];
  count: number;
  total: number;
}

// Mini Calendar Component
function MiniCalendar({
  selectedDate,
  onSelect,
  onClose,
  minDate,
  maxDate,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [viewDate]);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
    return false;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border rounded-lg shadow-lg p-3 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
          className="p-1 hover:bg-muted/50 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
          className="p-1 hover:bg-muted/50 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, i) => (
          <div key={i} className="aspect-square">
            {date ? (
              <button
                onClick={() => {
                  if (!isDateDisabled(date)) {
                    onSelect(date);
                    onClose();
                  }
                }}
                disabled={isDateDisabled(date)}
                className={`w-full h-full text-xs rounded flex items-center justify-center transition-colors
                  ${isDateDisabled(date) ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-muted/50"}
                  ${isSelected(date) ? "bg-primary text-primary-foreground" : ""}
                  ${isToday(date) && !isSelected(date) ? "border border-primary" : ""}
                `}
              >
                {date.getDate()}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-2 pt-2 border-t border-border flex gap-2">
        <button
          onClick={() => {
            onSelect(new Date());
            onClose();
          }}
          className="flex-1 text-xs py-1 px-2 bg-muted/50 hover:bg-muted rounded"
        >
          Today
        </button>
        <button
          onClick={onClose}
          className="flex-1 text-xs py-1 px-2 bg-muted/50 hover:bg-muted rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Date Range Picker Component
function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onClear,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onStartChange: (date: Date | null) => void;
  onEndChange: (date: Date | null) => void;
  onClear: () => void;
}) {
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasDateFilter = startDate || endDate;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="w-4 h-4 text-muted-foreground" />

      {/* Start Date */}
      <div className="relative">
        <button
          onClick={() => {
            setShowStartCal(!showStartCal);
            setShowEndCal(false);
          }}
          className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
            startDate
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-background border-border hover:bg-muted/50"
          }`}
        >
          {formatDisplayDate(startDate)}
        </button>
        {showStartCal && (
          <MiniCalendar
            selectedDate={startDate}
            onSelect={(date) => onStartChange(date)}
            onClose={() => setShowStartCal(false)}
            maxDate={endDate || undefined}
          />
        )}
      </div>

      <span className="text-muted-foreground text-xs">to</span>

      {/* End Date */}
      <div className="relative">
        <button
          onClick={() => {
            setShowEndCal(!showEndCal);
            setShowStartCal(false);
          }}
          className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
            endDate
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-background border-border hover:bg-muted/50"
          }`}
        >
          {formatDisplayDate(endDate)}
        </button>
        {showEndCal && (
          <MiniCalendar
            selectedDate={endDate}
            onSelect={(date) => onEndChange(date)}
            onClose={() => setShowEndCal(false)}
            minDate={startDate || undefined}
          />
        )}
      </div>

      {/* Clear button */}
      {hasDateFilter && (
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-muted/50 rounded transition-colors text-muted-foreground hover:text-foreground"
          title="Clear date filter"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Quick presets */}
      <div className="flex gap-1 ml-2">
        <button
          onClick={() => {
            const today = new Date();
            onStartChange(today);
            onEndChange(today);
          }}
          className="px-2 py-1 text-xs bg-muted/30 hover:bg-muted/50 rounded transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            onStartChange(weekAgo);
            onEndChange(today);
          }}
          className="px-2 py-1 text-xs bg-muted/30 hover:bg-muted/50 rounded transition-colors"
        >
          7 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            onStartChange(monthAgo);
            onEndChange(today);
          }}
          className="px-2 py-1 text-xs bg-muted/30 hover:bg-muted/50 rounded transition-colors"
        >
          30 Days
        </button>
      </div>
    </div>
  );
}

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<"all" | "ai" | "human">("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const pageSize = 20;

  const formatApiDate = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(page * pageSize),
      });

      if (startDate) {
        params.append("start_date", formatApiDate(startDate)!);
      }
      if (endDate) {
        params.append("end_date", formatApiDate(endDate)!);
      }

      const response = await fetch(`${API_BASE}/history?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }
      const data: HistoryResponse = await response.json();
      setHistory(data.history);
      setTotalCount(data.total || data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/history/stats`);
      if (response.ok) {
        const data: HistoryStats = await response.json();
        setStats(data);
      }
    } catch {
      // Stats are optional, don't show error
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [fetchHistory, fetchStats]);

  // Reset page when date filter changes
  useEffect(() => {
    setPage(0);
  }, [startDate, endDate]);

  const filteredHistory = history.filter((record) => {
    const matchesSearch =
      searchTerm === "" ||
      record.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.verification_id.toLowerCase().includes(searchTerm.toLowerCase());

    const isAI = record.verdict.includes("was observed");
    const matchesVerdict =
      filterVerdict === "all" ||
      (filterVerdict === "ai" && isAI) ||
      (filterVerdict === "human" && !isAI);

    return matchesSearch && matchesVerdict;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getVerdictBadge = (verdict: string) => {
    const isAI = verdict.includes("was observed");
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          isAI
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-green-500/20 text-green-400 border border-green-500/30"
        }`}
      >
        {isAI ? "AI Observed" : "AI Not Observed"}
      </span>
    );
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = [
      "Verification ID",
      "Filename",
      "Verdict",
      "CNN Score",
      "Duration",
      "Mode",
      "Date",
    ];

    const rows = filteredHistory.map((record) => [
      record.verification_id,
      record.original_filename,
      record.verdict.includes("was observed") ? "AI_OBSERVED" : "AI_NOT_OBSERVED",
      record.cnn_score?.toFixed(4) ?? "",
      formatDuration(record.duration_sec),
      record.orientation,
      formatDate(record.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `detectx_history_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <ForensicLayout>
      <div className="space-y-4">
        {/* Stats Panel */}
        {stats && (
          <div className="forensic-panel">
            <div className="forensic-panel-header flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              Verification Statistics
            </div>
            <div className="forensic-panel-content">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.total_verifications}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Verifications</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">
                    {stats.ai_detected}
                  </div>
                  <div className="text-xs text-muted-foreground">AI Detected</div>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.human_detected}
                  </div>
                  <div className="text-xs text-muted-foreground">Human Verified</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.total_verifications > 0
                      ? ((stats.ai_detected / stats.total_verifications) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">AI Detection Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="forensic-panel">
          <div className="forensic-panel-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              Verification History
              {(startDate || endDate) && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                  Date Filtered
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchHistory}
                className="p-1.5 hover:bg-muted/50 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 hover:bg-muted/50 rounded transition-colors"
                title="Export CSV"
                disabled={filteredHistory.length === 0}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="forensic-panel-content">
            {/* Date Range Picker */}
            <div className="mb-4 pb-4 border-b border-border">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                onClear={handleClearDateFilter}
              />
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by filename or verification ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filterVerdict}
                  onChange={(e) => setFilterVerdict(e.target.value as "all" | "ai" | "human")}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Results</option>
                  <option value="ai">AI Detected</option>
                  <option value="human">Human Verified</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || filterVerdict !== "all" || startDate || endDate
                  ? "No records match your search criteria."
                  : "No verification history found."}
              </div>
            )}

            {/* Table */}
            {!loading && filteredHistory.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        File
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Verdict
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">
                        CNN Score
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">
                        Duration
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden lg:table-cell">
                        Mode
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]">
                              {record.original_filename}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {record.verification_id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3">{getVerdictBadge(record.verdict)}</td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          {record.cnn_score !== null ? (
                            <span
                              className={`font-mono ${
                                record.cnn_score >= 0.9
                                  ? "text-green-400"
                                  : record.cnn_score >= 0.5
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(record.cnn_score * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          {formatDuration(record.duration_sec)}
                        </td>
                        <td className="py-2 px-3 hidden lg:table-cell">
                          <span className="text-xs bg-muted/50 px-2 py-1 rounded capitalize">
                            {record.orientation}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">
                          {formatDate(record.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages} ({totalCount} total)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 hover:bg-muted/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 hover:bg-muted/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="forensic-panel">
          <div className="forensic-panel-content">
            <div className="text-xs text-muted-foreground">
              <strong>Enhanced Mode v2.0</strong> — Classifier Engine (CNN trained on
              30,000,000+ verified human samples) + Reconstruction Engine (Stem separation
              analysis). History records are stored securely and can be exported for
              institutional reporting.
            </div>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
