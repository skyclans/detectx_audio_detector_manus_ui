/**
 * Geometry Scan Trace Section
 * 
 * Professional audio analyzer style visualization.
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { useState } from "react";
import { Hexagon, ChevronDown, ChevronUp, CheckCircle2, XCircle, Activity, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeMetricStrength,
  summarizeStrengths,
  formatStrengthSummary,
  type Strength,
  type Direction,
} from "@/lib/recon_strength";

interface AxisMetric {
  name: string;
  value: string;
}

interface GeometryTraceAxis {
  axis: string;
  exceeded: boolean;
  metrics: AxisMetric[];
}

interface GeometryScanTraceData {
  axes: GeometryTraceAxis[];
}

interface ReconMetricsLite {
  ai_signals?: number | null;
  band_bass_diff?: number | null;
  band_low_mid_diff?: number | null;
  l1_diff?: number | null;
  snr?: number | null;
  energy_ratio?: number | null;
  phase_coherence?: number | null;
  band_high_ratio?: number | null;
}

interface GeometryScanTraceProps {
  data: GeometryScanTraceData | null;
  isProcessing?: boolean;
  /** CNN score (0-1) for tier band derivation on "DetectX Engine" axis */
  cnnScore?: number | null;
  /** Final score (0-1) for narrative on "Reconstruction" axis */
  finalScore?: number | null;
  /** "cnn" or "recon" */
  finalScoreSource?: string | null;
  /** Backend binary verdict for verdict-aware status */
  backendVerdict?: string | null;
  /** RECON metrics for strength distribution on "Reconstruction" axis */
  reconMetrics?: ReconMetricsLite | null;
}

const V1_THRESHOLDS: Array<{ key: keyof ReconMetricsLite; threshold: number; direction: Direction }> = [
  { key: "band_bass_diff",    threshold: 0.3991, direction: "<"  },
  { key: "band_low_mid_diff", threshold: 0.2967, direction: "<"  },
  { key: "l1_diff",           threshold: 0.0029, direction: "<"  },
  { key: "snr",               threshold: 30.84,  direction: ">=" },
  { key: "energy_ratio",      threshold: 0.9690, direction: ">=" },
  { key: "phase_coherence",   threshold: 0.7231, direction: ">=" },
  { key: "band_high_ratio",   threshold: 0.9471, direction: ">=" },
];

type AxisStatus = "ai-confirmed" | "deep-scan" | "human-recovered" | "human" | "exceeded" | "pass";

interface AxisStatusInfo {
  status: AxisStatus;
  label: string;
  /** One-line note shown above expandable metrics */
  note?: string;
}

function computeReconStrengthSummary(metrics: ReconMetricsLite | null | undefined) {
  if (!metrics) return null;
  const strengths: Strength[] = [];
  V1_THRESHOLDS.forEach(({ key, threshold, direction }) => {
    const raw = metrics[key];
    if (typeof raw === "number") {
      strengths.push(computeMetricStrength(raw, threshold, direction).strength);
    }
  });
  if (strengths.length === 0) return null;
  return summarizeStrengths(strengths);
}

function deriveDetectXEngineStatus(cnnScore: number | null | undefined): AxisStatusInfo {
  if (cnnScore == null) return { status: "pass", label: "PENDING" };
  if (cnnScore < 0.5) {
    return { status: "human", label: "BELOW 50% • HUMAN", note: "CNN score below intermediate band — no Deep Scan needed." };
  }
  if (cnnScore < 0.8) {
    return { status: "deep-scan", label: "MIXED 50-80% • DEEP SCAN", note: "CNN score within intermediate decision range — Reconstruction Engine invoked for final adjudication." };
  }
  return { status: "ai-confirmed", label: "≥80% • AI CONFIRMED", note: "CNN score at or above upper decision threshold — no Deep Scan required." };
}

function deriveReconstructionStatus(
  backendVerdict: string | null | undefined,
  cnnScore: number | null | undefined,
): AxisStatusInfo {
  if (backendVerdict == null) return { status: "pass", label: "PENDING" };
  const inMixed = cnnScore != null && cnnScore >= 0.5 && cnnScore < 0.8;
  if (!inMixed) {
    return {
      status: "pass",
      label: "NOT INVOKED",
      note: "CNN reached a confident verdict on its own — Deep Scan not required.",
    };
  }
  if (backendVerdict === "AI signal evidence was observed.") {
    return {
      status: "ai-confirmed",
      label: "AI CONFIRMED BY DEEP SCAN",
      note: "Reconstruction Engine confirmed the intermediate-range CNN signal as AI.",
    };
  }
  return {
    status: "human-recovered",
    label: "RECOVERED TO HUMAN",
    note: "Reconstruction Engine recovered the intermediate-range CNN signal as Human.",
  };
}

