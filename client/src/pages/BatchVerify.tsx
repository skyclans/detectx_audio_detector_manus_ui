import { useState, useCallback, useRef } from "react";
import { ForensicLayout } from "@/components/ForensicLayout";
import SEO from "@/components/SEO";
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
import { cn, toLocalTimestamp } from "@/lib/utils";
import JSZip from "jszip";
import {
  formatStrengthSummary,
  strengthLabel,
  type Strength,
  type ReconMetricEnriched,
  type StrengthSummary,
} from "@/lib/recon_strength";

const DETECTX_API_URL = (import.meta.env.VITE_DETECTX_API_URL
  || "https://detectx.app") + "/api";

type FileStatus = "waiting" | "processing" | "done" | "skipped" | "error";

/** Lightweight RECON aggregate kept just for the count chip + v2 confidence. */
interface ReconMetricsLite {
  ai_signals?: number | null;
  v2_confidence?: number | null;
}

interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  format: string;
  status: FileStatus;
  verdict?: string | null;
  duration?: number | null;
  cnnScore?: number | null;
  finalScore?: number | null;
  finalScoreSource?: string | null;
  /** Server-computed tier label (human | mixed-human | mixed-ai | ai). */
  tier?: string | null;
  reconMetrics?: ReconMetricsLite | null;
  reconMetricsEnriched?: ReconMetricEnriched[] | null;
  strengthSummary?: StrengthSummary | null;
  errorMessage?: string;
  uploadProgress?: number;
  recordId?: string;
}

type VerdictTier = "human" | "mixed-human" | "mixed-ai" | "ai" | "unknown";

function deriveTier(item: BatchFileItem): VerdictTier {
  // Tier is server-authoritative. The bundle never compares cnn_score
  // against the band boundary values.
  const t = item.tier;
  if (t === "human" || t === "mixed-human" || t === "mixed-ai" || t === "ai") return t;
  const v = item.verdict;
  if (!v) return "unknown";
  return v.includes("was observed") ? "ai" : "human";
}

function tierLabel(tier: VerdictTier): string {
  switch (tier) {
    case "human":       return "AI Signal Not Observed";
    case "mixed-human": return "AI Signal Not Observed — Recovered by Deep Scan";
    case "mixed-ai":    return "AI Signal Observed — Confirmed by Deep Scan";
    case "ai":          return "AI Signal Observed";
    case "unknown":     return "Pending";
  }
}

function tierCode(tier: VerdictTier): string {
  switch (tier) {
    case "human":       return "AI_NOT_OBSERVED";
    case "mixed-human": return "AI_NOT_OBSERVED_RECOVERED";
    case "mixed-ai":    return "AI_OBSERVED_CONFIRMED";
    case "ai":          return "AI_OBSERVED";
    case "unknown":     return "PENDING";
  }
}

function computeFileStrengths(item: BatchFileItem): StrengthSummary | null {
  return item.strengthSummary ?? null;
}

