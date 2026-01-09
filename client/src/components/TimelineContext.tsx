interface TimelineMarker {
  timestamp: number; // milliseconds
  type: string;
}

interface TimelineContextProps {
  markers: TimelineMarker[];
  duration: number; // seconds
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

// Map internal type names to display labels
const TYPE_LABELS: Record<string, string> = {
  structural_event: "Structural Event",
  signal_anomaly: "Signal Anomaly",
  pattern_break: "Pattern Break",
  spectral_shift: "Spectral Shift",
};

export function TimelineContext({ markers, duration }: TimelineContextProps) {
  if (markers.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Geometry & Timeline Context</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-4">
            No structural events detected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Geometry & Timeline Context</div>
      <div className="forensic-panel-content space-y-4">
        {/* Timeline bar visualization */}
        <div className="relative h-8 bg-muted/30 rounded overflow-hidden">
          {/* Duration bar */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-border" />
          </div>

          {/* Markers - evidence only, no severity scores */}
          {markers.map((marker, idx) => {
            const position = (marker.timestamp / (duration * 1000)) * 100;
            return (
              <div
                key={idx}
                className="absolute top-0 bottom-0 w-0.5 bg-forensic-cyan"
                style={{ left: `${position}%` }}
                title={`${TYPE_LABELS[marker.type] || marker.type} at ${formatTimestamp(marker.timestamp)}`}
              />
            );
          })}
        </div>

        {/* Marker list - NO severity scores, NO probability, NO AI attribution */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Detected Events ({markers.length})
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {markers.map((marker, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-forensic-cyan/20 text-forensic-cyan text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-foreground">
                    {TYPE_LABELS[marker.type] || marker.type}
                  </span>
                </div>
                <span className="font-mono text-muted-foreground">
                  {formatTimestamp(marker.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <p className="text-[10px] text-muted-foreground">
          Timeline markers indicate structural event locations only. No severity
          scores, probability values, or AI attribution data are displayed.
        </p>
      </div>
    </div>
  );
}