const STATUS_COLORS: Record<AxisStatus, { bg: string; border: string; text: string; badge: string; hover: string; icon: typeof CheckCircle2 }> = {
  "ai-confirmed":    { bg: "bg-red-500/5",     border: "border-red-500/30",     text: "text-red-400",     badge: "bg-red-500/20",     hover: "hover:bg-red-500/10",     icon: XCircle },
  "exceeded":        { bg: "bg-red-500/5",     border: "border-red-500/30",     text: "text-red-400",     badge: "bg-red-500/20",     hover: "hover:bg-red-500/10",     icon: XCircle },
  "deep-scan":       { bg: "bg-amber-500/5",   border: "border-amber-500/30",   text: "text-amber-400",   badge: "bg-amber-500/20",   hover: "hover:bg-amber-500/10",   icon: Search },
  "human-recovered": { bg: "bg-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20", hover: "hover:bg-emerald-500/10", icon: CheckCircle2 },
  "human":           { bg: "bg-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20", hover: "hover:bg-emerald-500/10", icon: CheckCircle2 },
  "pass":            { bg: "bg-muted/10",      border: "border-border/30",      text: "text-muted-foreground", badge: "bg-muted/30", hover: "hover:bg-muted/20",       icon: Activity },
};

interface AxisRowProps {
  axis: GeometryTraceAxis;
  index: number;
  statusInfo: AxisStatusInfo;
  extraNote?: string | null;
  strengthBadges?: { strongAi: number; marginalAi: number; marginalHuman: number; strongHuman: number } | null;
}

