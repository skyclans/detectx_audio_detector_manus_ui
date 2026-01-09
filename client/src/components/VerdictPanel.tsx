import React from "react";

/**
 * VerdictPanel - Forensic Evidence Viewer
 * 
 * ABSOLUTE CONSTRAINTS (MUST BE FOLLOWED):
 * 1) Do NOT infer, derive, reinterpret, normalize, or reason about any data.
 * 2) Do NOT reimplement, refactor, simplify, or modify any DetectX-provided code.
 * 3) Do NOT add helper logic, mapping logic, fallback logic, or convenience abstractions.
 * 4) Use ONLY the code, types, and data structures explicitly provided by DetectX, exactly as-is.
 * 5) Any deviation from DetectX-provided code or contracts is prohibited.
 * 
 * RUNTIME RULES:
 * - The verdict value is already finalized by DetectX.
 * - The UI must render the verdict text verbatim.
 * - The UI must not derive verdicts from exceeded_axes or any other fields.
 * - The UI must not compute probabilities, scores, confidence levels, or classifications.
 * - The UI must not implement or simulate CR-G logic, thresholds, or decision rules.
 * - exceeded_axes may be displayed only as contextual information and must not affect behavior.
 * 
 * This UI is a forensic evidence viewer only.
 * It must not explain, analyze, justify, or reason about the verdict.
 * It must only display the provided result.
 */

import { cn } from "@/lib/utils";

/**
 * DetectX Verification Result Contract (LOCKED - DO NOT MODIFY)
 */
type DetectXVerdictText =
  | "AI signal evidence was observed."
  | "AI signal evidence was not observed.";

interface DetectXVerificationResult {
  verdict: DetectXVerdictText;
  authority: "CR-G";
  exceeded_axes: string[];
}

interface VerdictPanelProps {
  /** DetectX verification result - render verbatim */
  verdict: DetectXVerificationResult | null;
  /** Whether verification is in progress */
  isProcessing?: boolean;
}

/**
 * VerdictPanel Component
 * 
 * Displays DetectX verification result verbatim.
 * No derivation, interpretation, or calculation.
 */
export function VerdictPanel({
  verdict,
  isProcessing = false,
}: VerdictPanelProps) {
  // Processing state - neutral "inspecting structural signals" state
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

  // Null result - neutral "no result yet" state
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

  // Display style based on verdict text (visual only, does not affect behavior)
  const isObserved = verdict.verdict === "AI signal evidence was observed.";

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Verification Result</div>
      <div className="forensic-panel-content space-y-6">
        {/* Main verdict - rendered verbatim from DetectX */}
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

        {/* Authority - displayed verbatim */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Authority
            </span>
            <span className="text-sm font-mono text-foreground">
              {verdict.authority}
            </span>
          </div>

          {/* Exceeded axes - contextual information only, does not affect behavior */}
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
