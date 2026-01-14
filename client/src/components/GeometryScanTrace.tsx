/**
 * Geometry Scan Trace Section
 * 
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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

// Row labels from specification
const ROW_LABELS = {
  axis: "Axis",
  exceeded: "Exceeded",
  metrics: "Metrics",
};

function AxisRow({ axis }: { axis: GeometryTraceAxis }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-muted/20 rounded">
      {/* Main row */}
      <div className="grid grid-cols-3 gap-3 items-center py-2 px-3">
        {/* Axis */}
        <span className="text-xs font-mono text-foreground">{axis.axis}</span>

        {/* Exceeded */}
        <span className={`text-xs font-medium ${
          axis.exceeded ? "text-red-400" : "text-green-400"
        }`}>
          {axis.exceeded ? "Yes" : "No"}
        </span>

        {/* Metrics expand/collapse */}
        <div className="flex justify-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {expanded ? (
              <>
                Hide metrics
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                View metrics
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded metrics */}
      {expanded && axis.metrics.length > 0 && (
        <div className="px-3 pb-3 pt-1 border-t border-border/20">
          <div className="space-y-1">
            {axis.metrics.map((metric, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 text-xs py-1">
                <span className="text-muted-foreground">{metric.name}</span>
                <span className="font-mono text-foreground">{metric.value}</span>
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
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">Inspecting structural signals…</p>
            <p className="text-xs text-muted-foreground mt-1">Verification is in progress.</p>
          </div>
        </div>
      </div>
    );
  }

  // Before Verification state
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-6">
            Awaiting verification
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Upload an audio file and start verification to view results.
          </p>
        </div>
      </div>
    );
  }

  // Empty State (no trace data)
  if (!data.axes || data.axes.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-4">
            No geometry trace available
          </p>
          <p className="text-xs text-muted-foreground text-center">
            No geometry trace data was returned for this scan.
          </p>
        </div>
      </div>
    );
  }

  // Data available state
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Geometry Scan Trace</div>
      <p className="text-xs text-muted-foreground mb-3">
        Execution trace of geometry checks performed by the verification engine
      </p>
      <div className="forensic-panel-content">
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-3 text-xs font-medium text-muted-foreground border-b border-border pb-2 mb-2 px-3">
          <span>{ROW_LABELS.axis}</span>
          <span>{ROW_LABELS.exceeded}</span>
          <span className="text-right">{ROW_LABELS.metrics}</span>
        </div>

        {/* Axis rows */}
        <div className="space-y-2">
          {data.axes.map((axis, idx) => (
            <AxisRow key={idx} axis={axis} />
          ))}
        </div>

        {/* Fixed Disclaimer */}
        <div className={cn(
          "mt-4 pt-3 border-t border-border/30",
          "text-xs text-muted-foreground text-center italic"
        )}>
          This trace is display-only. No analysis or interpretation is performed in the UI.
        </div>
      </div>
    </div>
  );
}

export type { GeometryScanTraceData, GeometryTraceAxis, AxisMetric };