function AxisRow({ axis, index, statusInfo, extraNote, strengthBadges }: AxisRowProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = STATUS_COLORS[statusInfo.status];
  const StatusIcon = colors.icon;

  return (
    <div className={cn("group rounded-lg border overflow-hidden transition-all", colors.bg, colors.border)}>
      {/* Main row */}
      <div
        className={cn("flex items-center gap-3 p-3 cursor-pointer transition-colors", colors.hover)}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Index badge */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
          colors.badge, colors.text,
        )}>
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Axis name */}
        <div className="flex-1 min-w-0">
          <span className="font-mono text-sm text-foreground">{axis.axis}</span>
        </div>

        {/* Status badge */}
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded flex-shrink-0", colors.badge)}>
          <StatusIcon className={cn("w-3.5 h-3.5", colors.text)} />
          <span className={cn("text-[10px] font-semibold tracking-wide whitespace-nowrap", colors.text)}>
            {statusInfo.label}
          </span>
        </div>

        {/* Expand button */}
        <button className={cn("w-8 h-8 rounded flex items-center justify-center transition-colors flex-shrink-0", colors.hover, colors.text)}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Status note (always visible when present) */}
      {statusInfo.note && (
        <div className={cn("px-4 pb-2 -mt-1 text-[11px] leading-relaxed", colors.text, "opacity-90")}>
          {statusInfo.note}
        </div>
      )}

      {/* Strength distribution badges (only when present) */}
      {strengthBadges && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {strengthBadges.strongAi > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/15 text-red-400 font-semibold">
              {strengthBadges.strongAi} Strong AI
            </span>
          )}
          {strengthBadges.marginalAi > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-400 font-semibold">
              {strengthBadges.marginalAi} AI
            </span>
          )}
          {strengthBadges.marginalHuman > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-semibold">
              {strengthBadges.marginalHuman} Human
            </span>
          )}
          {strengthBadges.strongHuman > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-700/40 bg-emerald-700/15 text-emerald-500 font-semibold">
              {strengthBadges.strongHuman} Strong Human
            </span>
          )}
        </div>
      )}

      {/* Expanded metrics */}
      {expanded && (axis.metrics.length > 0 || extraNote) && (
        <div className={cn("px-4 pb-4 pt-2 border-t", colors.border, colors.bg)}>
          {axis.metrics.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {axis.metrics.map((metric, idx) => (
                <div key={idx} className={cn("p-2 rounded border", colors.bg, colors.border)}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{metric.name}</p>
                  <p className={cn("font-mono text-sm", colors.text)}>{metric.value}</p>
                </div>
              ))}
            </div>
          )}
          {extraNote && (
            <p className="text-[11px] text-muted-foreground/90 mt-2 leading-relaxed">{extraNote}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function GeometryScanTrace({
  data,
  isProcessing = false,
  cnnScore = null,
  finalScore = null,
  finalScoreSource = null,
  backendVerdict = null,
  reconMetrics = null,
}: GeometryScanTraceProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-forensic-cyan" />
            <span>Geometry Scan Trace</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan animate-pulse" />
            <span className="text-xs text-forensic-cyan">TRACING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Geometry trace animation */}
          <div className="relative h-48 bg-muted/10 rounded-lg overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-0">
              {[...Array(48)].map((_, i) => (
                <div key={i} className="border border-border/10" />
              ))}
            </div>
            
            {/* Scanning hexagon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Hexagon className="w-16 h-16 text-forensic-cyan/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-forensic-cyan/30 border-t-forensic-cyan rounded-full animate-spin" />
                </div>
              </div>
            </div>
            
            {/* Trace lines animation */}
            <div className="absolute inset-x-0 top-0 h-full">
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-forensic-cyan/50 to-transparent animate-scan-line" />
            </div>
            
            {/* Status text */}
            <div className="absolute bottom-4 inset-x-0 text-center">
              <p className="text-xs text-muted-foreground">Tracing geometry constraints...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Before Verification state
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-muted-foreground" />
            <span>Geometry Scan Trace</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Empty state with geometry placeholder */}
          <div className="relative h-40 bg-muted/10 rounded-lg border border-dashed border-border/30 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="border border-border/10" />
              ))}
            </div>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Hexagon className="w-10 h-10 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Geometry trace will appear after scan
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State (no trace data)
  if (!data.axes || data.axes.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-muted-foreground" />
            <span>Geometry Scan Trace</span>
          </div>
          <span className="text-xs text-muted-foreground">EMPTY</span>
        </div>
        <div className="forensic-panel-content">
          <div className="h-32 bg-muted/10 rounded-lg border border-dashed border-border/30 flex flex-col items-center justify-center">
            <Hexagon className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No geometry trace available</p>
          </div>
        </div>
      </div>
    );
  }

  // Compute per-axis status using contextual props (CNN tier band, backend verdict, RECON strength)
  const reconStrengthSum = computeReconStrengthSummary(reconMetrics);
  const axisEntries = data.axes.map((axis) => {
    const axisLower = axis.axis.toLowerCase();
    let statusInfo: AxisStatusInfo;
    let extraNote: string | null = null;
    let strengthBadges = null;

    if (axisLower.includes("detectx") || axisLower.includes("cnn") || axisLower.includes("engine")) {
      statusInfo = deriveDetectXEngineStatus(cnnScore);
    } else if (axisLower.includes("recon") || axisLower.includes("reconstruction")) {
      statusInfo = deriveReconstructionStatus(backendVerdict, cnnScore);
      strengthBadges = reconStrengthSum && (reconStrengthSum.strongAi + reconStrengthSum.marginalAi + reconStrengthSum.marginalHuman + reconStrengthSum.strongHuman > 0)
        ? reconStrengthSum
        : null;
      if (reconStrengthSum) {
        const inMixed = cnnScore != null && cnnScore >= 0.5 && cnnScore < 0.8;
        const summary = formatStrengthSummary(reconStrengthSum);
        const finalNote = finalScore != null && finalScoreSource === "recon"
          ? ` Final RECON score: ${(finalScore * 100).toFixed(1)}% AI / ${((1 - finalScore) * 100).toFixed(1)}% Human.`
          : "";
        if (inMixed) {
          extraNote = `${summary}. The continuous classifier weighs each metric by how far it sits from its threshold, not by a binary yes/no — that is why a "${reconMetrics?.ai_signals ?? "X"}/7" count of crossings can still yield a Human-leaning verdict when most crossings are marginal.${finalNote}`;
        }
      }
    } else {
      // Fallback: use legacy exceeded/pass
      statusInfo = axis.exceeded
        ? { status: "exceeded", label: "EXCEEDED" }
        : { status: "pass", label: "PASS" };
    }
    return { axis, statusInfo, extraNote, strengthBadges };
  });

  // Header summary counts by category (richer than just exceeded/pass)
  const aiCount = axisEntries.filter((e) => e.statusInfo.status === "ai-confirmed" || e.statusInfo.status === "exceeded").length;
  const deepScanCount = axisEntries.filter((e) => e.statusInfo.status === "deep-scan").length;
  const humanCount = axisEntries.filter((e) => e.statusInfo.status === "human" || e.statusInfo.status === "human-recovered").length;

  // Data available state
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hexagon className="w-4 h-4 text-forensic-cyan" />
          <span>Geometry Scan Trace</span>
        </div>
        {/* Summary */}
        <div className="flex items-center gap-2">
          {aiCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {aiCount} AI
            </span>
          )}
          {deepScanCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-1">
              <Search className="w-3 h-3" />
              {deepScanCount} Deep Scan
            </span>
          )}
          {humanCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {humanCount} Human
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground px-4 pb-2">
        Execution trace of the DetectX verification engines, annotated with the tier band and Deep Scan outcome.
      </p>
      <div className="forensic-panel-content space-y-2">
        {axisEntries.map(({ axis, statusInfo, extraNote, strengthBadges }, idx) => (
          <AxisRow
            key={idx}
            axis={axis}
            index={idx}
            statusInfo={statusInfo}
            extraNote={extraNote}
            strengthBadges={strengthBadges}
          />
        ))}

        {/* Disclaimer */}
        <div className="mt-4 pt-3 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground italic">
            Display-only trace. No analysis or interpretation performed in UI.
          </p>
        </div>
      </div>
    </div>
  );
}

export type { GeometryScanTraceData, GeometryTraceAxis, AxisMetric };
