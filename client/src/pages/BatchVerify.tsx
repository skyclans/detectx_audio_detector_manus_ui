import { useState, useCallback, useRef } from "react";
import { ForensicLayout } from "@/components/ForensicLayout";
import { BatchDropZone } from "@/components/BatchDropZone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Play,
  Square,
  Trash2,
  X,
  Download,
  FileAudio,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileType,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

// RunPod API URL
const DETECTX_API_URL = "https://emjvw2an6oynf9-8000.proxy.runpod.net/api";

type FileStatus = "waiting" | "processing" | "done" | "skipped" | "error";

interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  format: string;
  status: FileStatus;
  verdict?: string | null;
  duration?: number | null;
  errorMessage?: string;
  uploadProgress?: number;
  recordId?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFormatFromName(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  const map: Record<string, string> = {
    mp3: "MP3",
    wav: "WAV",
    flac: "FLAC",
    ogg: "OGG",
    m4a: "M4A",
  };
  return map[ext || ""] || ext?.toUpperCase() || "?";
}

function StatusBadge({ status, errorMessage }: { status: FileStatus; errorMessage?: string }) {
  const config = {
    waiting: { icon: Clock, label: "Waiting", className: "text-muted-foreground bg-muted/50" },
    processing: { icon: Loader2, label: "Processing", className: "text-forensic-cyan bg-forensic-cyan/10" },
    done: { icon: CheckCircle2, label: "Done", className: "text-forensic-green bg-forensic-green/10" },
    skipped: { icon: AlertTriangle, label: "Skipped", className: "text-amber-500 bg-amber-500/10" },
    error: { icon: XCircle, label: "Error", className: "text-red-500 bg-red-500/10" },
  };

  const { icon: Icon, label, className } = config[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium", className)}
      title={errorMessage}
    >
      <Icon className={cn("w-3 h-3", status === "processing" && "animate-spin")} />
      {label}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  if (!verdict) return <span className="text-xs text-muted-foreground">—</span>;

  const isAI = verdict.includes("was observed");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        isAI ? "text-red-400 bg-red-500/10" : "text-forensic-green bg-forensic-green/10"
      )}
    >
      {isAI ? "AI Detected" : "Human Verified"}
    </span>
  );
}

