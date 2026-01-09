import { cn } from "@/lib/utils";

interface VerdictPanelProps {
  verdict: "observed" | "not_observed" | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  isProcessing?: boolean;
}

// ONLY allowed verdict texts - no alternatives
const VERDICT_TEXTS = {
  observed: "AI signal evidence was observed.",
  not_observed: "AI signal evidence was not observed.",
} as const;

export function VerdictPanel({
  verdict,
  crgStatus,
  primaryExceededAxis,
  isProcessing = false,
}: VerdictPanelProps) {
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Verification Result</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">
              Analyzing structural signals...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!verdict) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Verification Result</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-8">
            Upload and verify an audio file to see results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Verification Result</div>
      <div className="forensic-panel-content space-y-6">
        {/* Main verdict - NO icons, NO confidence score, NO percentage */}
        <div
          className={cn(
            "p-4 rounded-md border-l-4",
            verdict === "observed"
              ? "bg-forensic-amber/10 border-forensic-amber"
              : "bg-forensic-green/10 border-forensic-green"
          )}
        >
          <p
            className={cn(
              "text-lg font-medium",
              verdict === "observed" ? "text-forensic-amber" : "text-forensic-green"
            )}
          >
            {VERDICT_TEXTS[verdict]}
          </p>
        </div>

        {/* CR-G Status information */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              CR-G Status
            </span>
            <span className="text-sm font-mono text-foreground">
              {crgStatus || "—"}
            </span>
          </div>

          {primaryExceededAxis && (
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Primary Exceeded Axis
              </span>
              <span className="text-sm font-mono text-foreground">
                {primaryExceededAxis}
              </span>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This result reports structural signal evidence only. The system does not
          estimate probability, attribute authorship, or reference any specific AI
          model names.
        </p>
      </div>
    </div>
  );
}
