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
  /** Primary engine confidence score (0.0-1.0). Display only. */
  cnnScore?: number | null;
  /** Final score (0.0-1.0). Sourced from the secondary engine when
   *  it has been invoked; otherwise equals the primary engine score. */
  finalScore?: number | null;
  /** "cnn" or "recon" — source of finalScore */
  finalScoreSource?: string | null;
  /** Server-computed tier label.
   *  One of: "human" | "mixed-human" | "mixed-ai" | "ai" | "unknown" */
  tier?: string | null;
  /** Whether verification is in progress */
  isProcessing?: boolean;
  /** Scan progress 0-100 */
  progress?: number;
}

/**
 * 4-tier display label keyed off the server-computed tier. The bundle
 * never compares scores against the band boundaries; the server is the
 * authority on tier classification.
 */
type VerdictTier = "human" | "mixed-human" | "mixed-ai" | "ai" | "unknown";

function getDisplayLabelFromTier(tier: VerdictTier, backendVerdict: string): string {
  switch (tier) {
    case "human":
      return "AI Signal Not Observed";
    case "mixed-human":
      return "AI Signal Not Observed — Recovered by Deep Scan Analysis";
    case "mixed-ai":
      return "AI Signal Observed — Confirmed by Deep Scan Analysis";
    case "ai":
      return "AI Signal Observed";
    case "unknown":
    default:
      return backendVerdict || "Pending";
  }
}

function normalizeTier(tier: string | null | undefined): VerdictTier {
  switch (tier) {
    case "human":
    case "mixed-human":
    case "mixed-ai":
    case "ai":
      return tier;
    default:
      return "unknown";
  }
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
  finalScore = null,
  finalScoreSource = null,
  tier: serverTier = null,
  isProcessing = false,
  progress = 0,
}: VerdictPanelProps) {
  // Display score: prefer finalScore (RECON-based in Mixed range) over cnnScore.
  // Backward compat: if finalScore not provided, fall back to cnnScore.
  const displayScore = finalScore != null ? finalScore : cnnScore;
  const isReconSource = finalScoreSource === "recon";
  // Processing state - progress bar with stage info
  if (isProcessing) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const stageLabel =
      clampedProgress < 20 ? "Initializing engines..." :
      clampedProgress < 50 ? "Running DetectX Engine..." :
      clampedProgress < 75 ? "Deep Forensic analysis..." :
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

  // 4-tier label is driven by the server-computed tier (no client-side
  // threshold comparison). Backend verdict text remains binary and
  // authoritative; the tier label is a display-only enrichment that
  // surfaces Deep Scan recovery / confirmation.
  const tier = normalizeTier(serverTier);
  const displayLabel = getDisplayLabelFromTier(tier, verdict.verdict);

  const isMixedHuman = tier === "mixed-human";
  const isMixedAi = tier === "mixed-ai";
  const isAiObserved = tier === "ai";

  // Tier color mapping
  //   human         → green   (AI signal not observed)
  //   mixed-human   → green-amber (recovered by deep scan — still Human)
  //   mixed-ai      → amber   (confirmed by deep scan)
  //   ai            → amber   (AI signal observed)
  const verdictBoxClass =
    tier === "human" ? "bg-forensic-green/10 border-forensic-green" :
    tier === "mixed-human" ? "bg-emerald-500/10 border-emerald-500" :
    tier === "mixed-ai" ? "bg-amber-500/10 border-amber-500" :
    tier === "ai" ? "bg-forensic-amber/10 border-forensic-amber" :
    "bg-forensic-green/10 border-forensic-green";

  const verdictTextClass =
    tier === "human" ? "text-forensic-green" :
    tier === "mixed-human" ? "text-emerald-400" :
    tier === "mixed-ai" ? "text-amber-400" :
    tier === "ai" ? "text-forensic-amber" :
    "text-forensic-green";

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Verification Result</div>
      <div className="forensic-panel-content space-y-6">
        {/* Main verdict - DISPLAY label driven by CNN score (backend text preserved) */}
        <div className={cn("p-4 rounded-md border-l-4", verdictBoxClass)}>
          <p className={cn("text-lg font-medium", verdictTextClass)}>
            {displayLabel}
          </p>

          {/* AI Signal / Human percentages — sourced from finalScore (RECON in Mixed range, CNN elsewhere) */}
          {displayScore != null && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-foreground/80">
                AI Signal:{" "}
                <span className="font-mono">{(displayScore * 100).toFixed(1)}%</span>
              </span>
              <span className="text-foreground/80">
                Human:{" "}
                <span className="font-mono">{((1 - displayScore) * 100).toFixed(1)}%</span>
              </span>
              {isReconSource && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  source: Deep Scan
                </span>
              )}
            </div>
          )}

          {/* Deep Scan recovery / confirmation note (50-80% range) */}
          {isMixedHuman && (
            <p className="mt-2 text-xs text-emerald-400/90">
              Primary engine flagged at {(cnnScore! * 100).toFixed(1)}%.
              Secondary reconstruction analysis recovered the result as Human signal
              ({((displayScore ?? cnnScore!) * 100).toFixed(1)}% AI signal).
              Expert review recommended.
            </p>
          )}
          {isMixedAi && (
            <p className="mt-2 text-xs text-amber-400/90">
              Primary engine flagged at {(cnnScore! * 100).toFixed(1)}%.
              Secondary reconstruction analysis confirmed AI signal
              ({((displayScore ?? cnnScore!) * 100).toFixed(1)}% AI signal).
              Expert review recommended.
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

        {/* Forensic disclaimer (legal evidence tone) */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This result reports structural signal evidence only.
          DetectX does not determine authorship, intent, or ownership.
          Detection is based on signal-level structural analysis of the
          submitted audio. Audio with extensive post-processing, synthesis,
          or heavy digital manipulation may exhibit signal characteristics
          similar to AI-generated music.
          {isAiObserved && (
            <span className="block mt-2 text-forensic-amber/80">
              Verification engine recorded measurements exceeding the
              defined structural thresholds.
            </span>
          )}
        </p>

        {/* Measurement disclaimer (legal evidence tone) */}
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          ※ DetectX 측정 결과는 구조적 신호 분석에 한정된 forensic 자료입니다.
          최종 판단 및 적용은 소속 기관·법원·관계 당국의 정책에 따릅니다.
        </p>
      </div>
    </div>
  );
}
