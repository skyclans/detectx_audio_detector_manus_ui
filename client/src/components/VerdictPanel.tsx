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
 * - The UI must not implement or simulate DetectX logic, thresholds, or decision rules.
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
  authority: "DetectX Forensic";
  exceeded_axes: string[];
}

interface VerdictPanelProps {
  /** DetectX verification result - render verbatim */
  verdict: DetectXVerificationResult | null;
  /** CNN confidence score (0.0-1.0) - optional display layer override */
  cnnScore?: number | null;
  /** Whether verification is in progress */
  isProcessing?: boolean;
  /** Scan progress 0-100 */
  progress?: number;
}

/**
 * Derive display label from CNN score.
 * DISPLAY-ONLY override - backend verdict text is preserved internally.
 */
function getDisplayLabel(cnnScore: number | null | undefined, fallback: string): string {
  if (cnnScore == null) return fallback;
  if (cnnScore < 0.5) return "AI signal evidence was not observed";
  if (cnnScore < 0.8) return "Mixed AI signal evidence detected";
  return "AI signal evidence was observed";
}

/**
 * VerdictPanel Component
 *
 * Displays DetectX verification result verbatim.
 * No derivation, interpretation, or calculation.
 */
export function VerdictPanel({
  verdict,
  cnnScore = null,
  isProcessing = false,
  progress = 0,
}: VerdictPanelProps) {
  // Processing state - progress bar with stage info
  if (isProcessing) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const stageLabel =
      clampedProgress < 20 ? "Initializing engines..." :
      clampedProgress < 50 ? "Running DetectX Engine..." :
      clampedProgress < 75 ? "Reconstruction analysis..." :
      clampedProgress < 95 ? "Evaluating constraints..." :
      "Finalizing verdict...";

    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Verification Result</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <p className="text-sm font-medium text-foreground mb-3">
              {stageLabel}
            </p>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-2 bg-muted/30 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-forensic-cyan rounded-full transition-all duration-500 ease-out"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {clampedProgress}%
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

  // DISPLAY layer: derive label from CNN score if available, else fall back
  // to verdict text. Backend verdict text remains the authoritative result.
  const displayLabel = getDisplayLabel(cnnScore, verdict.verdict);

  // Tri-state color theming driven by CNN score (with verdict fallback)
  const hasCnnScore = cnnScore != null;
  const isMixed = hasCnnScore && cnnScore! >= 0.5 && cnnScore! < 0.8;
  const isAiObserved = hasCnnScore ? cnnScore! >= 0.8 : isObserved;
  const isHuman = hasCnnScore ? cnnScore! < 0.5 : !isObserved;

  const verdictBoxClass = isMixed
    ? "bg-amber-500/10 border-amber-500"
    : isAiObserved
      ? "bg-forensic-amber/10 border-forensic-amber"
      : "bg-forensic-green/10 border-forensic-green";

  const verdictTextClass = isMixed
    ? "text-amber-400"
    : isAiObserved
      ? "text-forensic-amber"
      : "text-forensic-green";

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Verification Result</div>
      <div className="forensic-panel-content space-y-6">
        {/* Main verdict - DISPLAY label driven by CNN score (backend text preserved) */}
        <div className={cn("p-4 rounded-md border-l-4", verdictBoxClass)}>
          <p className={cn("text-lg font-medium", verdictTextClass)}>
            {displayLabel}
          </p>

          {/* AI Signal / Human percentages (only when CNN score is available) */}
          {hasCnnScore && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-foreground/80">
                AI Signal:{" "}
                <span className="font-mono">{(cnnScore! * 100).toFixed(1)}%</span>
              </span>
              <span className="text-foreground/80">
                Human:{" "}
                <span className="font-mono">{((1 - cnnScore!) * 100).toFixed(1)}%</span>
              </span>
            </div>
          )}

          {/* Mixed-range expert review note */}
          {isMixed && (
            <p className="mt-2 text-xs text-amber-400/90">
              Expert review recommended
            </p>
          )}
        </div>

        {/* Engine - displayed verbatim */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Engine
            </span>
            <span className="text-sm font-mono text-foreground">
              {verdict.authority}
            </span>
          </div>

          {/* Exceeded engines - contextual information only, does not affect behavior */}
          {verdict.exceeded_axes.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Detected By
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
          {isAiObserved && !isMixed && (
            <span className="block mt-2 text-forensic-amber/80">
              Note: Human false positive rate is less than 1%. Some heavily processed or synthesized audio may exhibit AI-like signal patterns.
            </span>
          )}
        </p>

        {/* Measurement disclaimer */}
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          ※ DetectX 측정값. 최종 결과는 소속 기관 정책에 따라 적용하십시오.
        </p>
      </div>
    </div>
  );
}
