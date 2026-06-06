/**
 * Report Preview Section
 *
 * Forensic evidence preview (2026-05-31 — 4-tier display + RECON summary).
 *
 * REQUIREMENTS:
 *  - Display 4-tier verdict label (CNN x Backend verdict combination)
 *  - Show DetectX engine status and structural findings summary
 *  - Show CNN confidence + RECON AI signal count summary (if available)
 *  - Clearly labeled as preview
 *
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, CheckCircle, Search } from "lucide-react";
import {
  computeMetricStrength,
  summarizeStrengths,
  formatStrengthSummary,
  type Strength,
  type Direction,
} from "@/lib/recon_strength";

interface VerdictResult {
  verdict: "AI signal evidence was observed." | "AI signal evidence was not observed." | null;
  authority: "DetectX Forensic";
  exceeded_axes: string[];
}

interface ReconMetricsSummary {
  ai_signals?: number | null;
  band_bass_diff?: number | null;
  band_low_mid_diff?: number | null;
  l1_diff?: number | null;
  snr?: number | null;
  energy_ratio?: number | null;
  phase_coherence?: number | null;
  band_high_ratio?: number | null;
}

interface ReportPreviewProps {
  verdict: VerdictResult | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  fileName: string | null;
  fileHash: string | null;
  isProcessing?: boolean;
  onExport?: () => void;
  /** CNN confidence score (0.0-1.0) for 4-tier label derivation */
  cnnScore?: number | null;
  /** Final AI probability; RECON-based in 50-80% Mixed range, CNN elsewhere */
  finalScore?: number | null;
  /** "cnn" or "recon" — source of finalScore */
  finalScoreSource?: string | null;
  /** RECON 7-metric summary */
  reconMetrics?: ReconMetricsSummary | null;
}

// RECON V1 thresholds — mirror server/app/crg_runner.py RECON_DECISION_TABLE
const V1_THRESHOLDS: Array<{
  key: keyof ReconMetricsSummary;
  threshold: number;
  direction: Direction;
}> = [
  { key: "band_bass_diff",    threshold: 0.3991, direction: "<"  },
  { key: "band_low_mid_diff", threshold: 0.2967, direction: "<"  },
  { key: "l1_diff",           threshold: 0.0029, direction: "<"  },
  { key: "snr",               threshold: 30.84,  direction: ">=" },
  { key: "energy_ratio",      threshold: 0.9690, direction: ">=" },
  { key: "phase_coherence",   threshold: 0.7231, direction: ">=" },
  { key: "band_high_ratio",   threshold: 0.9471, direction: ">=" },
];

// -----------------------------------------------------------------------
// Tier derivation (mirrors VerdictPanel.tsx semantics)
// -----------------------------------------------------------------------

type VerdictTier = "human" | "mixed-human" | "mixed-ai" | "ai" | "unknown";

function deriveTier(cnnScore: number | null | undefined, backendVerdict: string | null): VerdictTier {
  if (backendVerdict == null) return "unknown";
  if (cnnScore == null) {
    return backendVerdict === "AI signal evidence was observed." ? "ai" : "human";
  }
  if (cnnScore < 0.5) return "human";
  if (cnnScore < 0.8) {
    return backendVerdict === "AI signal evidence was observed." ? "mixed-ai" : "mixed-human";
  }
  return "ai";
}

function deriveTierLabel(tier: VerdictTier): string {
  switch (tier) {
    case "human":       return "AI Signal Not Observed";
    case "mixed-human": return "AI Signal Not Observed — Recovered by Deep Scan";
    case "mixed-ai":    return "AI Signal Observed — Confirmed by Deep Scan";
    case "ai":          return "AI Signal Observed";
    case "unknown":     return "Pending";
  }
}

