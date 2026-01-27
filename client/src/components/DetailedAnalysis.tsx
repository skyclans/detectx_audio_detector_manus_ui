/**
 * Detailed Analysis Section
 * 
 * Professional audio analyzer style visualization.
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { Gauge, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Axis definitions (fixed order from specification)
type AxisId = "G1-A" | "G1-B" | "G2-A" | "G2-B" | "G3-A";

interface AxisMetric {
  name: string;
  value: string;
}

interface AxisData {
  id: AxisId;
  status: "exceeded" | "within_bounds";
  metrics: AxisMetric[];
}

interface DetailedAnalysisProps {
  axes: AxisData[] | null;
  isProcessing?: boolean;
}

// Axis card headers (fixed from specification)
const AXIS_HEADERS: Record<AxisId, { title: string; shortTitle: string; note?: string }> = {
  "G1-A": {
    title: "G1-A — Residual Trajectory Curvature",
    shortTitle: "Trajectory Curvature",
    note: "Observational axis",
  },
  "G1-B": {
    title: "G1-B — Residual Persistence Length",
    shortTitle: "Persistence Length",
  },
  "G2-A": {
    title: "G2-A — Cross-Stem Coupling",
    shortTitle: "Cross-Stem Coupling",
  },
  "G2-B": {
    title: "G2-B — Residual Symmetry",
    shortTitle: "Residual Symmetry",
  },
  "G3-A": {
    title: "G3-A — Band Geometry",
    shortTitle: "Band Geometry",
  },
};

// Fixed axis order
const AXIS_ORDER: AxisId[] = ["G1-A", "G1-B", "G2-A", "G2-B", "G3-A"];

function AxisCard({ axis, axisId }: { axis: AxisData | null; axisId: AxisId }) {
  const header = AXIS_HEADERS[axisId];
  const isExceeded = axis?.status === "exceeded";
  
  // Empty Axis State
  if (!axis) {
    return (
      <div className="group relative bg-muted/10 rounded-lg border border-border/30 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted/30 flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{axisId}</span>
          </div>
          <span className="text-[10px] text-muted-foreground/50">NO DATA</span>
        </div>
        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground/50">{header.shortTitle}</p>
          {header.note && (
            <p className="text-[10px] text-muted-foreground/30 italic mt-0.5">{header.note}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative rounded-lg border overflow-hidden transition-all",
      isExceeded 
        ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50" 
        : "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
    )}>
      {/* Status indicator bar */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        isExceeded ? "bg-red-500" : "bg-emerald-500"
      )} />
      
      {/* Header bar */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2 border-b",
        isExceeded 
          ? "bg-red-500/10 border-red-500/20" 
          : "bg-emerald-500/10 border-emerald-500/20"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded flex items-center justify-center",
            isExceeded ? "bg-red-500/20" : "bg-emerald-500/20"
          )}>
            {isExceeded ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <span className={cn(
            "text-xs font-bold",
            isExceeded ? "text-red-400" : "text-emerald-400"
          )}>
            {axis.id}
          </span>
        </div>
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded",
          isExceeded 
            ? "bg-red-500/20 text-red-400" 
            : "bg-emerald-500/20 text-emerald-400"
        )}>
          {isExceeded ? "EXCEEDED" : "WITHIN BOUNDS"}
        </span>
      </div>
      
      {/* Content */}
      <div className="p-3 pl-4">
        <p className="text-xs text-foreground font-medium">{header.shortTitle}</p>
        {header.note && (
          <p className="text-[10px] text-muted-foreground italic mt-0.5">{header.note}</p>
        )}
        
        {/* Metrics */}
        {axis.metrics.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {axis.metrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  {metric.name}
                </span>
                <span className={cn(
                  "font-mono px-1.5 py-0.5 rounded text-[11px]",
                  isExceeded ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
                )}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DetailedAnalysis({ axes, isProcessing = false }: DetailedAnalysisProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-forensic-cyan" />
            <span>Detailed Analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan animate-pulse" />
            <span className="text-xs text-forensic-cyan">ANALYZING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Scanning animation for each axis */}
          <div className="space-y-2">
            {AXIS_ORDER.map((axisId) => (
              <div key={axisId} className="relative h-16 bg-muted/20 rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center px-3 gap-3">
                  <div className="w-8 h-8 rounded bg-muted/30 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-forensic-cyan/30 border-t-forensic-cyan rounded-full animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-16 bg-muted/30 rounded mb-1" />
                    <div className="h-2 w-24 bg-muted/20 rounded" />
                  </div>
                </div>
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-forensic-cyan/50 to-transparent animate-scan-line" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Before Verification state
  if (!axes) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span>Detailed Analysis</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Empty state with axis placeholders */}
          <div className="space-y-2">
            {AXIS_ORDER.map((axisId) => (
              <div key={axisId} className="h-14 bg-muted/10 rounded border border-dashed border-border/30 flex items-center px-3 gap-3">
                <div className="w-6 h-6 rounded bg-muted/20 flex items-center justify-center">
                  <Gauge className="w-3 h-3 text-muted-foreground/30" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground/50">{axisId}</p>
                  <p className="text-[10px] text-muted-foreground/30">{AXIS_HEADERS[axisId].shortTitle}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Awaiting verification
          </p>
        </div>
      </div>
    );
  }

  // Create axis map for lookup
  const axisMap = new Map(axes.map(a => [a.id, a]));
  const exceededCount = axes.filter(a => a.status === "exceeded").length;
  const withinCount = axes.filter(a => a.status === "within_bounds").length;

  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-forensic-cyan" />
          <span>Detailed Analysis</span>
        </div>
        {/* Summary badges */}
        <div className="flex items-center gap-2">
          {exceededCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
              {exceededCount} exceeded
            </span>
          )}
          {withinCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {withinCount} within
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground px-4 pb-2">
        CR-G axis geometry metrics from verification engine
      </p>
      <div className="forensic-panel-content space-y-2 max-h-[450px] overflow-y-auto">
        {AXIS_ORDER.map((axisId) => (
          <AxisCard 
            key={axisId} 
            axis={axisMap.get(axisId) || null} 
            axisId={axisId}
          />
        ))}
      </div>
    </div>
  );
}

export type { AxisData, AxisMetric, AxisId };
