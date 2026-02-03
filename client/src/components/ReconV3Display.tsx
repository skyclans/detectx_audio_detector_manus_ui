/**
 * RECON V3 Display Component
 * 
 * Displays RECON V3 engine metrics including:
 * - v2_confidence (RECON Confidence) - V3 core verdict value
 * - recon_version (Engine Version)
 * - Extended metrics: Mid Diff, High-Mid Diff, Spectral Flatness, Stereo Recon Loss
 * 
 * Backward compatible with V1 responses.
 * Based on: docs/ui-team-recon-v3-display-spec.md
 */

import { Activity, Gauge, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// RECON V3 metrics interface
interface ReconMetrics {
  // V1 existing fields
  band_bass_diff?: number | null;
  band_low_mid_diff?: number | null;
  l1_diff?: number | null;
  snr?: number | null;
  energy_ratio?: number | null;
  phase_coherence?: number | null;
  band_high_ratio?: number | null;
  ai_signals?: number | null;
  
  // V3 new fields
  recon_version?: string | null;
  v2_confidence?: number | null;
  band_mid_diff?: number | null;
  band_high_mid_diff?: number | null;
  spectral_flatness_mean?: number | null;
  stereo_recon_loss?: number | null;
  v2_features?: Record<string, number> | null;
}

interface ReconV3DisplayProps {
  metrics: ReconMetrics | null;
  isProcessing?: boolean;
}

// V1 metric thresholds for display
const V1_THRESHOLDS = {
  band_bass_diff: { threshold: 0.3991, compare: "<" },
  band_low_mid_diff: { threshold: 0.2967, compare: "<" },
  l1_diff: { threshold: 0.0029, compare: "<" },
  snr: { threshold: 30.84, compare: ">=" },
  energy_ratio: { threshold: 0.9690, compare: ">=" },
  phase_coherence: { threshold: 0.7231, compare: ">=" },
  band_high_ratio: { threshold: 0.9471, compare: ">=" },
};

function MetricRow({ 
  label, 
  value, 
  threshold, 
  compare,
  isV3Extended = false 
}: { 
  label: string; 
  value: number | null | undefined; 
  threshold?: number;
  compare?: string;
  isV3Extended?: boolean;
}) {
  if (value === null || value === undefined) return null;
  
  const formattedValue = typeof value === "number" 
    ? (label === "SNR" ? `${value.toFixed(1)}dB` : value.toFixed(4))
    : String(value);
  
  const thresholdText = threshold !== undefined && compare 
    ? ` (${compare} ${threshold.toFixed(4)})`
    : "";
  
  return (
    <div className="flex items-center justify-between py-1.5 px-3 hover:bg-muted/20 rounded">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(
        "font-mono text-xs",
        isV3Extended ? "text-forensic-cyan" : "text-foreground"
      )}>
        {formattedValue}
        {thresholdText && (
          <span className="text-muted-foreground/70 text-[10px]">{thresholdText}</span>
        )}
      </span>
    </div>
  );
}

