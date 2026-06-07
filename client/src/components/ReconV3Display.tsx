/**
 * Reconstruction Engine Display
 *
 * Reads server-computed enriched RECON rows + strength summary. The bundle
 * does not carry the numeric thresholds, the raw key names, or any per-metric
 * arithmetic — those live on the server. UI is pure rendering.
 */

import { Activity, Gauge, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatMarginPct,
  strengthLabel,
  strengthColor,
  formatStrengthSummary,
  type ReconMetricEnriched,
  type StrengthSummary,
} from "@/lib/recon_strength";

interface ReconV3DisplayProps {
  /** Pre-computed display rows from the server. UI renders them verbatim. */
  enriched?: ReconMetricEnriched[] | null;
  /** Pre-computed strength bucket counts from the server. */
  summary?: StrengthSummary | null;
  /** Secondary engine confidence (0..1), display only. */
  v2Confidence?: number | null;
  /** Total signals across the 7-metric set (for the count chip). */
  aiSignals?: number | null;
  isProcessing?: boolean;
}


function MetricRow({ row }: { row: ReconMetricEnriched }) {
  // No measurement → muted placeholder row.
  if (row.value == null || row.strength == null || row.margin == null || row.bar_position == null) {
    return (
      <div className="px-3 py-2 hover:bg-muted/20 rounded">
        <div className="flex items-baseline justify-between gap-2 min-w-0">
          <span className="text-xs text-muted-foreground truncate">{row.label}</span>
          <span className="font-mono text-xs text-foreground/40">—</span>
        </div>
      </div>
    );
  }

  const color = strengthColor(row.strength);
  return (
    <div className="px-3 py-2 hover:bg-muted/20 rounded space-y-1.5">
      {/* Row 1: label (left) + measured value (right) */}
      <div className="flex items-baseline justify-between gap-2 min-w-0">
        <span className="text-xs text-muted-foreground truncate">{row.label}</span>
        <span className="font-mono text-xs text-foreground flex-shrink-0">{row.formatted}</span>
      </div>
      {/* Row 2: bar (flex) + margin + strength badge (fixed) */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="relative flex-1 h-1.5 rounded-full overflow-hidden min-w-0"
          style={{ background: "linear-gradient(to right, rgba(16,185,129,0.18) 0%, rgba(148,163,184,0.12) 50%, rgba(239,68,68,0.18) 100%)" }}
        >
          <div className="absolute top-0 bottom-0 w-px bg-muted-foreground/50" style={{ left: "50%" }} />
          <div
            className="absolute top-[-2px] h-[10px] w-[3px] rounded"
            style={{ left: `${row.bar_position.toFixed(1)}%`, transform: "translateX(-1.5px)", background: color.hex }}
          />
        </div>
        <span
          className={cn("font-mono text-[10px] font-semibold tabular-nums flex-shrink-0", color.text)}
          style={{ minWidth: "44px", textAlign: "right" }}
        >
          {formatMarginPct(row.margin)}
        </span>
        <span
          className={cn(
            "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0",
            color.bg, color.text, color.border,
          )}
        >
          {strengthLabel(row.strength)}
        </span>
      </div>
    </div>
  );
}


export function ReconV3Display({
  enriched,
  summary,
  v2Confidence,
  aiSignals,
  isProcessing = false,
}: ReconV3DisplayProps) {
  // During processing state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forensic-cyan" />
            <span>Reconstruction Engine</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan animate-pulse" />
            <span className="text-xs text-forensic-cyan">ANALYZING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          <div className="h-32 bg-muted/10 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-forensic-cyan/30 border-t-forensic-cyan rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!enriched || enriched.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span>Reconstruction Engine</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          <div className="h-32 bg-muted/10 rounded-lg border border-dashed border-border/30 flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Reconstruction metrics will appear after scan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasV2 = v2Confidence != null && v2Confidence >= 0;
  const confidencePercent = hasV2 ? (v2Confidence! * 100).toFixed(1) : null;
  const isAI = hasV2 && v2Confidence! >= 0.5;

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-forensic-cyan" />
          <span>Reconstruction Engine</span>
        </div>
        {aiSignals != null && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">
            {aiSignals}/{enriched.length} signals
          </span>
        )}
      </div>

      <div className="forensic-panel-content space-y-3">
        {hasV2 && (
          <div className={cn(
            "p-3 rounded-lg border",
            isAI ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30",
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className={cn("w-4 h-4", isAI ? "text-red-400" : "text-emerald-400")} />
                <span className="text-xs font-medium text-foreground">Reconstruction Confidence</span>
              </div>
              <span className={cn("text-lg font-bold font-mono", isAI ? "text-red-400" : "text-emerald-400")}>
                {confidencePercent}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Secondary engine probability (above the decision midpoint indicates AI signal)
            </p>
          </div>
        )}

        {aiSignals != null && (
          <div className="flex items-center justify-between py-1.5 px-3 bg-muted/10 rounded">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              AI Signal Count
            </span>
            <span className={cn(
              "font-mono text-xs font-bold",
              aiSignals >= 4 ? "text-red-400" : "text-emerald-400",
            )}>
              {aiSignals}/{enriched.length}
            </span>
          </div>
        )}

        {summary && (summary.strong_ai + summary.ai + summary.human + summary.strong_human > 0) && (
          <div className="border-t border-border/30 pt-2 px-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Signal Strength Distribution
            </p>
            <div className="flex flex-wrap gap-1.5">
              {summary.strong_ai > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded border border-red-500/40 bg-red-500/15 text-red-400 font-semibold">
                  {summary.strong_ai} Strong AI
                </span>
              )}
              {summary.ai > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-400 font-semibold">
                  {summary.ai} AI
                </span>
              )}
              {summary.human > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-semibold">
                  {summary.human} Human
                </span>
              )}
              {summary.strong_human > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-700/40 bg-emerald-700/15 text-emerald-500 font-semibold">
                  {summary.strong_human} Strong Human
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-1.5 leading-relaxed">
              The classifier weighs each metric by how far it sits from its decision line, not by a simple yes/no count. {formatStrengthSummary(summary)}.
            </p>
          </div>
        )}

        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-3 mb-1">
            Structural Measurements
          </p>
          <div className="space-y-0.5">
            {enriched.map((row) => (
              <MetricRow key={row.id} row={row} />
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground italic">
            Display-only metrics. No interpretation performed in UI.
          </p>
        </div>
      </div>
    </div>
  );
}

export type { ReconMetricEnriched };
