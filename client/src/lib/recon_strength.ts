/**
 * RECON 7-Metric display contract.
 *
 * The server is the authority on metric thresholds, tier boundaries, and
 * strength bucketing. The bundle only carries the *types* used to render
 * what the server sends back. The numerical thresholds (RECON_7METRIC_RULES)
 * and the 4-tier band boundaries live in server/app/crg_runner.py and never
 * reach the client.
 */

export type Strength =
  | "strong-ai"
  | "marginal-ai"
  | "marginal-human"
  | "strong-human";

export interface ReconMetricEnriched {
  /** Opaque server-assigned id (e.g. "metric_1"). Stable for React keys. */
  id: string;
  /** Human-readable display label (e.g. "Bass Diff"). */
  label: string;
  /** The raw measurement value. */
  value?: number | null;
  /** Pre-formatted measurement string. */
  formatted: string;
  /** Strength bucket — drives color/badge. Null when value missing. */
  strength?: Strength | null;
  /** Signed fractional margin (AI-positive). Null when value missing. */
  margin?: number | null;
  /** Bar position 0-100 (Human=0, AI=100). Null when value missing. */
  bar_position?: number | null;
  /** Whether this metric is on the AI side. */
  exceeded_ai?: boolean | null;
}

export interface StrengthSummary {
  strong_ai: number;
  ai: number;            // "marginal-ai" bucket
  human: number;         // "marginal-human" bucket
  strong_human: number;
  text: string;          // pre-formatted "3 Strong AI / 3 AI / 1 Human"
}

/** Display label per strength bucket. */
export function strengthLabel(s: Strength): string {
  switch (s) {
    case "strong-ai":       return "Strong AI";
    case "marginal-ai":     return "AI";
    case "marginal-human":  return "Human";
    case "strong-human":    return "Strong Human";
  }
}

/** Tailwind palette per strength bucket. */
export function strengthColor(s: Strength): { bg: string; text: string; border: string; hex: string } {
  switch (s) {
    case "strong-ai":
      return { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/40",     hex: "#ef4444" };
    case "marginal-ai":
      return { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/40",   hex: "#f59e0b" };
    case "marginal-human":
      return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40", hex: "#10b981" };
    case "strong-human":
      return { bg: "bg-emerald-700/15", text: "text-emerald-500", border: "border-emerald-700/40", hex: "#059669" };
  }
}

/** Format the signed margin as a percentage string. */
export function formatMarginPct(margin: number): string {
  const pct = margin * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

/** Format the server's StrengthSummary as a one-line text fallback. */
export function formatStrengthSummary(s: StrengthSummary): string {
  if (s.text) return s.text;
  const parts: string[] = [];
  if (s.strong_ai)    parts.push(`${s.strong_ai} Strong AI`);
  if (s.ai)           parts.push(`${s.ai} AI`);
  if (s.human)        parts.push(`${s.human} Human`);
  if (s.strong_human) parts.push(`${s.strong_human} Strong Human`);
  return parts.join(" / ");
}
