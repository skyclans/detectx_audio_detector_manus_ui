/**
 * Geometry Scan Trace Section
 * 
 * Displays geometric scan trace analysis from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 * NO probability, NO confidence scores, NO severity labels.
 * 
 * LAYOUT OVERRIDE:
 * - When expanded=true, this section becomes visually dominant
 * - Increased height for better visualization
 * - Neumorphic / concave (inset) surface feeling
 */

import { cn } from "@/lib/utils";

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
  expanded?: boolean;
}

export function GeometryScanTrace({ 
  data, 
  isProcessing = false,
  expanded = false 
}: GeometryScanTraceProps) {
  // Dynamic height based on expanded state
  const visualizationHeight = expanded ? "h-64" : "h-24";
  const panelMinHeight = expanded ? "min-h-[400px]" : "";

  if (isProcessing) {
    return (
      <div className={cn("forensic-panel", panelMinHeight)}>
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content h-full">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs text-muted-foreground">Scanning geometry trace...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!data) {
    return (
      <div className={cn("forensic-panel", panelMinHeight)}>
        <div className="forensic-panel-header">Geometry Scan Trace</div>
        <div className="forensic-panel-content h-full">
          {/* Placeholder visualization with neumorphic inset feel */}
          <div className={cn(
            "relative bg-muted/10 rounded border border-border/30 overflow-hidden",
            "shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]",
            visualizationHeight
          )}>
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border-r border-b border-border/10" />
              ))}
            </div>
            
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full bg-border/20 absolute" />
              <div className="h-px w-full bg-border/20 absolute" />
            </div>
            
            {/* Idle indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
                Awaiting Scan Data
              </p>
            </div>
          </div>
          
          {/* Placeholder axis indicators */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["X-Axis", "Y-Axis", "Z-Axis"].map((axis) => (
              <div
                key={axis}
                className="flex items-center justify-between text-xs py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
              >
                <span className="text-muted-foreground/60 font-mono">{axis}</span>
                <span className="text-muted-foreground/40">--</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground text-center py-4 mt-4">
            Awaiting verification data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("forensic-panel", panelMinHeight)}>
      <div className="forensic-panel-header">Geometry Scan Trace</div>
      <div className="forensic-panel-content space-y-4">
        {/* Scan visualization - expanded with neumorphic inset feel */}
        <div className={cn(
          "relative bg-muted/10 rounded border border-border/30 overflow-hidden",
          "shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]",
          visualizationHeight
        )}>
          {/* Grid lines - denser for expanded view */}
          <div className={cn(
            "absolute inset-0",
            expanded ? "grid grid-cols-16 grid-rows-12" : "grid grid-cols-8 grid-rows-4"
          )}>
            {Array.from({ length: expanded ? 192 : 32 }).map((_, i) => (
              <div key={i} className="border-r border-b border-border/15" />
            ))}
          </div>
          
          {/* Center crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-full bg-forensic-cyan/20 absolute" />
            <div className="h-px w-full bg-forensic-cyan/20 absolute" />
          </div>
          
          {/* Scan points */}
          {data.scanPoints.map((point, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute bg-forensic-cyan rounded-full transition-all",
                expanded ? "w-2 h-2" : "w-1.5 h-1.5"
              )}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 6px rgba(0, 255, 255, 0.5)",
              }}
              title={point.label}
            />
          ))}
          
          {/* Scan trace lines connecting points */}
          {expanded && data.scanPoints.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={data.scanPoints.map(p => `${p.x}%,${p.y}%`).join(" ")}
                fill="none"
                stroke="rgba(0, 255, 255, 0.3)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            </svg>
          )}
        </div>

        {/* Boundary status */}
        <div className="flex justify-between items-center py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Boundary Status
          </span>
          <span className="text-sm font-mono text-foreground">
            {data.boundaryStatus}
          </span>
        </div>

        {/* Axis data - grid layout for expanded view */}
        {data.axisData.length > 0 && (
          <div className={cn(
            expanded ? "grid grid-cols-2 gap-2" : "space-y-1"
          )}>
            {data.axisData.map((axis, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
              >
                <span className="text-foreground font-mono">{axis.axis}</span>
                <span className="text-muted-foreground">{axis.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trace status */}
        <div className="flex justify-between items-center text-xs py-2 px-3 bg-muted/10 rounded border border-border/20">
          <span className="text-muted-foreground">Trace Status</span>
          <span className={data.traceComplete ? "text-forensic-green" : "text-forensic-amber"}>
            {data.traceComplete ? "Complete" : "Incomplete"}
          </span>
        </div>
      </div>
    </div>
  );
}
