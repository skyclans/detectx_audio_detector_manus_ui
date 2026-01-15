import React, { useEffect, useState } from "react";

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
  // Animation state for result reveal
  const [showResult, setShowResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<"idle" | "scanning" | "revealing" | "complete">("idle");

  // Trigger animation when verdict changes from null to value
  useEffect(() => {
    if (verdict && !isProcessing) {
      setAnimationPhase("revealing");
      // Start reveal animation
      setTimeout(() => {
        setShowResult(true);
        setAnimationPhase("complete");
      }, 300);
    } else if (isProcessing) {
      setShowResult(false);
      setAnimationPhase("scanning");
    } else {
      setShowResult(false);
      setAnimationPhase("idle");
    }
  }, [verdict, isProcessing]);

  // Processing state - animated scanning effect
  if (isProcessing) {
    return (
      <div className="forensic-panel overflow-hidden">
        <div className="forensic-panel-header">Verification Result</div>
        <div className="forensic-panel-content relative">
          {/* Scanning animation overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-forensic-cyan/5 via-forensic-cyan/10 to-transparent animate-scan-line" />
          </div>
          
          <div className="flex flex-col items-center justify-center py-8 relative z-10">
            {/* Pulsing scanner icon */}
            <div className="relative mb-4">
              <div className="w-12 h-12 border-2 border-forensic-cyan/30 rounded-full animate-ping absolute inset-0" />
              <div className="w-12 h-12 border-2 border-forensic-cyan border-t-transparent rounded-full animate-spin" />
            </div>
            
            {/* Animated text */}
            <p className="text-sm text-forensic-cyan animate-pulse">
              Inspecting structural signals...
            </p>
            
            {/* Progress dots */}
            <div className="flex gap-1 mt-3">
              <span className="w-2 h-2 bg-forensic-cyan/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-forensic-cyan/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-forensic-cyan/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
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
    <div className="forensic-panel overflow-hidden">
      <div className="forensic-panel-header">Verification Result</div>
      <div className={cn(
        "forensic-panel-content space-y-6 transition-all duration-500",
        showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {/* Main verdict - rendered verbatim from DetectX with animation */}
        <div
          className={cn(
            "p-4 rounded-md border-l-4 transition-all duration-700",
            isObserved
              ? "bg-forensic-amber/10 border-forensic-amber"
              : "bg-forensic-green/10 border-forensic-green",
            showResult ? "scale-100" : "scale-95"
          )}
        >
          {/* Verdict icon with animation */}
          <div className={cn(
            "flex items-center gap-3 mb-2 transition-all duration-500 delay-200",
            showResult ? "opacity-100" : "opacity-0"
          )}>
            {isObserved ? (
              <div className="w-8 h-8 rounded-full bg-forensic-amber/20 flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5 text-forensic-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-forensic-green/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-forensic-green animate-check-mark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider",
              isObserved ? "text-forensic-amber" : "text-forensic-green"
            )}>
              {isObserved ? "Signal Detected" : "No Signal Detected"}
            </span>
          </div>
          
          <p
            className={cn(
              "text-lg font-medium transition-all duration-500 delay-300",
              isObserved ? "text-forensic-amber" : "text-forensic-green",
              showResult ? "opacity-100" : "opacity-0"
            )}
          >
            {verdict.verdict}
          </p>
        </div>

        {/* Authority - displayed verbatim with fade-in */}
        <div className={cn(
          "space-y-3 transition-all duration-500 delay-400",
          showResult ? "opacity-100" : "opacity-0"
        )}>
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

        {/* Forensic disclaimer with fade-in */}
        <p className={cn(
          "text-[10px] text-muted-foreground leading-relaxed transition-all duration-500 delay-500",
          showResult ? "opacity-100" : "opacity-0"
        )}>
          This result reports structural signal evidence only. The system does not
          estimate probability, attribute authorship, or reference any specific AI
          model names.
          {isObserved && (
            <span className="block mt-2 text-forensic-amber/80">
              Note: Some music genres may produce false positives. If you believe this is incorrect,
              please re-verify using Human-Oriented mode for maximum human protection.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
