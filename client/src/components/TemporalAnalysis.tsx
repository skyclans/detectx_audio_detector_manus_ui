/**
 * Temporal Analysis Section
 * 
 * Displays temporal pattern analysis from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 */

interface TemporalAnalysisData {
  patterns: {
    type: string;
    interval: number;
    count: number;
  }[];
  consistency: string;
  anomalyRegions: {
    start: number;
    end: number;
  }[];
}

interface TemporalAnalysisProps {
  data: TemporalAnalysisData | null;
  isProcessing?: boolean;
}

function formatInterval(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function TemporalAnalysis({ data, isProcessing = false }: TemporalAnalysisProps) {
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Temporal Analysis</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Analyzing temporal patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Temporal Analysis</div>
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
      <div className="forensic-panel-header">Temporal Analysis</div>
      <div className="forensic-panel-content space-y-4">
        {/* Consistency status */}
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Temporal Consistency
          </span>
          <span className="text-sm font-mono text-foreground">
            {data.consistency}
          </span>
        </div>

        {/* Patterns */}
        {data.patterns.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Detected Patterns
            </div>
            <div className="space-y-1">
              {data.patterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 bg-muted/20 rounded"
                >
                  <span className="text-foreground">{pattern.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground">
                      {formatInterval(pattern.interval)}
                    </span>
                    <span className="text-muted-foreground">×{pattern.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomaly regions */}
        {data.anomalyRegions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Anomaly Regions ({data.anomalyRegions.length})
            </div>
            <div className="text-xs text-muted-foreground">
              {data.anomalyRegions.length} region(s) identified
            </div>
          </div>
        )}

        {data.patterns.length === 0 && data.anomalyRegions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No temporal patterns identified
          </p>
        )}
      </div>
    </div>
  );
}
