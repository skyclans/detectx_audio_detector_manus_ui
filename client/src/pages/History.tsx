import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Clock,
  Download,
  FileAudio,
  FileJson,
  FileSpreadsheet,
  FileText,
  LogIn,
  Trash2,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

const VERDICT_TEXTS = {
  observed: "AI signal evidence was observed.",
  not_observed: "AI signal evidence was not observed.",
} as const;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface VerificationRecord {
  id: number;
  fileName: string;
  fileSize: number;
  status: string;
  verdict: "observed" | "not_observed" | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  fileHash: string | null;
  duration: number | null;
  sampleRate: number | null;
  bitDepth: number | null;
  channels: number | null;
  codec: string | null;
  createdAt: Date;
}

// Export functions for each format
function exportToPDF(record: VerificationRecord) {
  const verdictText = record.verdict 
    ? VERDICT_TEXTS[record.verdict]
    : "Verification incomplete";
  
  // Create a simple text-based PDF content
  const content = `
DetectX Audio Verification Report
================================

File Information
----------------
Filename: ${record.fileName}
File Size: ${formatFileSize(record.fileSize)}
Duration: ${record.duration ? `${record.duration.toFixed(2)}s` : "N/A"}
Sample Rate: ${record.sampleRate ? `${record.sampleRate} Hz` : "N/A"}
Bit Depth: ${record.bitDepth ? `${record.bitDepth}-bit` : "N/A"}
Channels: ${record.channels ?? "N/A"}
Codec: ${record.codec ?? "N/A"}
SHA-256: ${record.fileHash ?? "N/A"}

Verification Result
-------------------
Status: ${record.status}
Verdict: ${verdictText}
CR-G Status: ${record.crgStatus ?? "N/A"}
Primary Exceeded Axis: ${record.primaryExceededAxis ?? "N/A"}

Generated: ${formatDate(new Date())}
  `.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${record.fileName.replace(/\.[^/.]+$/, "")}_report.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report exported as text file");
}

