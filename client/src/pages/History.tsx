/**
 * History Page - Verification History with Server Integration
 *
 * Enhanced Mode: DetectX Engine v3 + Reconstruction Engine
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
  FileDown,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://emjvw2an6oynf9-8000.proxy.runpod.net/api";

const ENGINE_VERSION = "v3";
const ENGINE_MODE = "Enhanced Mode";

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

// ============================================================
// Client-side export helpers (matches verify-audio ExportPanel format)
// ============================================================

function formatDurationExport(seconds: number | null): string {
  if (seconds === null) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function sanitizeFileName(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "").replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").substring(0, 100);
  return base || "unknown";
}

function downloadFile(content: string, filename: string, mimeType: string, addBOM = false) {
  const blob = new Blob(
    [addBOM ? "\uFEFF" + content : content],
    { type: `${mimeType};charset=utf-8` }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Print HTML via hidden iframe (no new tab) */
function printViaIframe(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

const DETECTX_LOGO_BASE64 = "data:image/png;base64,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";

function generateRecordPDF(record: HistoryRecord): string {
  const isAI = record.verdict.includes("was observed");
  const verdictText = record.verdict;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DetectX_${sanitizeFileName(record.original_filename)}</title>
  <style>
    @page { size: A4; margin: 15mm 20mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #333; font-size: 11px; line-height: 1.4; padding: 0; }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px; }
    .header img { width: 36px; height: 36px; }
    .header h1 { font-size: 18px; color: #0d9488; margin: 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 4px 24px; margin-bottom: 10px; font-size: 10px; color: #666; }
    h2 { font-size: 12px; color: #555; margin: 10px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { padding: 5px 8px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 11px; }
    th { background: #f5f5f5; width: 140px; font-weight: 600; }
    .verdict { font-size: 14px; padding: 10px 14px; background: #f0fdf4; border-left: 4px solid #22c55e; margin: 8px 0; }
    .verdict.observed { background: #fef3c7; border-left-color: #f59e0b; }
    .verdict strong { font-size: 13px; }
    .desc { font-size: 10px; color: #555; margin-bottom: 10px; }
    .engine-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; }
    .engine-item { margin: 3px 0; font-size: 10px; }
    .disclaimer { background: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 8px 10px; font-size: 9px; color: #666; margin-bottom: 8px; }
    .footer { font-size: 9px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 6px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${DETECTX_LOGO_BASE64}" alt="DetectX" />
    <h1>DetectX Audio Verification Report</h1>
  </div>

  <div class="meta">
    <span><strong>Generated:</strong> ${new Date().toLocaleString()}</span>
    <span><strong>ID:</strong> ${record.verification_id}</span>
    <span><strong>Mode:</strong> ${ENGINE_MODE}</span>
    <span><strong>Engine:</strong> ${ENGINE_VERSION}</span>
  </div>

  <h2>File Information</h2>
  <table>
    <tr><th>Filename</th><td>${record.original_filename}</td></tr>
    <tr><th>Duration</th><td>${formatDurationExport(record.duration_sec)}</td></tr>
    <tr><th>Sample Rate</th><td>${record.sample_rate ? `${record.sample_rate} Hz` : "N/A"}</td></tr>
    <tr><th>Mode</th><td style="text-transform: capitalize;">${record.orientation}</td></tr>
  </table>

  <h2>Verification Result</h2>
  <div class="verdict ${isAI ? "observed" : ""}">
    <strong>${verdictText}</strong>
  </div>
  <p class="desc">${!isAI
    ? "This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system. DetectX Engine v3 (trained on millions of verified human music samples) determined that no AI signal evidence was observed."
    : "This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system. AI signal evidence was observed in the audio signal."
  }</p>

  <h2>Verification Engine Details</h2>
  <div class="engine-box">
    <div class="engine-item"><strong>DetectX Engine v3 (Primary):</strong> Deep learning classifier optimized for human protection</div>
    <div class="engine-item"><strong>Reconstruction Engine (Secondary):</strong> Stem separation and reconstruction analysis</div>
    <div class="engine-item"><strong>Human False Positive Rate:</strong> Less than 1%</div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> DetectX does not determine authorship, intent, or ownership.
    This verification is based solely on structural signal observations.
    Audio with extensive post-processing, synthesis, or heavy digital manipulation
    may exhibit signal characteristics similar to AI-generated music.
  </div>

  <div class="footer">
    DetectX Audio AI Detector &mdash; Engine ${ENGINE_VERSION} (${ENGINE_MODE}) &bull; detectx.app
  </div>
</body>
</html>`;
}

function generateRecordJSON(record: HistoryRecord): string {
  const isAI = record.verdict.includes("was observed");
  const report = {
    reportVersion: "3.0.0",
    generatedAt: new Date().toISOString(),
    engine: {
      version: ENGINE_VERSION,
      mode: ENGINE_MODE,
      classifierEngine: {
        name: "DetectX Engine v3",
        role: "Primary",
        description: "Trained on millions of verified human samples",
      },
      reconstructionEngine: {
        name: "Reconstruction Engine",
        role: "Secondary",
        description: "Stem separation and reconstruction analysis",
      },
      humanFpRate: "<1%",
    },
    file: {
      name: record.original_filename,
      duration: record.duration_sec,
      sampleRate: record.sample_rate,
    },
    verification: {
      id: record.verification_id,
      verdict: record.verdict,
      verdictCode: isAI ? "AI_OBSERVED" : "AI_NOT_OBSERVED",
      mode: record.orientation,
      exceededAxes: record.exceeded_axes,
    },
    disclaimer: "DetectX does not determine authorship, intent, or ownership.",
  };
  return JSON.stringify(report, null, 2);
}

function generateRecordMarkdown(record: HistoryRecord): string {
  const isAI = record.verdict.includes("was observed");
  const emoji = !isAI ? "\u{1F7E2}" : "\u{1F534}";

  return `# DetectX Audio Verification Report

**Generated:** ${new Date().toLocaleString()}
**Verification ID:** ${record.verification_id}
**Detection Mode:** ${ENGINE_MODE}
**Engine Version:** ${ENGINE_VERSION}

## File Information

| Field | Value |
|-------|-------|
| Filename | ${record.original_filename} |
| Duration | ${formatDurationExport(record.duration_sec)} |
| Sample Rate | ${record.sample_rate ? `${record.sample_rate} Hz` : "N/A"} |
| Mode | ${record.orientation} |

## Verification Result

> ${emoji} **${record.verdict}**

${!isAI
    ? `This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
DetectX Engine v3 (trained on millions of verified human music samples) determined that no AI signal evidence was observed.`
    : `This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
AI signal evidence was observed in the audio signal.`}

## Engine Details

- **DetectX Engine v3 (Primary):** Deep learning classifier optimized for human protection
- **Reconstruction Engine (Secondary):** Stem separation and reconstruction analysis
- **Human False Positive Rate:** Less than 1%

---
*DetectX does not determine authorship, intent, or ownership.*
*DetectX Audio AI Detector — Engine ${ENGINE_VERSION} (${ENGINE_MODE})*
`;
}

function generateRecordCSV(record: HistoryRecord): string {
  const escapeCSV = (v: string | number | null | undefined): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || /[^\x00-\x7F]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const isAI = record.verdict.includes("was observed");
  const headers = [
    "Verification ID", "Filename", "Duration (sec)", "Sample Rate (Hz)",
    "Verdict", "Verdict Code", "Mode", "Detection Mode", "Engine Version", "Generated",
  ];
  const values = [
    escapeCSV(record.verification_id),
    escapeCSV(record.original_filename),
    record.duration_sec ?? "",
    record.sample_rate ?? "",
    escapeCSV(record.verdict),
    isAI ? "AI_OBSERVED" : "AI_NOT_OBSERVED",
    escapeCSV(record.orientation),
    escapeCSV(ENGINE_MODE),
    escapeCSV(ENGINE_VERSION),
    escapeCSV(new Date().toISOString()),
  ];

  return headers.join(",") + "\n" + values.join(",");
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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
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
  const [openExportId, setOpenExportId] = useState<string | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setOpenExportId(null);
      }
    };
    if (openExportId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openExportId]);

  const handleExportSingle = (recordId: string, format: string) => {
    const record = filteredHistory.find(r => r.id === recordId) || history.find(r => r.id === recordId);
    if (!record) return;

    const baseName = sanitizeFileName(record.original_filename);

    if (format === "pdf") {
      printViaIframe(generateRecordPDF(record));
    } else if (format === "json") {
      downloadFile(generateRecordJSON(record), `DetectX_${baseName}.json`, "application/json");
    } else if (format === "markdown") {
      downloadFile(generateRecordMarkdown(record), `DetectX_${baseName}.md`, "text/markdown");
    } else if (format === "csv") {
      downloadFile(generateRecordCSV(record), `DetectX_${baseName}.csv`, "text/csv", true);
    }

    setOpenExportId(null);
  };

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
      
      // Get JWT token for Bearer authentication (user_id removed - server identifies user from JWT)
      const token = localStorage.getItem("detectx_token");
      
      const response = await fetch(`${API_BASE}/history?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
      // Get JWT token for Bearer authentication
      const token = localStorage.getItem("detectx_token");
      const response = await fetch(`${API_BASE}/history/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
    // Server stores UTC without "Z" suffix — append it so JS converts to local time
    const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
    const date = new Date(utcStr);
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
      "DetectX Score",
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <ForensicLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ForensicLayout>
    );
  }

  // Show login prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <ForensicLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center justify-center py-10 px-12 border border-border rounded-2xl bg-muted/30 max-w-md">
            <Lock className="w-12 h-12 mb-5 text-primary" />
            <h3 className="text-xl font-semibold mb-3">Please sign in to continue</h3>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              Sign in to view your verification history.
            </p>
            <Button size="lg" onClick={() => {
              // Set returnUrl cookie so OAuth callback knows where to redirect
              document.cookie = "returnUrl=/history; path=/; max-age=300";
              window.location.href = "/api/auth/google";
            }}>
              Sign in with Google
            </Button>
          </div>
        </div>
      </ForensicLayout>
    );
  }

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
                        DetectX Score
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
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground w-10">
                        Export
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
                        <td className="py-2 px-3 text-center">
                          <div className="relative" ref={openExportId === record.id ? exportDropdownRef : undefined}>
                            <button
                              onClick={() => setOpenExportId(openExportId === record.id ? null : record.id)}
                              className="p-1.5 hover:bg-muted/50 rounded transition-colors text-muted-foreground hover:text-foreground"
                              title="Export"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            {openExportId === record.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg py-1 w-32">
                                {[
                                  { format: "pdf", label: "PDF", ext: ".pdf" },
                                  { format: "markdown", label: "Markdown", ext: ".md" },
                                  { format: "json", label: "JSON", ext: ".json" },
                                  { format: "csv", label: "CSV", ext: ".csv" },
                                ].map(({ format, label, ext }) => (
                                  <button
                                    key={format}
                                    onClick={() => handleExportSingle(record.id, format)}
                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors flex items-center justify-between"
                                  >
                                    <span>{label}</span>
                                    <span className="text-muted-foreground">{ext}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
              <strong>Enhanced Mode v3</strong> — DetectX Engine v3 (trained on
              millions of verified human samples) + Reconstruction Engine (Stem separation
              analysis). History records are stored securely and can be exported for
              institutional reporting.
            </div>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