export default function BatchVerify() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [, setLocation] = useLocation();

  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const cancelRef = useRef(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Check plan access
  const userPlan = (user as any)?.plan || "free";
  const hasBatchAccess =
    userPlan === "studio" || userPlan === "enterprise" || userPlan === "master";

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const items: BatchFileItem[] = newFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      name: file.name,
      size: file.size,
      format: getFormatFromName(file.name),
      status: "waiting" as FileStatus,
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      if (isProcessing) return;
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [isProcessing]
  );

  const clearAll = useCallback(() => {
    if (isProcessing) return;
    setFiles([]);
    setProcessedCount(0);
  }, [isProcessing]);

  /**
   * Verify a single file via XMLHttpRequest (upload progress tracking)
   */
  const verifyFile = useCallback(
    (file: File): Promise<any> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.timeout = 300000; // 5 min

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, uploadProgress: pct } : f
              )
            );
          }
        });

        xhr.addEventListener("load", () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else if (xhr.status === 429) {
            reject(new Error("LIMIT_REACHED"));
          } else if (xhr.status === 401) {
            reject(new Error("UNAUTHORIZED"));
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.detail || `Server error: ${xhr.status}`));
            } catch {
              reject(new Error(`Server error: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          xhrRef.current = null;
          reject(new Error("Network error"));
        });
        xhr.addEventListener("abort", () => {
          xhrRef.current = null;
          reject(new Error("CANCELLED"));
        });
        xhr.addEventListener("timeout", () => {
          xhrRef.current = null;
          reject(new Error("Request timeout"));
        });

        const formData = new FormData();
        formData.append("file", file);

        xhr.open("POST", `${DETECTX_API_URL}/verify-audio?orientation=enhanced`);
        const token = localStorage.getItem("detectx_token");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    },
    []
  );

  /**
   * Start batch verification — process files sequentially
   */
  const startBatch = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use batch verification.");
      return;
    }

    const waitingFiles = files.filter((f) => f.status === "waiting");
    if (waitingFiles.length === 0) {
      toast.info("No files to process.");
      return;
    }

    setIsProcessing(true);
    cancelRef.current = false;
    setProcessedCount(0);

    let completed = 0;

    for (const item of waitingFiles) {
      if (cancelRef.current) break;

      // Mark as processing
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing" as FileStatus, uploadProgress: 0 } : f))
      );

      try {
        const result = await verifyFile(item.file);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "done" as FileStatus,
                  verdict: result.verdict || null,
                  duration: result.metadata?.duration || null,
                  uploadProgress: undefined,
                  recordId: result.record_id || undefined,
                }
              : f
          )
        );

        // Update usage info
        if (result.usage_info) {
          localStorage.setItem("detectx_usage_count", String(result.usage_info.usage_count));
          if (result.usage_info.monthly_limit !== undefined) {
            localStorage.setItem("detectx_mode_limit", String(result.usage_info.monthly_limit));
          }
          refreshUser();
        }
      } catch (err: any) {
        const msg = err.message || "Unknown error";

        if (msg === "LIMIT_REACHED") {
          // Stop batch — usage limit hit
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "error" as FileStatus, errorMessage: "Monthly limit reached", uploadProgress: undefined } : f
            )
          );
          toast.error("Monthly verification limit reached. Upgrade your plan for more.");
          break;
        }

        if (msg === "UNAUTHORIZED") {
          toast.error("Session expired. Please sign in again.");
          setLocation("/login");
          break;
        }

        if (msg === "CANCELLED") {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "waiting" as FileStatus, uploadProgress: undefined } : f
            )
          );
          break;
        }

        // Other errors — mark and continue
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "error" as FileStatus, errorMessage: msg, uploadProgress: undefined } : f
          )
        );
      }

      completed++;
      setProcessedCount(completed);
    }

    setIsProcessing(false);
    xhrRef.current = null;

    if (!cancelRef.current) {
      toast.success("Batch verification complete!");
    }
  }, [files, isAuthenticated, verifyFile, setLocation, refreshUser]);

  const cancelBatch = useCallback(() => {
    cancelRef.current = true;
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  }, []);

  // Counts (must be before export helpers that reference them)
  const totalFiles = files.length;
  const waitingCount = files.filter((f) => f.status === "waiting").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const skippedCount = files.filter((f) => f.status === "skipped").length;
  const aiCount = files.filter(
    (f) => f.status === "done" && f.verdict?.includes("was observed")
  ).length;
  const humanCount = files.filter(
    (f) => f.status === "done" && f.verdict && !f.verdict.includes("was observed")
  ).length;

  const progressPct = totalFiles > 0 ? ((doneCount + errorCount + skippedCount) / totalFiles) * 100 : 0;

  // ── Export helpers ──

  const batchTimestamp = new Date().toISOString();
  const batchDate = batchTimestamp.slice(0, 10);

  const getDoneFiles = useCallback(() => files.filter((f) => f.status === "done"), [files]);

  const escapeCSV = (v: string | number | null | undefined): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || /[^\x00-\x7F]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const verdictLabel = (v: string | null | undefined) =>
    !v ? "" : v.includes("was observed") ? "AI Detected" : "Human Verified";

  const verdictCode = (v: string | null | undefined) =>
    !v ? "" : v.includes("was observed") ? "AI_OBSERVED" : "AI_NOT_OBSERVED";

  const generateBatchCSV = useCallback(() => {
    const done = getDoneFiles();
    const headers = [
      "#", "Filename", "Format", "File Size (bytes)", "Duration (sec)",
      "Verdict", "Verdict Code", "Full Verdict Text",
      "Detection Mode", "Engine Version", "Analysis Timestamp",
    ];
    const rows = done.map((f, i) =>
      [
        i + 1,
        escapeCSV(f.name),
        escapeCSV(f.format),
        f.size,
        f.duration?.toFixed(1) || "",
        escapeCSV(verdictLabel(f.verdict)),
        escapeCSV(verdictCode(f.verdict)),
        escapeCSV(f.verdict),
        "Enhanced Mode",
        "v2.0",
        escapeCSV(batchTimestamp),
      ].join(",")
    );
    return headers.join(",") + "\n" + rows.join("\n");
  }, [getDoneFiles, batchTimestamp]);

  const generateBatchJSON = useCallback(() => {
    const done = getDoneFiles();
    const report = {
      reportVersion: "2.0.0",
      generatedAt: batchTimestamp,
      engine: { version: "v2.0", mode: "Enhanced Mode" },
      summary: {
        total: totalFiles,
        verified: doneCount,
        aiDetected: aiCount,
        humanVerified: humanCount,
        errors: errorCount,
        skipped: skippedCount,
      },
      results: done.map((f, i) => ({
        index: i + 1,
        filename: f.name,
        format: f.format,
        fileSize: f.size,
        duration: f.duration || null,
        verdict: f.verdict || null,
        verdictCode: verdictCode(f.verdict),
        verdictLabel: verdictLabel(f.verdict),
      })),
      disclaimer:
        "DetectX does not determine authorship, intent, or ownership. Audio with extensive post-processing may exhibit AI-like signal characteristics.",
    };
    return JSON.stringify(report, null, 2);
  }, [getDoneFiles, batchTimestamp, totalFiles, doneCount, aiCount, humanCount, errorCount, skippedCount]);

  const generateBatchMarkdown = useCallback(() => {
    const done = getDoneFiles();
    let md = `# DetectX Batch Verification Report\n\n`;
    md += `**Generated:** ${batchTimestamp}  \n`;
    md += `**Detection Mode:** Enhanced Mode  \n`;
    md += `**Engine Version:** v2.0\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Count |\n|--------|-------|\n`;
    md += `| Total Files | ${totalFiles} |\n`;
    md += `| AI Detected | ${aiCount} |\n`;
    md += `| Human Verified | ${humanCount} |\n`;
    md += `| Errors | ${errorCount} |\n`;
    md += `| Skipped | ${skippedCount} |\n\n`;
    md += `## Results\n\n`;
    md += `| # | Filename | Format | Size | Duration | Verdict |\n`;
    md += `|---|----------|--------|------|----------|---------|\n`;
    done.forEach((f, i) => {
      const dur = f.duration ? `${Math.floor(f.duration / 60)}:${String(Math.floor(f.duration % 60)).padStart(2, "0")}` : "—";
      md += `| ${i + 1} | ${f.name} | ${f.format} | ${formatFileSize(f.size)} | ${dur} | ${verdictLabel(f.verdict) || "—"} |\n`;
    });
    md += `\n## Disclaimer\n\n`;
    md += `> DetectX does not determine authorship, intent, or ownership.\n`;
    md += `> Audio with extensive post-processing, synthesis, or heavy digital manipulation may exhibit AI-like signal characteristics.\n\n`;
    md += `---\n\n*DetectX Audio AI Detector — Engine v2.0 (Enhanced Mode)*\n`;
    return md;
  }, [getDoneFiles, batchTimestamp, totalFiles, aiCount, humanCount, errorCount, skippedCount]);

  const generateBatchPDFHTML = useCallback(() => {
    const done = getDoneFiles();
    const rows = done
      .map(
        (f, i) =>
          `<tr><td>${i + 1}</td><td>${f.name}</td><td>${f.format}</td><td>${formatFileSize(f.size)}</td><td>${
            f.duration ? `${Math.floor(f.duration / 60)}:${String(Math.floor(f.duration % 60)).padStart(2, "0")}` : "—"
          }</td><td class="${f.verdict?.includes("was observed") ? "ai" : "human"}">${verdictLabel(f.verdict) || "—"}</td></tr>`
      )
      .join("\n");

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>DetectX Batch Report — ${batchDate}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#333}
  h1{color:#0d9488;border-bottom:2px solid #0d9488;padding-bottom:10px}
  h2{color:#555;margin-top:30px}
  table{width:100%;border-collapse:collapse;margin:20px 0}
  th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #ddd;font-size:13px}
  th{background:#f5f5f5}
  .summary-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin:20px 0}
  .summary-item{text-align:center;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
  .summary-item .num{font-size:28px;font-weight:bold}
  .summary-item .label{font-size:11px;text-transform:uppercase;color:#888;margin-top:4px}
  .ai{color:#ef4444;font-weight:600}
  .human{color:#22c55e;font-weight:600}
  .footer{margin-top:40px;font-size:12px;color:#888;border-top:1px solid #ddd;padding-top:20px}
  .disclaimer{background:#fefce8;border:1px solid #fef08a;border-radius:4px;padding:12px;margin-top:20px;font-size:13px}
</style></head><body>
<h1>DetectX Batch Verification Report</h1>
<p><strong>Generated:</strong> ${batchTimestamp}</p>
<p><strong>Detection Mode:</strong> Enhanced Mode &nbsp;|&nbsp; <strong>Engine:</strong> v2.0</p>
<h2>Summary</h2>
<div class="summary-grid">
  <div class="summary-item"><div class="num">${totalFiles}</div><div class="label">Total</div></div>
  <div class="summary-item"><div class="num ai">${aiCount}</div><div class="label">AI Detected</div></div>
  <div class="summary-item"><div class="num human">${humanCount}</div><div class="label">Human Verified</div></div>
  <div class="summary-item"><div class="num" style="color:#ef4444">${errorCount}</div><div class="label">Errors</div></div>
  <div class="summary-item"><div class="num" style="color:#f59e0b">${skippedCount}</div><div class="label">Skipped</div></div>
</div>
<h2>Results</h2>
<table><thead><tr><th>#</th><th>Filename</th><th>Format</th><th>Size</th><th>Duration</th><th>Verdict</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="disclaimer"><strong>Disclaimer:</strong> DetectX does not determine authorship, intent, or ownership. Audio with extensive post-processing may exhibit AI-like signal characteristics.</div>
<div class="footer"><p>DetectX Audio AI Detector — Engine v2.0 (Enhanced Mode)</p></div>
</body></html>`;
  }, [getDoneFiles, batchTimestamp, batchDate, totalFiles, aiCount, humanCount, errorCount, skippedCount]);

  // ── Download functions ──

  const downloadBlob = (content: string, filename: string, mime: string, bom = false) => {
    const blob = new Blob([bom ? "\uFEFF" + content : content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = useCallback(() => {
    downloadBlob(generateBatchCSV(), `DetectX_Batch_${batchDate}.csv`, "text/csv", true);
  }, [generateBatchCSV, batchDate]);

  const handleExportJSON = useCallback(() => {
    downloadBlob(generateBatchJSON(), `DetectX_Batch_${batchDate}.json`, "application/json");
  }, [generateBatchJSON, batchDate]);

  const handleExportMarkdown = useCallback(() => {
    downloadBlob(generateBatchMarkdown(), `DetectX_Batch_${batchDate}.md`, "text/markdown");
  }, [generateBatchMarkdown, batchDate]);

  const handleExportPDF = useCallback(() => {
    const html = generateBatchPDFHTML();
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  }, [generateBatchPDFHTML]);

  const handleDownloadAllZip = useCallback(async () => {
    const zip = new JSZip();
    const prefix = `DetectX_Batch_${batchDate}`;
    zip.file(`${prefix}.csv`, "\uFEFF" + generateBatchCSV());
    zip.file(`${prefix}.json`, generateBatchJSON());
    zip.file(`${prefix}.md`, generateBatchMarkdown());
    zip.file(`${prefix}.html`, generateBatchPDFHTML());

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [batchDate, generateBatchCSV, generateBatchJSON, generateBatchMarkdown, generateBatchPDFHTML]);

  // Plan gate
  if (isAuthenticated && !hasBatchAccess) {
    return (
      <ForensicLayout title="Batch Verification" subtitle="Process multiple audio files at once">
        <div className="max-w-lg mx-auto mt-12">
          <div className="forensic-panel">
            <div className="forensic-panel-header flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Batch Processing — Studio Plan Required
            </div>
            <div className="forensic-panel-content text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Batch processing is available on the Studio ($399/mo) and Enterprise plans.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Process up to 1,000 audio files per month with sequential verification, skip-on-error, and CSV export.
              </p>
              <Button onClick={() => setLocation("/plan")}>View Plans</Button>
            </div>
          </div>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout title="Batch Verification" subtitle="Process multiple audio files at once">
      <div className="max-w-5xl space-y-6">
        {/* Drop Zone */}
        <BatchDropZone
          onFilesAdded={handleFilesAdded}
          disabled={isProcessing}
          fileCount={totalFiles}
        />

        {/* File Queue */}
        {totalFiles > 0 && (
          <div className="forensic-panel">
            <div className="forensic-panel-header flex items-center justify-between">
              <span>File Queue ({totalFiles} files)</span>
              {!isProcessing && (
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
            <div className="forensic-panel-content p-0">
              {/* Controls Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  {!isProcessing ? (
                    <Button
                      size="sm"
                      onClick={startBatch}
                      disabled={waitingCount === 0}
                      className="bg-forensic-cyan hover:bg-forensic-cyan/90 text-background"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Verify All ({waitingCount})
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={cancelBatch}>
                      <Square className="w-3.5 h-3.5 mr-1.5" />
                      Stop
                    </Button>
                  )}

                  {doneCount > 0 && !isProcessing && (
                    <Button size="sm" variant="outline" onClick={handleDownloadAllZip}>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export All (ZIP)
                    </Button>
                  )}
                </div>

                {isProcessing && (
                  <span className="text-xs text-muted-foreground">
                    Processing {processedCount + 1} / {waitingCount + processedCount}...
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {(isProcessing || doneCount > 0) && (
                <div className="px-4 py-2 border-b border-border/30">
                  <Progress value={progressPct} className="h-2" />
                </div>
              )}

              {/* File List */}
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background border-b border-border/30">
                    <tr>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium w-8">#</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Filename</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium w-16">Format</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium w-20">Size</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium w-24">Status</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium w-28">Verdict</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "border-b border-border/10 hover:bg-muted/20 transition-colors",
                          item.status === "processing" && "bg-forensic-cyan/5"
                        )}
                      >
                        <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileAudio className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="truncate max-w-[300px] text-foreground">{item.name}</span>
                          </div>
                          {/* Upload progress bar inline */}
                          {item.status === "processing" && item.uploadProgress !== undefined && item.uploadProgress < 100 && (
                            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden max-w-[300px]">
                              <div
                                className="h-full bg-forensic-cyan transition-all"
                                style={{ width: `${item.uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{item.format}</td>
                        <td className="px-4 py-2 text-muted-foreground">{formatFileSize(item.size)}</td>
                        <td className="px-4 py-2">
                          <StatusBadge status={item.status} errorMessage={item.errorMessage} />
                        </td>
                        <td className="px-4 py-2">
                          <VerdictBadge verdict={item.verdict} />
                        </td>
                        <td className="px-4 py-2">
                          {!isProcessing && item.status !== "processing" && (
                            <button
                              onClick={() => removeFile(item.id)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Remove"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary + Export */}
        {doneCount + errorCount + skippedCount > 0 && !isProcessing && (
          <>
            <div className="forensic-panel">
              <div className="forensic-panel-header">Results Summary</div>
              <div className="forensic-panel-content">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalFiles}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{aiCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Detected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-forensic-green">{humanCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Human Verified</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Errors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">{skippedCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Skipped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Report */}
            {doneCount > 0 && (
              <div className="forensic-panel">
                <div className="forensic-panel-header">Export Report</div>
                <div className="forensic-panel-content">
                  <Button
                    className="w-full mb-4 bg-forensic-cyan hover:bg-forensic-cyan/90 text-black font-medium"
                    onClick={handleDownloadAllZip}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All (ZIP)
                  </Button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={handleExportCSV}
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      <span className="text-xs">CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={handleExportJSON}
                    >
                      <FileJson className="w-5 h-5" />
                      <span className="text-xs">JSON</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={handleExportMarkdown}
                    >
                      <FileText className="w-5 h-5" />
                      <span className="text-xs">Markdown</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={handleExportPDF}
                    >
                      <FileType className="w-5 h-5" />
                      <span className="text-xs">PDF</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ForensicLayout>
  );
}
