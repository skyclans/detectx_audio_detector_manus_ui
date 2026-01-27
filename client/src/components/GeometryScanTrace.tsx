/**
 * Geometry Scan Trace Section
 * 
 * Professional audio analyzer style visualization.
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { useState } from "react";
import { Hexagon, ChevronDown, ChevronUp, CheckCircle2, XCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface GeometryScanTraceProps {
  data: GeometryScanTraceData | null;
  isProcessing?: boolean;
}

function AxisRow({ axis, index }: { axis: GeometryTraceAxis; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "group rounded-lg border overflow-hidden transition-all",
      axis.exceeded 
        ? "bg-red-500/5 border-red-500/30" 
        : "bg-emerald-500/5 border-emerald-500/30"
    )}>
      {/* Main row */}
      <div 
        className={cn(
          "flex items-center gap-3 p-3 cursor-pointer transition-colors",
          axis.exceeded ? "hover:bg-red-500/10" : "hover:bg-emerald-500/10"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Index badge */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
          axis.exceeded ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
        )}>
          {String(index + 1).padStart(2, "0")}
        </div>
        
        {/* Axis name */}
        <div className="flex-1">
          <span className="font-mono text-sm text-foreground">{axis.axis}</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {axis.exceeded ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400">EXCEEDED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">PASS</span>
            </div>
          )}
        </div>

        {/* Expand button */}
        <button
          className={cn(
            "w-8 h-8 rounded flex items-center justify-center transition-colors",
            axis.exceeded 
              ? "hover:bg-red-500/20 text-red-400" 
              : "hover:bg-emerald-500/20 text-emerald-400"
          )}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded metrics */}
      {expanded && axis.metrics.length > 0 && (
        <div className={cn(
          "px-4 pb-4 pt-2 border-t",
          axis.exceeded ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"
        )}>
          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {axis.metrics.map((metric, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-2 rounded border",
                  axis.exceeded 
                    ? "bg-red-500/10 border-red-500/20" 
                    : "bg-emerald-500/10 border-emerald-500/20"
                )}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  {metric.name}
                </p>
                <p className={cn(
                  "font-mono text-sm",
                  axis.exceeded ? "text-red-300" : "text-emerald-300"
                )}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GeometryScanTrace({ 
  data, 
  isProcessing = false,
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

  const exceededCount = data.axes.filter(a => a.exceeded).length;
  const passCount = data.axes.filter(a => !a.exceeded).length;

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
          {exceededCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {exceededCount}
            </span>
          )}
          {passCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {passCount}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground px-4 pb-2">
        Execution trace of CR-G geometry constraints
      </p>
      <div className="forensic-panel-content space-y-2">
        {data.axes.map((axis, idx) => (
          <AxisRow key={idx} axis={axis} index={idx} />
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
