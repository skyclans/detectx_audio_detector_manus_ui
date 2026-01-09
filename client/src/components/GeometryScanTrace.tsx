/**
 * Geometry Scan Trace Section
 * 
 * Displays geometric scan trace analysis from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 * NO probability, NO confidence scores, NO severity labels.
 */

interface GeometryScanTraceData {
  scanPoints: {
    x: number;
    y: number;
    label: string;
  }[];
  boundaryStatus: string;
  axisData: {
    axis: string;
    status: string;
  }[];
  traceComplete: boolean;
}

interface GeometryScanTraceProps {
  data: GeometryScanTraceData | null;
  isProcessing?: boolean;
}

export function GeometryScanTrace({ data, isProcessing = false }: GeometryScanTraceProps) {
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Scanning geometry trace...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-6">
            Awaiting verification data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Geometry Scan Trace</div>
      <div className="forensic-panel-content space-y-4">
        {/* Scan visualization placeholder */}
        <div className="relative h-24 bg-muted/20 rounded border border-border/50 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-4">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="border-r border-b border-border/20" />
            ))}
          </div>
          
          {/* Scan points */}
          {data.scanPoints.map((point, idx) => (
            <div
              key={idx}
              className="absolute w-1.5 h-1.5 bg-forensic-cyan rounded-full"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={point.label}
            />
          ))}
        </div>

        {/* Boundary status */}
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Boundary Status
          </span>
          <span className="text-sm font-mono text-foreground">
            {data.boundaryStatus}
          </span>
        </div>

        {/* Axis data */}
        {data.axisData.length > 0 && (
          <div className="space-y-1">
            {data.axisData.map((axis, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2 bg-muted/20 rounded"
              >
                <span className="text-foreground font-mono">{axis.axis}</span>
                <span className="text-muted-foreground">{axis.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trace status */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Trace Status</span>
          <span className={data.traceComplete ? "text-forensic-green" : "text-forensic-amber"}>
            {data.traceComplete ? "Complete" : "Incomplete"}
          </span>
        </div>
      </div>
    </div>
  );
}
