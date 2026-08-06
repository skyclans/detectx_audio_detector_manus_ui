/**
 * DetectX Verification Result Contract (LOCKED)
 * 
 * DO NOT MODIFY THIS FILE.
 * These types are provided by DetectX and must be used exactly as-is.
 * Any deviation from these contracts is prohibited.
 */

/**
 * Verdict text type - fully resolved final text
 * DO NOT derive, interpret, or normalize
 *
 * Two sentences were added 2026-08-07. The multiclass engine abstains on the
 * band between the human line and the AI line, and reports a part-AI track as
 * its own outcome; the binary engine it replaced could produce neither. Every
 * sentence here is one the backend actually sends.
 */
export type DetectXVerdictText =
  | "AI signal evidence was observed."
  | "AI signal evidence was partially observed."
  | "AI signal evidence was inconclusive."
  | "AI signal evidence was not observed.";

/**
 * Verification result interface
 * DO NOT add helper logic, mapping logic, or convenience abstractions
 */
export interface DetectXVerificationResult {
  /** Fully resolved final verdict text - render verbatim */
  verdict: DetectXVerdictText;
  /** Authority source - DetectX Forensic */
  authority: "DetectX Forensic";
  /** Informational only - must not affect behavior */
  exceeded_axes: string[];
}
