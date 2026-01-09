/**
 * Timeline Analysis Section
 * 
 * Displays temporal signal analysis data from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 */

interface TimelineAnalysisData {
  segments: {
    startTime: number;
    endTime: number;
    label: string;
  }[];
  totalDuration: number;
}

interface TimelineAnalysisProps {
  data: TimelineAnalysisData | null;
  isProcessing?: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TimelineAnalysis({ data, isProcessing = false }: TimelineAnalysisProps) {
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Timeline Analysis</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Analyzing timeline structure...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Timeline Analysis</div>
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
      <div className="forensic-panel-header">Timeline Analysis</div>
      <div className="forensic-panel-content space-y-4">
        {/* Timeline visualization */}
        <div className="relative h-6 bg-muted/30 rounded overflow-hidden">
          {data.segments.map((segment, idx) => {
            const startPercent = (segment.startTime / data.totalDuration) * 100;
            const widthPercent = ((segment.endTime - segment.startTime) / data.totalDuration) * 100;
            return (
              <div
                key={idx}
                className="absolute top-0 bottom-0 bg-forensic-cyan/30 border-l border-r border-forensic-cyan/50"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                }}
                title={`${segment.label}: ${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
              />
            );
          })}
        </div>

        {/* Segment list */}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {data.segments.map((segment, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1.5 px-2 bg-muted/20 rounded"
            >
              <span className="text-foreground">{segment.label}</span>
              <span className="font-mono text-muted-foreground">
                {formatTime(segment.startTime)} — {formatTime(segment.endTime)}
              </span>
            </div>
          ))}
        </div>

        {data.segments.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No timeline segments identified
          </p>
        )}
      </div>
    </div>
  );
}
