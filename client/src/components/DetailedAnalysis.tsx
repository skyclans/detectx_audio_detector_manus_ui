/**
 * Detailed Analysis Section
 * 
 * Displays detailed structural analysis from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 * NO probability, NO confidence scores, NO severity labels.
 */

interface DetailedAnalysisData {
  spectralFeatures: {
    name: string;
    value: string;
  }[];
  structuralMetrics: {
    name: string;
    value: string;
  }[];
  observations: string[];
}

interface DetailedAnalysisProps {
  data: DetailedAnalysisData | null;
  isProcessing?: boolean;
}

export function DetailedAnalysis({ data, isProcessing = false }: DetailedAnalysisProps) {
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Detailed Analysis</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Performing detailed analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Detailed Analysis</div>
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
      <div className="forensic-panel-header">Detailed Analysis</div>
      <div className="forensic-panel-content space-y-4">
        {/* Spectral Features */}
        {data.spectralFeatures.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Spectral Features
            </div>
            <div className="space-y-1">
              {data.spectralFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 bg-muted/20 rounded"
                >
                  <span className="text-foreground">{feature.name}</span>
                  <span className="font-mono text-muted-foreground">{feature.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structural Metrics */}
        {data.structuralMetrics.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Structural Metrics
            </div>
            <div className="space-y-1">
              {data.structuralMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 bg-muted/20 rounded"
                >
                  <span className="text-foreground">{metric.name}</span>
                  <span className="font-mono text-muted-foreground">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        {data.observations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Observations
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {data.observations.map((obs, idx) => (
                <li key={idx} className="pl-2 border-l-2 border-border">
                  {obs}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.spectralFeatures.length === 0 &&
          data.structuralMetrics.length === 0 &&
          data.observations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              No detailed analysis data available
            </p>
          )}
      </div>
    </div>
  );
}
