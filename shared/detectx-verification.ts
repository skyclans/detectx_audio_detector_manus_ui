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
 */
export type DetectXVerdictText =
  | "AI signal evidence was observed."
  | "AI signal evidence was not observed.";

/**
 * Verification result interface
 * DO NOT add helper logic, mapping logic, or convenience abstractions
 */
export interface DetectXVerificationResult {
  /** Fully resolved final verdict text - render verbatim */
  verdict: DetectXVerdictText;
  /** Authority source - locked to CR-G */
  authority: "CR-G";
  /** Informational only - must not affect behavior */
  exceeded_axes: string[];
}
