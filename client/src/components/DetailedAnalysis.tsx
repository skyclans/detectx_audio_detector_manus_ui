/**
 * Detailed Analysis Section
 * 
 * Professional audio analyzer style visualization.
 * UI displays data only. No interpretation.
 * Dynamically displays axes data from server response.
 */

import { Gauge, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AxisMetric {
  name: string;
  value: string;
}

// Dynamic axis data from server - no hardcoded axis IDs
interface AxisData {
  id: string;
  name?: string; // Optional display name from server
  status: "exceeded" | "within_bounds";
  metrics: AxisMetric[];
}

interface DetailedAnalysisProps {
  axes: AxisData[] | null;
  isProcessing?: boolean;
}

// Dynamic axis card that displays any axis from server
function AxisCard({ axis }: { axis: AxisData }) {
  const isExceeded = axis.status === "exceeded";
  const displayName = axis.name || axis.id; // Use name if provided, otherwise use id
  
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
            "text-xs font-bold uppercase",
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
        <p className="text-xs text-foreground font-medium">{displayName}</p>
        
        {/* Metrics */}
        {axis.metrics && axis.metrics.length > 0 && (
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
          {/* Scanning animation */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-16 bg-muted/20 rounded overflow-hidden">
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
  if (!axes || axes.length === 0) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span>Detailed Analysis</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Empty state */}
          <div className="h-40 bg-muted/10 rounded-lg border border-dashed border-border/30 flex flex-col items-center justify-center">
            <Gauge className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Analysis axes will appear after scan
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary counts
  const exceededCount = axes.filter(a => a.status === "exceeded").length;
  const withinCount = axes.filter(a => a.status === "within_bounds").length;

  // Data available state - dynamically display all axes from server
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
        Analysis axes from verification engine
      </p>
      <div className="forensic-panel-content space-y-2 max-h-[450px] overflow-y-auto">
        {axes.map((axis, idx) => (
          <AxisCard key={axis.id || idx} axis={axis} />
        ))}
      </div>
    </div>
  );
}

export type { AxisData, AxisMetric };
