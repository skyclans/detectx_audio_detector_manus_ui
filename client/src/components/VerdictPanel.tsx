/**
 * VerdictPanel - Stateless Presentation Component
 * 
 * INTEGRATION RULES (MANDATORY):
 * - Must display the provided verdict text verbatim
 * - No verdict derivation or interpretation
 * - Accept verdict object from props only
 * - All verdict authority provided externally by DetectX
 * 
 * ALLOWED VERDICT TEXTS (ONLY TWO):
 * - "AI signal evidence was observed."
 * - "AI signal evidence was not observed."
 * 
 * NO probability, NO confidence, NO severity, NO AI model attribution.
 * This is a forensic evidence viewer, not an AI classifier.
 */

import { cn } from "@/lib/utils";

/**
 * Verdict result interface (matches DetectXAudioState.verdict)
 */
interface VerdictResult {
  verdict: "AI signal evidence was observed." | "AI signal evidence was not observed." | null;
  authority: "CR-G";
  exceeded_axes: string[];
}

interface VerdictPanelProps {
  /** Verdict result from CR-G analysis (injected) */
  verdict: VerdictResult | null;
  /** Whether verification is in progress */
  isProcessing?: boolean;
}

/**
 * VerdictPanel Component
 * 
 * Stateless presentation component that displays verdict results.
 * No verdict derivation, interpretation, or calculation.
 * All verdict authority is provided externally by DetectX.
 */
export function VerdictPanel({
  verdict,
  isProcessing = false,
}: VerdictPanelProps) {
  // Processing state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Verification Result</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">
              Inspecting structural signals...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No verdict yet
  if (!verdict || !verdict.verdict) {
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

  // Determine display style based on verdict text
  const isObserved = verdict.verdict === "AI signal evidence was observed.";

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Verification Result</div>
      <div className="forensic-panel-content space-y-6">
        {/* Main verdict - displayed verbatim from props */}
        <div
          className={cn(
            "p-4 rounded-md border-l-4",
            isObserved
              ? "bg-forensic-amber/10 border-forensic-amber"
              : "bg-forensic-green/10 border-forensic-green"
          )}
        >
          <p
            className={cn(
              "text-lg font-medium",
              isObserved ? "text-forensic-amber" : "text-forensic-green"
            )}
          >
            {verdict.verdict}
          </p>
        </div>

        {/* CR-G Status information - structural data only */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Authority
            </span>
            <span className="text-sm font-mono text-foreground">
              {verdict.authority}
            </span>
          </div>

          {verdict.exceeded_axes.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Exceeded Axes
              </span>
              <span className="text-sm font-mono text-foreground">
                {verdict.exceeded_axes.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Forensic disclaimer */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This result reports structural signal evidence only. The system does not
          estimate probability, attribute authorship, or reference any specific AI
          model names.
        </p>
      </div>
    </div>
  );
}