export function ReportPreview({
  verdict,
  crgStatus,
  primaryExceededAxis,
  fileName,
  fileHash,
  isProcessing = false,
  onExport,
  cnnScore = null,
  finalScore = null,
  finalScoreSource = null,
  reconMetrics = null,
}: ReportPreviewProps) {
  const { isAuthenticated } = useAuth();

  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">
          <span>Report Preview</span>
          <span className="text-[10px] text-muted-foreground ml-2">(Preview)</span>
        </div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Generating report preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!verdict) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">
          <span>Report Preview</span>
          <span className="text-[10px] text-muted-foreground ml-2">(Preview)</span>
        </div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-6">
            Awaiting verification data
          </p>
        </div>
      </div>
    );
  }

  const tier = deriveTier(cnnScore, verdict.verdict);
  const tierLabel = deriveTierLabel(tier);
  const isAiTier = tier === "ai";
  const isMixedAi = tier === "mixed-ai";
  const isMixedHuman = tier === "mixed-human";
  const isMixed = isMixedAi || isMixedHuman;

  const verdictBoxClass =
    tier === "human" || isMixedHuman
      ? "bg-forensic-green/10 border-forensic-green"
      : isMixedAi
        ? "bg-amber-500/10 border-amber-500"
        : isAiTier
          ? "bg-forensic-amber/10 border-forensic-amber"
          : "bg-muted/10 border-muted";

  const VerdictIcon = isAiTier || isMixedAi ? AlertCircle : isMixed ? Search : CheckCircle;
  const verdictIconClass =
    tier === "human" || isMixedHuman
      ? "text-forensic-green"
      : isMixedAi
        ? "text-amber-400"
        : "text-forensic-amber";

  const aiSignals = reconMetrics?.ai_signals;
  const showReconSummary = aiSignals != null;
  const displayScore = finalScore != null ? finalScore : cnnScore;
  const isReconSource = finalScoreSource === "recon" && finalScore != null;

  // Compute V1 strength distribution from measured metrics
  const strengthSum = (() => {
    if (!reconMetrics) return null;
    const strengths: Strength[] = [];
    V1_THRESHOLDS.forEach(({ key, threshold, direction }) => {
      const raw = reconMetrics[key];
      if (typeof raw === "number") {
        strengths.push(computeMetricStrength(raw, threshold, direction).strength);
      }
    });
    if (strengths.length === 0) return null;
    return summarizeStrengths(strengths);
  })();

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Report Preview</span>
          <span className="text-[10px] text-muted-foreground">(Preview)</span>
        </div>
        {isAuthenticated && onExport && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={onExport}
          >
            <FileText className="w-3 h-3 mr-1" />
            Export
          </Button>
        )}
      </div>
      <div className="forensic-panel-content space-y-4">
        {/* 4-tier Verdict Summary */}
        <div className={`p-3 rounded border-l-2 ${verdictBoxClass}`}>
          <div className="flex items-start gap-2">
            <VerdictIcon className={`w-4 h-4 ${verdictIconClass} flex-shrink-0 mt-0.5`} />
            <p className="text-xs text-foreground leading-relaxed font-medium">
              {tierLabel}
            </p>
          </div>
          {displayScore != null && (
            <div className="mt-2 ml-6 space-y-1">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                <span>AI: <span className="font-mono text-foreground/80">{(displayScore * 100).toFixed(1)}%</span></span>
                <span>Human: <span className="font-mono text-foreground/80">{((1 - displayScore) * 100).toFixed(1)}%</span></span>
                {isReconSource && (
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400/90">
                    source: Deep Scan
                  </span>
                )}
              </div>
              {isReconSource && cnnScore != null && (
                <p className="text-[9px] text-muted-foreground/70">
                  Primary engine (CNN) flagged at {(cnnScore * 100).toFixed(1)}%; final score from Reconstruction Engine.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Engine Status */}
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Engine Status
          </div>
          <div className="py-2 px-3 bg-muted/20 rounded">
            <span className="text-xs font-mono text-foreground">
              {crgStatus || "Pending"}
            </span>
          </div>
        </div>

        {/* RECON 7-metric summary (when intermediate range or AI tier) */}
        {showReconSummary && (
          <div className="space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Reconstruction Engine Summary
            </div>
            <div className="py-2 px-3 bg-muted/20 rounded space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">AI Signal Count</span>
                <span className="font-mono text-foreground">{aiSignals} / 7</span>
              </div>
              {strengthSum && (strengthSum.strongAi + strengthSum.marginalAi + strengthSum.marginalHuman + strengthSum.strongHuman > 0) && (
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Signal Strength Distribution
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strengthSum.strongAi > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/15 text-red-400 font-semibold">
                        {strengthSum.strongAi} Strong AI
                      </span>
                    )}
                    {strengthSum.marginalAi > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-400 font-semibold">
                        {strengthSum.marginalAi} AI
                      </span>
                    )}
                    {strengthSum.marginalHuman > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-semibold">
                        {strengthSum.marginalHuman} Human
                      </span>
                    )}
                    {strengthSum.strongHuman > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-700/40 bg-emerald-700/15 text-emerald-500 font-semibold">
                        {strengthSum.strongHuman} Strong Human
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                    {formatStrengthSummary(strengthSum)}. The classifier weighs each metric by how far it sits from its threshold, not by a binary yes/no.
                  </p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Full 7-metric measurement values, margins, and thresholds are available in the exported report.
              </p>
            </div>
          </div>
        )}

        {/* Structural Findings Summary */}
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Structural Findings
          </div>
          <div className="py-2 px-3 bg-muted/20 rounded space-y-1">
            {primaryExceededAxis ? (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Primary Exceeded Axis</span>
                <span className="font-mono text-foreground">{primaryExceededAxis}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No exceeded axes detected
              </p>
            )}
          </div>
        </div>

        {/* File Information */}
        <div className="pt-3 border-t border-border/50 space-y-1">
          {fileName && (
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">File</span>
              <span className="font-mono text-muted-foreground truncate max-w-[150px]">
                {fileName}
              </span>
            </div>
          )}
          {fileHash && (
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Hash</span>
              <span className="font-mono text-muted-foreground truncate max-w-[150px]">
                {fileHash.substring(0, 16)}...
              </span>
            </div>
          )}
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Generated</span>
            <span className="font-mono text-muted-foreground">
              {new Date().toISOString().split("T")[0]}
            </span>
          </div>
        </div>

        {/* Auth notice */}
        {!isAuthenticated && (
          <p className="text-[10px] text-muted-foreground text-center">
            Sign in to export full forensic report
          </p>
        )}
      </div>
    </div>
  );
}
