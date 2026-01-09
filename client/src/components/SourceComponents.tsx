/**
 * Source Components Section
 * 
 * Displays identified source component analysis from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 * NO AI model names, NO probability, NO confidence scores.
 */

interface SourceComponentData {
  components: {
    id: string;
    type: string;
    description: string;
  }[];
  layerCount: number;
  compositionType: string;
}

interface SourceComponentsProps {
  data: SourceComponentData | null;
  isProcessing?: boolean;
}

export function SourceComponents({ data, isProcessing = false }: SourceComponentsProps) {
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Identifying source components...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Source Components</div>
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
      <div className="forensic-panel-header">Source Components</div>
      <div className="forensic-panel-content space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="py-2 px-3 bg-muted/20 rounded">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Layer Count
            </div>
            <div className="text-sm font-mono text-foreground">{data.layerCount}</div>
          </div>
          <div className="py-2 px-3 bg-muted/20 rounded">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Composition
            </div>
            <div className="text-sm font-mono text-foreground">{data.compositionType}</div>
          </div>
        </div>

        {/* Components list */}
        {data.components.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Identified Components ({data.components.length})
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.components.map((component) => (
                <div
                  key={component.id}
                  className="py-2 px-3 bg-muted/20 rounded"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-forensic-cyan">{component.id}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {component.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.components.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No distinct source components identified
          </p>
        )}
      </div>
    </div>
  );
}
