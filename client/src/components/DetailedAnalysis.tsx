/**
 * Detailed Analysis Section
 * 
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

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
const AXIS_HEADERS: Record<AxisId, { title: string; note?: string }> = {
  "G1-A": {
    title: "G1-A — Residual Trajectory Curvature",
    note: "Observational axis (does not influence verdict)",
  },
  "G1-B": {
    title: "G1-B — Residual Persistence Length",
  },
  "G2-A": {
    title: "G2-A — Cross-Stem Coupling",
  },
  "G2-B": {
    title: "G2-B — Residual Symmetry",
  },
  "G3-A": {
    title: "G3-A — Band Geometry",
  },
};

// Fixed axis order
const AXIS_ORDER: AxisId[] = ["G1-A", "G1-B", "G2-A", "G2-B", "G3-A"];

function AxisCard({ axis }: { axis: AxisData | null; axisId: AxisId }) {
  const header = AXIS_HEADERS[axis?.id || "G1-A"];
  
  // Empty Axis State
  if (!axis) {
    return (
      <div className="bg-muted/20 rounded-lg p-3">
        <div className="text-xs font-medium text-foreground mb-1">
          {header.title}
        </div>
        {header.note && (
          <div className="text-xs text-muted-foreground italic mb-2">
            {header.note}
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center py-2">
          No data available for this axis
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 rounded-lg p-3">
      <div className="text-xs font-medium text-foreground mb-1">
        {AXIS_HEADERS[axis.id].title}
      </div>
      {AXIS_HEADERS[axis.id].note && (
        <div className="text-xs text-muted-foreground italic mb-2">
          {AXIS_HEADERS[axis.id].note}
        </div>
      )}
      
      {/* Status Label */}
      <div className={`text-xs font-medium mb-2 ${
        axis.status === "exceeded" 
          ? "text-red-400" 
          : "text-green-400"
      }`}>
        {axis.status === "exceeded" ? "Status: Exceeded" : "Status: Within bounds"}
      </div>

      {/* Metrics Table */}
      {axis.metrics.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-b border-border pb-1 mb-1">
            <span>Metric</span>
            <span>Value</span>
          </div>
          {axis.metrics.map((metric, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-foreground">{metric.name}</span>
              <span className="font-mono text-muted-foreground">{metric.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DetailedAnalysis({ axes, isProcessing = false }: DetailedAnalysisProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header">Detailed Analysis</div>
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
  if (!axes) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header">Detailed Analysis</div>
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

  // Create axis map for lookup
  const axisMap = new Map(axes.map(a => [a.id, a]));

  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header">Detailed Analysis</div>
      <p className="text-xs text-muted-foreground mb-3">
        Axis-level geometry metrics reported by the verification engine
      </p>
      <div className="forensic-panel-content space-y-3 max-h-[400px] overflow-y-auto">
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