export function ReconV3Display({ metrics, isProcessing = false }: ReconV3DisplayProps) {
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
  if (!metrics) {
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
              RECON metrics will appear after scan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isV3 = metrics.recon_version === "v2";
  const hasV2Confidence = metrics.v2_confidence !== null && metrics.v2_confidence !== undefined && metrics.v2_confidence !== -1;
  const confidencePercent = hasV2Confidence ? (metrics.v2_confidence! * 100).toFixed(1) : null;
  const isAI = hasV2Confidence && metrics.v2_confidence! >= 0.5;

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-forensic-cyan" />
          <span>Reconstruction Engine {isV3 ? "(V3)" : ""}</span>
        </div>
        {metrics.ai_signals !== null && metrics.ai_signals !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">
            {metrics.ai_signals}/7 signals
          </span>
        )}
      </div>
      
      <div className="forensic-panel-content space-y-3">
        {/* V3 Core: RECON Confidence (most important) */}
        {hasV2Confidence && (
          <div className={cn(
            "p-3 rounded-lg border",
            isAI 
              ? "bg-red-500/10 border-red-500/30" 
              : "bg-emerald-500/10 border-emerald-500/30"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className={cn(
                  "w-4 h-4",
                  isAI ? "text-red-400" : "text-emerald-400"
                )} />
                <span className="text-xs font-medium text-foreground">RECON Confidence</span>
              </div>
              <span className={cn(
                "text-lg font-bold font-mono",
                isAI ? "text-red-400" : "text-emerald-400"
              )}>
                {confidencePercent}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              V3 XGBoost classifier probability (≥50% = AI signal detected)
            </p>
          </div>
        )}

        {/* Engine Version */}
        {metrics.recon_version && (
          <div className="flex items-center justify-between py-1.5 px-3 bg-muted/10 rounded">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Engine Version
            </span>
            <span className="font-mono text-xs text-forensic-cyan">
              {metrics.recon_version}
            </span>
          </div>
        )}

        {/* AI Signals */}
        {metrics.ai_signals !== null && metrics.ai_signals !== undefined && (
          <div className="flex items-center justify-between py-1.5 px-3 bg-muted/10 rounded">
            <span className="text-xs text-muted-foreground">AI Signals</span>
            <span className={cn(
              "font-mono text-xs font-bold",
              metrics.ai_signals >= 4 ? "text-red-400" : "text-emerald-400"
            )}>
              {metrics.ai_signals}/7
            </span>
          </div>
        )}

        {/* V1 Metrics Section */}
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-3 mb-1">
            V1 Metrics
          </p>
          <div className="space-y-0.5">
            <MetricRow 
              label="Bass Diff" 
              value={metrics.band_bass_diff} 
              threshold={V1_THRESHOLDS.band_bass_diff.threshold}
              compare={V1_THRESHOLDS.band_bass_diff.compare}
            />
            <MetricRow 
              label="Low-Mid Diff" 
              value={metrics.band_low_mid_diff} 
              threshold={V1_THRESHOLDS.band_low_mid_diff.threshold}
              compare={V1_THRESHOLDS.band_low_mid_diff.compare}
            />
            <MetricRow 
              label="L1 Diff" 
              value={metrics.l1_diff} 
              threshold={V1_THRESHOLDS.l1_diff.threshold}
              compare={V1_THRESHOLDS.l1_diff.compare}
            />
            <MetricRow 
              label="SNR" 
              value={metrics.snr} 
              threshold={V1_THRESHOLDS.snr.threshold}
              compare={V1_THRESHOLDS.snr.compare}
            />
            <MetricRow 
              label="Energy Ratio" 
              value={metrics.energy_ratio} 
              threshold={V1_THRESHOLDS.energy_ratio.threshold}
              compare={V1_THRESHOLDS.energy_ratio.compare}
            />
            <MetricRow 
              label="Phase Coherence" 
              value={metrics.phase_coherence} 
              threshold={V1_THRESHOLDS.phase_coherence.threshold}
              compare={V1_THRESHOLDS.phase_coherence.compare}
            />
            <MetricRow 
              label="High Ratio" 
              value={metrics.band_high_ratio} 
              threshold={V1_THRESHOLDS.band_high_ratio.threshold}
              compare={V1_THRESHOLDS.band_high_ratio.compare}
            />
          </div>
        </div>

        {/* V3 Extended Metrics Section (only if V3) */}
        {isV3 && (
          <div className="border-t border-border/30 pt-2">
            <p className="text-[10px] text-forensic-cyan uppercase tracking-wide px-3 mb-1">
              V3 Extended
            </p>
            <div className="space-y-0.5">
              <MetricRow 
                label="Mid Diff" 
                value={metrics.band_mid_diff} 
                isV3Extended 
              />
              <MetricRow 
                label="High-Mid Diff" 
                value={metrics.band_high_mid_diff} 
                isV3Extended 
              />
              <MetricRow 
                label="Spectral Flatness" 
                value={metrics.spectral_flatness_mean} 
                isV3Extended 
              />
              <MetricRow 
                label="Stereo Recon Loss" 
                value={metrics.stereo_recon_loss} 
                isV3Extended 
              />
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="pt-2 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground italic">
            Display-only metrics. No interpretation performed in UI.
          </p>
        </div>
      </div>
    </div>
  );
}

export type { ReconMetrics };