function displayScoreOf(item: BatchFileItem): number | null {
  if (item.finalScore != null) return item.finalScore;
  return item.cnnScore ?? null;
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

function VerdictBadge({ item }: { item: BatchFileItem }) {
  if (!item.verdict) return <span className="text-xs text-muted-foreground">—</span>;
  const tier = deriveTier(item);
  const score = displayScoreOf(item);
  const pct = score != null ? `${(score * 100).toFixed(1)}%` : null;
  const config: Record<VerdictTier, { label: string; cls: string; sub?: string }> = {
    "ai":           { label: "AI Detected",        cls: "text-red-400 bg-red-500/10 border border-red-500/30" },
    "mixed-ai":     { label: "AI (Deep Scan)",     cls: "text-amber-400 bg-amber-500/10 border border-amber-500/30", sub: "confirmed" },
    "mixed-human":  { label: "Human (Deep Scan)",  cls: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30", sub: "recovered" },
    "human":        { label: "Human Verified",     cls: "text-forensic-green bg-forensic-green/10 border border-emerald-700/30" },
    "unknown":      { label: "Pending",            cls: "text-muted-foreground bg-muted/30 border border-border/30" },
  };
  const { label, cls, sub } = config[tier];
  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap", cls)}>
        {label}
      </span>
      {pct && (
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums" title={item.finalScoreSource === "recon" ? "Deep Forensic-based final score (Deep Scan)" : "Primary Engine-based score"}>
          {pct}
        </span>
      )}
      {sub && (
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{sub}</span>
      )}
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
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
   * Poll job status until completed/failed
   */
  const pollForResult = useCallback(
    (requestId: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const token = localStorage.getItem("detectx_token");
        const doPoll = async () => {
          try {
            const resp = await fetch(`${DETECTX_API_URL}/job/${requestId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!resp.ok) {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              reject(new Error(`Poll error: ${resp.status}`));
              return;
            }
            const data = await resp.json();
            if (data.status === "completed") {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              resolve(data.result);
            } else if (data.status === "failed") {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              reject(new Error(data.error || "Verification failed"));
            }
          } catch (err) {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;
            reject(err);
          }
        };
        pollIntervalRef.current = setInterval(doPoll, 2000);
        doPoll();
      });
    },
    []
  );

  /**
   * Upload file + poll for result (async polling pattern)
   */
  const verifyFile = useCallback(
    (file: File): Promise<any> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.timeout = 120000; // 2 min upload timeout

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
          if (xhr.status === 202) {
            // Job accepted — start polling for result
            try {
              const submitResp = JSON.parse(xhr.responseText);
              setFiles((prev) =>
                prev.map((f) =>
                  f.file === file ? { ...f, uploadProgress: undefined } : f
                )
              );
              pollForResult(submitResp.request_id)
                .then(resolve)
                .catch(reject);
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

        xhr.addEventListener("error", () => { xhrRef.current = null; reject(new Error("Network error")); });
        xhr.addEventListener("abort", () => { xhrRef.current = null; reject(new Error("CANCELLED")); });
        xhr.addEventListener("timeout", () => { xhrRef.current = null; reject(new Error("Upload timeout")); });

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
    [pollForResult]
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
                  cnnScore: result.cnn_score ?? null,
                  finalScore: result.final_score ?? null,
                  finalScoreSource: result.final_score_source ?? null,
                  reconMetrics: result.recon_metrics ?? null,
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
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
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

  // Tier-aware counts (4-tier: CNN band x backend verdict)
  const tierCounts = files.reduce(
    (acc, f) => {
      if (f.status !== "done") return acc;
      const tier = deriveTier(f);
      if (tier in acc) acc[tier]++;
      return acc;
    },
    { human: 0, "mixed-human": 0, "mixed-ai": 0, ai: 0, unknown: 0 } as Record<VerdictTier, number>,
  );

  const progressPct = totalFiles > 0 ? ((doneCount + errorCount + skippedCount) / totalFiles) * 100 : 0;

  // ── Export helpers ──

  const batchTimestamp = toLocalTimestamp();
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

  const generateBatchCSV = useCallback(() => {
    const done = getDoneFiles();
    const headers = [
      "#", "Filename", "Format", "File Size (bytes)", "Duration (sec)",
      "Tier", "Tier Code", "Tier Label", "Backend Verdict",
      "Primary Engine Score (AI)", "Final Score (AI)", "Final Score Source",
      "Deep Forensic AI Signals (n/7)",
      "Strong AI", "AI", "Human", "Strong Human", "Strength Summary",
      "Detection Mode", "Engine Version", "Analysis Timestamp",
    ];
    const rows = done.map((f, i) => {
      const tier = deriveTier(f);
      const sum = computeFileStrengths(f);
      const strengthSummary = sum ? formatStrengthSummary(sum) : "";
      return [
        i + 1,
        escapeCSV(f.name),
        escapeCSV(f.format),
        f.size,
        f.duration?.toFixed(1) || "",
        escapeCSV(tier),
        escapeCSV(tierCode(tier)),
        escapeCSV(tierLabel(tier)),
        escapeCSV(f.verdict),
        f.cnnScore != null ? f.cnnScore.toFixed(6) : "",
        f.finalScore != null ? f.finalScore.toFixed(6) : "",
        escapeCSV(f.finalScoreSource ?? ""),
        f.reconMetrics?.ai_signals ?? "",
        sum?.strong_ai ?? "",
        sum?.ai ?? "",
        sum?.human ?? "",
        sum?.strong_human ?? "",
        escapeCSV(strengthSummary),
        "Enhanced Mode",
        "v3",
        escapeCSV(batchTimestamp),
      ].join(",");
    });
    return headers.join(",") + "\n" + rows.join("\n");
  }, [getDoneFiles, batchTimestamp]);

  const generateBatchJSON = useCallback(() => {
    const done = getDoneFiles();
    const report = {
      reportVersion: "3.1.0",
      generatedAt: batchTimestamp,
      engine: { version: "v3", mode: "Enhanced Mode" },
      summary: {
        total: totalFiles,
        verified: doneCount,
        errors: errorCount,
        skipped: skippedCount,
        // Backend binary breakdown (legacy)
        aiDetected: aiCount,
        humanVerified: humanCount,
        // 4-tier display breakdown
        tierBreakdown: {
          ai: tierCounts.ai,
          mixedAi: tierCounts["mixed-ai"],
          mixedHuman: tierCounts["mixed-human"],
          human: tierCounts.human,
        },
      },
      results: done.map((f, i) => {
        const tier = deriveTier(f);
        const sum = computeFileStrengths(f);
        const displayScore = displayScoreOf(f);
        const reconRows = (f.reconMetricsEnriched && f.reconMetricsEnriched.length > 0)
          ? f.reconMetricsEnriched.map((r) => ({
              metric: r.label,
              value: r.value ?? null,
              formatted: r.formatted,
              exceededAi: r.exceeded_ai ?? null,
              marginPercent: r.margin != null ? r.margin * 100 : null,
              strength: r.strength ?? null,
              strengthLabel: r.strength ? strengthLabel(r.strength as Strength) : null,
            }))
          : null;
        return {
          index: i + 1,
          filename: f.name,
          format: f.format,
          fileSize: f.size,
          duration: f.duration || null,
          tier,
          tierCode: tierCode(tier),
          tierLabel: tierLabel(tier),
          backendVerdict: f.verdict || null,
          confidence: {
            cnnAi: f.cnnScore,
            cnnHuman: f.cnnScore != null ? 1 - f.cnnScore : null,
            finalAi: f.finalScore,
            finalHuman: f.finalScore != null ? 1 - f.finalScore : null,
            finalSource: f.finalScoreSource,
            displayAi: displayScore,
            displayHuman: displayScore != null ? 1 - displayScore : null,
          },
          reconMetrics: f.reconMetrics
            ? {
                aiSignals: f.reconMetrics.ai_signals ?? null,
                strengthSummary: sum
                  ? {
                      strongAi: sum.strong_ai,
                      ai: sum.ai,
                      human: sum.human,
                      strongHuman: sum.strong_human,
                      text: formatStrengthSummary(sum),
                    }
                  : null,
                values: reconRows,
              }
            : null,
        };
      }),
      disclaimer:
        "DetectX does not determine authorship, intent, or ownership. Audio with extensive post-processing may exhibit AI-like signal characteristics.",
    };
    return JSON.stringify(report, null, 2);
  }, [getDoneFiles, batchTimestamp, totalFiles, doneCount, aiCount, humanCount, errorCount, skippedCount, tierCounts]);

  const generateBatchMarkdown = useCallback(() => {
    const done = getDoneFiles();
    let md = `# DetectX Batch Verification Report\n\n`;
    md += `**Generated:** ${batchTimestamp}  \n`;
    md += `**Detection Mode:** Enhanced Mode  \n`;
    md += `**Engine Version:** v3  \n`;
    md += `**Report Version:** 3.1.0\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Count |\n|--------|-------|\n`;
    md += `| Total Files | ${totalFiles} |\n`;
    md += `| Verified | ${doneCount} |\n`;
    md += `| Errors | ${errorCount} |\n`;
    md += `| Skipped | ${skippedCount} |\n\n`;
    md += `### Verdict Distribution (4-tier)\n\n`;
    md += `| Tier | Count |\n|------|-------|\n`;
    md += `| AI Signal Observed (≥80%) | ${tierCounts.ai} |\n`;
    md += `| AI Confirmed by Deep Scan (50-80%) | ${tierCounts["mixed-ai"]} |\n`;
    md += `| Human Recovered by Deep Scan (50-80%) | ${tierCounts["mixed-human"]} |\n`;
    md += `| AI Signal Not Observed (<50%) | ${tierCounts.human} |\n\n`;
    md += `## Results\n\n`;
    md += `| # | Filename | Format | Size | Duration | Tier | AI % | Score Source | Deep Forensic Strength |\n`;
    md += `|---|----------|--------|------|----------|------|------|--------------|----------------|\n`;
    done.forEach((f, i) => {
      const tier = deriveTier(f);
      const dur = f.duration ? `${Math.floor(f.duration / 60)}:${String(Math.floor(f.duration % 60)).padStart(2, "0")}` : "—";
      const score = displayScoreOf(f);
      const pct = score != null ? `${(score * 100).toFixed(1)}%` : "—";
      const source = f.finalScoreSource === "recon" ? "Deep Scan" : (f.cnnScore != null ? "Primary Engine" : "—");
      const sum = computeFileStrengths(f);
      const strength = sum ? formatStrengthSummary(sum) : "—";
      md += `| ${i + 1} | ${f.name} | ${f.format} | ${formatFileSize(f.size)} | ${dur} | **${tierLabel(tier)}** | \`${pct}\` | ${source} | ${strength} |\n`;
    });
    md += `\n## Methodology\n\n`;
    md += `- **Primary Engine:** DetectX Engine (deep neural network) produces an AI probability score.\n`;
    md += `- **Tier Bands:** Below 50% → Human. 50-80% → DetectX Deep Forensic Engine (Deep Scan) is invoked. ≥80% → AI confirmed.\n`;
    md += `- **Final Score Source:** For tracks in the 50-80% Mixed range the Verification Confidence is sourced from the DetectX Deep Forensic Engine; outside that range it equals the Primary Engine score.\n`;
    md += `- **Signal Strength:** Each of the 7 reconstruction metrics carries a signed margin from its threshold. Strong = |margin| ≥ 30%. A high "AI Signal Count" of mostly-marginal crossings can still yield a Human-leaning final score, which the trained classifier weighs by magnitude rather than a binary yes/no.\n\n`;
    md += `## Disclaimer\n\n`;
    md += `> DetectX does not determine authorship, intent, or ownership.\n`;
    md += `> Audio with extensive post-processing, synthesis, or heavy digital manipulation may exhibit AI-like signal characteristics.\n\n`;
    md += `---\n\n*DetectX Audio AI Detector — Engine v3 (Enhanced Mode) — Report 3.1.0*\n`;
    return md;
  }, [getDoneFiles, batchTimestamp, totalFiles, doneCount, errorCount, skippedCount, tierCounts]);

  const generateBatchPDFHTML = useCallback(() => {
    const done = getDoneFiles();
    const tierClass = (t: VerdictTier): string => {
      switch (t) {
        case "ai":          return "tier-ai";
        case "mixed-ai":    return "tier-mixed-ai";
        case "mixed-human": return "tier-mixed-human";
        case "human":       return "tier-human";
        default:            return "";
      }
    };
    const rows = done
      .map((f, i) => {
        const tier = deriveTier(f);
        const dur = f.duration ? `${Math.floor(f.duration / 60)}:${String(Math.floor(f.duration % 60)).padStart(2, "0")}` : "—";
        const score = displayScoreOf(f);
        const pct = score != null ? `${(score * 100).toFixed(1)}%` : "—";
        const source = f.finalScoreSource === "recon" ? "Deep Scan" : (f.cnnScore != null ? "Primary Engine" : "—");
        const sum = computeFileStrengths(f);
        const strength = sum ? formatStrengthSummary(sum) : "—";
        return `<tr>
          <td>${i + 1}</td>
          <td>${f.name}</td>
          <td>${f.format}</td>
          <td>${formatFileSize(f.size)}</td>
          <td>${dur}</td>
          <td class="${tierClass(tier)}">${tierLabel(tier)}</td>
          <td class="small-mono">${pct}</td>
          <td class="small-mono">${source}</td>
          <td class="small-mono">${strength}</td>
        </tr>`;
      })
      .join("\n");

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>DetectX Batch Report — ${batchDate}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#333}
  h1{color:#0d9488;border-bottom:2px solid #0d9488;padding-bottom:10px}
  h2{color:#555;margin-top:30px;font-size:14px;border-left:3px solid #0d9488;padding-left:8px}
  table{width:100%;border-collapse:collapse;margin:20px 0}
  th,td{padding:6px 8px;text-align:left;border-bottom:1px solid #ddd;font-size:11px;vertical-align:top}
  th{background:#f5f5f5;font-weight:600}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}
  .summary-item{text-align:center;padding:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
  .summary-item .num{font-size:24px;font-weight:bold}
  .summary-item .label{font-size:10px;text-transform:uppercase;color:#888;margin-top:4px;letter-spacing:0.5px}
  .tier-ai{color:#ef4444;font-weight:600}
  .tier-mixed-ai{color:#f59e0b;font-weight:600}
  .tier-mixed-human{color:#10b981;font-weight:600}
  .tier-human{color:#059669;font-weight:600}
  .small-mono{font-family:monospace;font-size:10px}
  .footer{margin-top:40px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:20px}
  .disclaimer{background:#fefce8;border:1px solid #fef08a;border-radius:4px;padding:12px;margin-top:20px;font-size:11px;line-height:1.5}
  .meta{font-size:11px;color:#666;margin-bottom:6px}
  .methodology{background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:10px 14px;font-size:10.5px;line-height:1.55;margin-top:14px}
  .methodology p{margin:4px 0}
</style></head><body>
<h1>DetectX Batch Verification Report</h1>
<p class="meta"><strong>Generated:</strong> ${batchTimestamp} &nbsp;|&nbsp; <strong>Mode:</strong> Enhanced &nbsp;|&nbsp; <strong>Engine:</strong> v3 &nbsp;|&nbsp; <strong>Report:</strong> 3.1.0</p>

<h2>Summary</h2>
<div class="summary-grid">
  <div class="summary-item"><div class="num">${totalFiles}</div><div class="label">Total</div></div>
  <div class="summary-item"><div class="num">${doneCount}</div><div class="label">Verified</div></div>
  <div class="summary-item"><div class="num" style="color:#ef4444">${errorCount}</div><div class="label">Errors</div></div>
  <div class="summary-item"><div class="num" style="color:#f59e0b">${skippedCount}</div><div class="label">Skipped</div></div>
</div>

<h2>Verdict Distribution (4-tier)</h2>
<div class="summary-grid">
  <div class="summary-item"><div class="num tier-ai">${tierCounts.ai}</div><div class="label">AI Observed (≥80%)</div></div>
  <div class="summary-item"><div class="num tier-mixed-ai">${tierCounts["mixed-ai"]}</div><div class="label">AI by Deep Scan</div></div>
  <div class="summary-item"><div class="num tier-mixed-human">${tierCounts["mixed-human"]}</div><div class="label">Human Recovered</div></div>
  <div class="summary-item"><div class="num tier-human">${tierCounts.human}</div><div class="label">Not Observed (&lt;50%)</div></div>
</div>

<h2>Results</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Filename</th>
      <th>Format</th>
      <th>Size</th>
      <th>Duration</th>
      <th>Verdict (4-tier)</th>
      <th>AI %</th>
      <th>Source</th>
      <th>Deep Forensic Strength Summary</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="methodology">
  <p><strong>Methodology.</strong> The DetectX Engine produces an AI probability. Tier bands: below 50% → Human, 50–80% → DetectX Deep Forensic Engine (Deep Scan) invoked, ≥80% → AI confirmed.</p>
  <p>The <strong>AI %</strong> column reflects the Verification Confidence: when sourced from <em>Deep Scan</em> (50–80% Mixed range) it is the DetectX Deep Forensic Engine's classifier output; outside that range it equals the Primary Engine score.</p>
  <p><strong>Deep Forensic Strength Summary</strong> counts each of the 7 reconstruction metrics by how far it sits from its threshold (|margin| ≥ 30% = Strong). A high crossing count of mostly-marginal metrics can still produce a Human-leaning final score, because the trained classifier weighs each metric by magnitude rather than a binary yes/no.</p>
</div>

<div class="disclaimer"><strong>Disclaimer:</strong> DetectX does not determine authorship, intent, or ownership. This verification is based solely on structural signal observations of the submitted audio files. Audio with extensive post-processing, synthesis, or heavy digital manipulation may exhibit signal characteristics similar to AI-generated music. Final adjudication is subject to the policies of the receiving institution, court, or authority.</div>
<div class="footer"><p>DetectX Audio AI Detector — Engine v3 (Enhanced Mode) — Report 3.1.0</p></div>
</body></html>`;
  }, [getDoneFiles, batchTimestamp, batchDate, totalFiles, doneCount, errorCount, skippedCount, tierCounts]);

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
    <>
      <SEO
        title="Batch AI Music Detection — Scan Hundreds of Tracks at Once"
        description="Batch AI music detection for labels, publishers, and distributors. Upload hundreds of audio files and detect AI-generated music from Suno, Udio at scale. CSV/JSON export."
        path="/batch-verify"
      />
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
                          <VerdictBadge item={item} />
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
              <div className="forensic-panel-content space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalFiles}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{doneCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verified</p>
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
                <div className="border-t border-border/30 pt-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Verdict Distribution (4-tier)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center px-2 py-2 rounded bg-red-500/10 border border-red-500/30">
                      <p className="text-xl font-bold text-red-400">{tierCounts.ai}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">AI Observed<br /><span className="text-muted-foreground/60">(≥80%)</span></p>
                    </div>
                    <div className="text-center px-2 py-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xl font-bold text-amber-400">{tierCounts["mixed-ai"]}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">AI by Deep Scan<br /><span className="text-muted-foreground/60">(50-80%)</span></p>
                    </div>
                    <div className="text-center px-2 py-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-xl font-bold text-emerald-400">{tierCounts["mixed-human"]}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Human Recovered<br /><span className="text-muted-foreground/60">(50-80%)</span></p>
                    </div>
                    <div className="text-center px-2 py-2 rounded bg-emerald-700/10 border border-emerald-700/30">
                      <p className="text-xl font-bold text-emerald-500">{tierCounts.human}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Not Observed<br /><span className="text-muted-foreground/60">(&lt;50%)</span></p>
                    </div>
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
    </>
  );
}