function exportToJSON(record: VerificationRecord) {
  const data = {
    fileInfo: {
      fileName: record.fileName,
      fileSize: record.fileSize,
      duration: record.duration,
      sampleRate: record.sampleRate,
      bitDepth: record.bitDepth,
      channels: record.channels,
      codec: record.codec,
      fileHash: record.fileHash,
    },
    verification: {
      status: record.status,
      verdict: record.verdict,
      verdictText: record.verdict ? VERDICT_TEXTS[record.verdict] : null,
      crgStatus: record.crgStatus,
      primaryExceededAxis: record.primaryExceededAxis,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      recordId: record.id,
      createdAt: record.createdAt,
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${record.fileName.replace(/\.[^/.]+$/, "")}_report.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report exported as JSON");
}

function exportToCSV(record: VerificationRecord) {
  // UTF-8 BOM for proper encoding
  const BOM = "\uFEFF";
  
  // Horizontal headers (column-based)
  const headers = [
    "Filename",
    "File Size",
    "Duration",
    "Sample Rate",
    "Bit Depth",
    "Channels",
    "Codec",
    "SHA-256",
    "Status",
    "Verdict",
    "CR-G Status",
    "Primary Exceeded Axis",
    "Created At",
  ];

  const values = [
    record.fileName,
    formatFileSize(record.fileSize),
    record.duration ? `${record.duration.toFixed(2)}s` : "N/A",
    record.sampleRate ? `${record.sampleRate} Hz` : "N/A",
    record.bitDepth ? `${record.bitDepth}-bit` : "N/A",
    record.channels?.toString() ?? "N/A",
    record.codec ?? "N/A",
    record.fileHash ?? "N/A",
    record.status,
    record.verdict ? VERDICT_TEXTS[record.verdict] : "N/A",
    record.crgStatus ?? "N/A",
    record.primaryExceededAxis ?? "N/A",
    formatDate(new Date(record.createdAt)),
  ];

  // Escape CSV values
  const escapeCSV = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csv = BOM + headers.map(escapeCSV).join(",") + "\n" + values.map(escapeCSV).join(",");
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${record.fileName.replace(/\.[^/.]+$/, "")}_report.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report exported as CSV");
}

function exportToMarkdown(record: VerificationRecord) {
  const verdictText = record.verdict 
    ? VERDICT_TEXTS[record.verdict]
    : "Verification incomplete";

  const md = `# DetectX Audio Verification Report

## File Information

| Property | Value |
|----------|-------|
| Filename | ${record.fileName} |
| File Size | ${formatFileSize(record.fileSize)} |
| Duration | ${record.duration ? `${record.duration.toFixed(2)}s` : "N/A"} |
| Sample Rate | ${record.sampleRate ? `${record.sampleRate} Hz` : "N/A"} |
| Bit Depth | ${record.bitDepth ? `${record.bitDepth}-bit` : "N/A"} |
| Channels | ${record.channels ?? "N/A"} |
| Codec | ${record.codec ?? "N/A"} |
| SHA-256 | \`${record.fileHash ?? "N/A"}\` |

## Verification Result

| Property | Value |
|----------|-------|
| Status | ${record.status} |
| Verdict | ${verdictText} |
| CR-G Status | ${record.crgStatus ?? "N/A"} |
| Primary Exceeded Axis | ${record.primaryExceededAxis ?? "N/A"} |

---

*Generated: ${formatDate(new Date())}*
`;

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${record.fileName.replace(/\.[^/.]+$/, "")}_report.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report exported as Markdown");
}

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data: verifications, isLoading } = trpc.verification.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  // Filter verifications by date range
  const filteredVerifications = useMemo(() => {
    if (!verifications) return [];
    if (!dateRange?.from) return verifications;
    
    return verifications.filter((v) => {
      const date = new Date(v.createdAt);
      const from = dateRange.from!;
      const to = dateRange.to || dateRange.from!;
      
      // Set time to start/end of day for comparison
      const startOfFrom = new Date(from);
      startOfFrom.setHours(0, 0, 0, 0);
      
      const endOfTo = new Date(to);
      endOfTo.setHours(23, 59, 59, 999);
      
      return date >= startOfFrom && date <= endOfTo;
    });
  }, [verifications, dateRange]);

  const deleteMutation = trpc.verification.delete.useMutation({
    onSuccess: () => {
      utils.verification.list.invalidate();
      toast.success("Verification record deleted");
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  const deleteAllMutation = trpc.verification.deleteAll.useMutation({
    onSuccess: () => {
      utils.verification.list.invalidate();
      toast.success("All verification records deleted");
    },
    onError: () => {
      toast.error("Failed to delete all records");
    },
  });

  const clearDateFilter = () => {
    setDateRange(undefined);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout title="History" subtitle="Verification records">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sign in to view your verification history.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In to Continue
          </Button>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout title="History" subtitle="Verification records">
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Recent Verifications</span>
          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 text-xs font-normal",
                    dateRange?.from && "text-primary"
                  )}
                >
                  <CalendarIcon className="w-3 h-3 mr-1.5" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Filter by date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Date Filter */}
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={clearDateFilter}
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* Record Count */}
            <span className="text-xs font-normal normal-case text-muted-foreground">
              {filteredVerifications.length} records
              {dateRange?.from && verifications && filteredVerifications.length !== verifications.length && (
                <span className="text-muted-foreground/50"> (filtered)</span>
              )}
            </span>

            {/* Delete All Button */}
            {verifications && verifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Records?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all
                      {verifications.length} verification records from your history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => deleteAllMutation.mutate()}
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className="forensic-panel-content">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !filteredVerifications || filteredVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dateRange?.from 
                  ? "No verification records in selected date range"
                  : "No verification records yet"
                }
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {dateRange?.from 
                  ? "Try adjusting the date filter"
                  : "Upload and verify audio files to see them here"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVerifications.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 bg-muted/20 rounded-md"
                >
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileAudio className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {v.fileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(v.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(new Date(v.createdAt))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {v.status === "completed" && v.verdict ? (
                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          v.verdict === "observed"
                            ? "bg-forensic-amber/20 text-forensic-amber"
                            : "bg-forensic-green/20 text-forensic-green"
                        }`}
                      >
                        {v.verdict === "observed" ? "Signal Observed" : "No Signal"}
                      </div>
                    ) : v.status === "processing" ? (
                      <div className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                        Processing
                      </div>
                    ) : v.status === "failed" ? (
                      <div className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive">
                        Failed
                      </div>
                    ) : (
                      <div className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        Pending
                      </div>
                    )}

                    {/* Multi-Format Download Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportToPDF(v as VerificationRecord)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToJSON(v as VerificationRecord)}>
                          <FileJson className="w-4 h-4 mr-2" />
                          Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToCSV(v as VerificationRecord)}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToMarkdown(v as VerificationRecord)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as Markdown
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: v.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ForensicLayout>
  );
}
