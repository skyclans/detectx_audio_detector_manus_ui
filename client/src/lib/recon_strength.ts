/**
 * RECON 7-Metric strength derivation.
 *
 * Background:
 *   The 7-metric binary count (e.g. "6/7 AI-consistent") can be misleading
 *   when most of those signals only marginally crossed the threshold.
 *   The DetectX continuous classifier weighs each crossing by its magnitude;
 *   this helper surfaces that magnitude so reports/UI can show *how far*
 *   each metric is past its threshold, not just yes/no.
 *
 * Margin convention (signed, AI-positive):
 *   - "<" direction (AI when value < threshold):
 *       margin = (threshold - value) / threshold
 *   - ">=" direction (AI when value >= threshold):
 *       margin = (value - threshold) / threshold
 *   Positive margin = AI side. Negative margin = Human side.
 *
 * Strength bucketing:
 *   margin >=  +30% → "strong-ai"
 *   0 <= margin <  +30% → "marginal-ai"
 *   -30% < margin < 0 → "marginal-human"
 *   margin <= -30%  → "strong-human"
 */

export type Direction = "<" | ">=";

export type Strength =
  | "strong-ai"
  | "marginal-ai"
  | "marginal-human"
  | "strong-human";

export const STRENGTH_THRESHOLD_PCT = 30;

export interface MetricStrength {
  /** Signed margin (AI-positive). Fraction, not percent. */
  margin: number;
  strength: Strength;
}

export function computeMetricStrength(
  value: number,
  threshold: number,
  direction: Direction,
): MetricStrength {
  let margin: number;
  if (direction === "<") {
    margin = (threshold - value) / threshold;
  } else {
    margin = (value - threshold) / threshold;
  }
  const pct = margin * 100;
  let strength: Strength;
  if (pct >= STRENGTH_THRESHOLD_PCT) strength = "strong-ai";
  else if (pct >= 0) strength = "marginal-ai";
  else if (pct > -STRENGTH_THRESHOLD_PCT) strength = "marginal-human";
  else strength = "strong-human";
  return { margin, strength };
}

export function strengthLabel(s: Strength): string {
  switch (s) {
    case "strong-ai":       return "Strong AI";
    case "marginal-ai":     return "Marginal AI";
    case "marginal-human":  return "Marginal Human";
    case "strong-human":    return "Strong Human";
  }
}

/** Hex / Tailwind-friendly color for strength badge. Matches forensic palette. */
export function strengthColor(s: Strength): { bg: string; text: string; border: string; hex: string } {
  switch (s) {
    case "strong-ai":
      return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40", hex: "#ef4444" };
    case "marginal-ai":
      return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40", hex: "#f59e0b" };
    case "marginal-human":
      return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40", hex: "#10b981" };
    case "strong-human":
      return { bg: "bg-emerald-700/15", text: "text-emerald-500", border: "border-emerald-700/40", hex: "#059669" };
  }
}

export function formatMarginPct(margin: number): string {
  const pct = margin * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

/**
 * Visual bar position. Returns a percentage [0, 100] indicating
 * where the marker should sit on a Human(0) <-> AI(100) spectrum.
 *
 * Margin is clipped to ±100% before mapping:
 *   margin = -100% → 0   (far Human)
 *   margin =    0% → 50  (exactly on threshold)
 *   margin = +100% → 100 (far AI)
 */
export function marginToBarPosition(margin: number): number {
  const clipped = Math.max(-1, Math.min(1, margin));
  return 50 + clipped * 50;
}

export interface StrengthSummary {
  strongAi: number;
  marginalAi: number;
  marginalHuman: number;
  strongHuman: number;
  total: number;
}

export function summarizeStrengths(strengths: Strength[]): StrengthSummary {
  const s: StrengthSummary = {
    strongAi: 0, marginalAi: 0, marginalHuman: 0, strongHuman: 0,
    total: strengths.length,
  };
  for (const x of strengths) {
    if (x === "strong-ai") s.strongAi++;
    else if (x === "marginal-ai") s.marginalAi++;
    else if (x === "marginal-human") s.marginalHuman++;
    else s.strongHuman++;
  }
  return s;
}

export function formatStrengthSummary(s: StrengthSummary): string {
  const parts: string[] = [];
  if (s.strongAi)       parts.push(`${s.strongAi} Strong AI`);
  if (s.marginalAi)     parts.push(`${s.marginalAi} Marginal AI`);
  if (s.marginalHuman)  parts.push(`${s.marginalHuman} Marginal Human`);
  if (s.strongHuman)    parts.push(`${s.strongHuman} Strong Human`);
  return parts.join(" / ");
}
