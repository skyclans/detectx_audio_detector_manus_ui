/**
 * Advanced Signal Analysis Component (Tier 4) — Hybrid Forensic Dashboard
 *
 * A+C hybrid layout:
 *   - Hero: large polygon radar (6-axis) with glow + center contamination score
 *   - Right: compact metric breakdown bars
 *   - Mid: band distribution chart + stem correlation triangle
 *   - Bottom: compact tiles for anomaly / flatness / signature / persistence
 *   - Footer: engine metadata
 *
 * DISPLAY LAYER ONLY - no verdict logic, no derivation.
 * Renders demo data while forensic mode is in development.
 */

import { Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types (preserved from v1 — Home.tsx imports these)
// ============================================================================

type StatusValue = "within_bounds" | "corroborative" | "no anomaly" | string;

export interface TemporalPattern {
  curvatureMean: number;
  flatnessDensity: number;
  status: StatusValue;
}

export interface SignalPersistence {
  length: number;
  status: StatusValue;
}

export interface InterTrackCorrelation {
  vocalDrum: number;
  bassDrum: number;
  vocalOther: number;
  drumOther: number;
  status: StatusValue;
}

export interface SpectralBalance {
  symmetryIndex: number;
  balanceEntropy: number;
  status: StatusValue;
}

export interface BandDistribution {
  subBass: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  high: number;
  bandEntropy: number;
  status: StatusValue;
}

export interface CrossTrackSpectralPattern {
  pairwiseSimilarity: number;
  roleCollapseRate: number;
  status: StatusValue;
}

export interface HighFrequencyAnomaly {
  hfResidualVar: number;
  status: StatusValue;
}

export interface TemporalAnomaly {
  driftIndex: number;
  status: StatusValue;
}

export interface TransientAnomaly {
  sharpness: number;
  status: StatusValue;
}

export interface FrequencySignature {
  detected: boolean;
}

export interface TemporalFlatnessIndex {
  flatRunMax: number;
  flatRunDensity: number;
}

export interface DirectMixTexture {
  vocalNaturalness: number;
  instrumentTexture: number;
  spatialDepth: number;
  frequencyAnomaly: number;
}

/**
 * Stem presence flags (0..1 energy or boolean).
 * When undefined for a stem, treated as present (full mix default).
 * Threshold for "present" is 0.10 (10% normalized energy).
 */
export interface StemEnergies {
  vocal?: number;
  drums?: number;
  bass?: number;
  other?: number;
}

export interface ForensicAnalysisData {
  temporalPattern?: TemporalPattern;
  signalPersistence?: SignalPersistence;
  interTrackCorrelation?: InterTrackCorrelation;
  spectralBalance?: SpectralBalance;
  bandDistribution?: BandDistribution;
  crossTrackSpectralPattern?: CrossTrackSpectralPattern;
  highFrequencyAnomaly?: HighFrequencyAnomaly;
  temporalAnomaly?: TemporalAnomaly;
  transientAnomaly?: TransientAnomaly;
  frequencySignature?: FrequencySignature;
  temporalFlatnessIndex?: TemporalFlatnessIndex;
  directMixTexture?: DirectMixTexture;
  /** Optional per-stem energy hints. Missing fields default to "present". */
  stemEnergies?: StemEnergies;
}

// ============================================================================
// Stem presence detection
// ============================================================================

const STEM_PRESENCE_THRESHOLD = 0.10;

interface StemPresence {
  vocal: boolean;
  drums: boolean;
  bass: boolean;
  other: boolean;
}

function detectStemPresence(energies?: StemEnergies): StemPresence {
  // Missing fields default to true (present) — matches the existing full-mix mock data.
  return {
    vocal: energies?.vocal === undefined ? true : energies.vocal >= STEM_PRESENCE_THRESHOLD,
    drums: energies?.drums === undefined ? true : energies.drums >= STEM_PRESENCE_THRESHOLD,
    bass: energies?.bass === undefined ? true : energies.bass >= STEM_PRESENCE_THRESHOLD,
    other: energies?.other === undefined ? true : energies.other >= STEM_PRESENCE_THRESHOLD,
  };
}

function detectMixType(p: StemPresence): string {
  const count = (p.vocal ? 1 : 0) + (p.drums ? 1 : 0) + (p.bass ? 1 : 0) + (p.other ? 1 : 0);
  if (count === 4) return "Full Mix";
  if (count === 0) return "Empty";
  if (count === 1) {
    if (p.other) return "Single Source";
    if (p.vocal) return "Vocal Only";
    if (p.drums) return "Drum Only";
    if (p.bass) return "Bass Only";
  }
  if (count === 2) {
    if (!p.vocal && !p.drums) return "Bass + Other";
    if (!p.vocal && !p.bass) return "Drum + Other";
    if (!p.drums && !p.bass) return "Vocal + Other";
    if (!p.vocal && !p.other) return "Drum + Bass";
    if (!p.drums && !p.other) return "Vocal + Bass";
    if (!p.bass && !p.other) return "Vocal + Drum";
  }
  if (count === 3) {
    if (!p.vocal) return "Instrumental";
    if (!p.drums) return "Drumless";
    if (!p.bass) return "No Bass";
    if (!p.other) return "Vocal + Rhythm";
  }
  return "Custom Mix";
}

// ============================================================================
// Mock data generator (preserved)
// ============================================================================

export type MockMixScenario =
  | "full"        // Default — all 4 stems present
  | "instrumental" // No vocal (rock instrumental, EDM)
  | "drumless"    // No drums (acoustic ballad, ambient)
  | "no_bass"     // No bass (treble-focused mix)
  | "piano_solo"  // Single source (piano solo, vocal a cappella)
  | "vocal_acoustic"; // Vocal + bass + other (no drums)

export function getMockForensicData(scenario: MockMixScenario = "full"): ForensicAnalysisData {
  const base: ForensicAnalysisData = {
    temporalPattern: { curvatureMean: 0.0234, flatnessDensity: 0.187, status: "within_bounds" },
    signalPersistence: { length: 23.4, status: "corroborative" },
    interTrackCorrelation: {
      vocalDrum: 0.412,
      bassDrum: 0.689,
      vocalOther: 0.234,
      drumOther: 0.521,
      status: "corroborative",
    },
    spectralBalance: { symmetryIndex: 0.342, balanceEntropy: 1.247, status: "corroborative" },
    bandDistribution: {
      subBass: 0.0432,
      bass: 0.1234,
      lowMid: 0.0987,
      mid: 0.2134,
      highMid: 0.1823,
      high: 0.0721,
      bandEntropy: 1.456,
      status: "corroborative",
    },
    crossTrackSpectralPattern: {
      pairwiseSimilarity: 0.378,
      roleCollapseRate: 0.123,
      status: "corroborative",
    },
    highFrequencyAnomaly: { hfResidualVar: 0.0234, status: "no anomaly" },
    temporalAnomaly: { driftIndex: 0.187, status: "within_bounds" },
    transientAnomaly: { sharpness: 0.421, status: "within_bounds" },
    frequencySignature: { detected: false },
    temporalFlatnessIndex: { flatRunMax: 12, flatRunDensity: 0.089 },
    directMixTexture: {
      vocalNaturalness: 0.823,
      instrumentTexture: 0.712,
      spatialDepth: 0.534,
      frequencyAnomaly: 0.121,
    },
  };

  // Apply per-scenario stem energies. Omitting stemEnergies defaults to full mix.
  switch (scenario) {
    case "instrumental":
      base.stemEnergies = { vocal: 0.02, drums: 0.55, bass: 0.62, other: 0.71 };
      break;
    case "drumless":
      base.stemEnergies = { vocal: 0.68, drums: 0.03, bass: 0.51, other: 0.74 };
      break;
    case "no_bass":
      base.stemEnergies = { vocal: 0.65, drums: 0.58, bass: 0.04, other: 0.69 };
      break;
    case "piano_solo":
      base.stemEnergies = { vocal: 0.02, drums: 0.03, bass: 0.05, other: 0.82 };
      break;
    case "vocal_acoustic":
      base.stemEnergies = { vocal: 0.71, drums: 0.04, bass: 0.48, other: 0.68 };
      break;
    case "full":
    default:
      // stemEnergies omitted → all stems treated as present
      break;
  }

  return base;
}

// ============================================================================
// Visualization helpers — pure SVG
// ============================================================================

interface RadarAxis {
  key: string;
  label: string;
  value: number; // 0..1 normalized
  baseline: number; // human p95 reference 0..1
}

/**
 * Multi-axis radar polygon (hexagon).
 * Inner cyan filled polygon = measured. Outer dotted = human baseline (p95).
 * Center label = overall score.
 */
function RadarHero({
  axes,
  centerScore,
  centerLabel = "Forensic Score",
}: {
  axes: RadarAxis[];
  centerScore: number;
  centerLabel?: string;
}) {
  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_MAX = 110;
  const N = axes.length;

  // Compute polygon points
  const angleFor = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;

  const pointOnRadius = (i: number, r: number) => {
    const a = angleFor(i);
    return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
  };

  const polyPath = (values: number[]) =>
    values
      .map((v, i) => {
        const p = pointOnRadius(i, R_MAX * Math.max(0, Math.min(1, v)));
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  const measuredPoints = axes.map((a) => a.value);
  const baselinePoints = axes.map((a) => a.baseline);

  // Reference rings (concentric polygons at 0.25, 0.5, 0.75, 1.0)
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full h-auto max-w-[320px]"
      role="img"
      aria-label="Multi-axis forensic signature"
    >
      <defs>
        <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34, 211, 238, 0.25)" />
          <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
        </radialGradient>
      </defs>

      {/* Background gradient circle */}
      <circle cx={CX} cy={CY} r={R_MAX + 4} fill="url(#centerGrad)" />

      {/* Reference rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={axes
            .map((_, i) => {
              const p = pointOnRadius(i, R_MAX * r);
              return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(80, 90, 130, 0.25)"
          strokeWidth="0.6"
        />
      ))}

      {/* Axis spokes */}
      {axes.map((_, i) => {
        const p = pointOnRadius(i, R_MAX);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="rgba(80, 90, 130, 0.3)"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Human baseline polygon (outer dotted) */}
      <path
        d={polyPath(baselinePoints)}
        fill="none"
        stroke="rgba(148, 163, 184, 0.5)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {/* Measured polygon (cyan filled with glow) */}
      <path
        d={polyPath(measuredPoints)}
        fill="rgba(34, 211, 238, 0.18)"
        stroke="rgb(34, 211, 238)"
        strokeWidth="1.5"
        filter="url(#cyanGlow)"
      />

      {/* Vertex dots */}
      {axes.map((a, i) => {
        const p = pointOnRadius(i, R_MAX * Math.max(0, Math.min(1, a.value)));
        return (
          <circle
            key={a.key}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="rgb(34, 211, 238)"
            filter="url(#cyanGlow)"
          />
        );
      })}

      {/* Axis labels (outside polygon) */}
      {axes.map((a, i) => {
        const p = pointOnRadius(i, R_MAX + 22);
        const align =
          Math.abs(p.x - CX) < 8 ? "middle" : p.x > CX ? "start" : "end";
        return (
          <text
            key={`${a.key}-label`}
            x={p.x}
            y={p.y}
            textAnchor={align}
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill="rgb(148, 163, 184)"
            letterSpacing="0.05em"
          >
            {a.label.toUpperCase()}
          </text>
        );
      })}

      {/* Center score */}
      <text
        x={CX}
        y={CY - 6}
        textAnchor="middle"
        fontSize="26"
        fontFamily="ui-monospace, monospace"
        fontWeight="600"
        fill="rgb(34, 211, 238)"
        filter="url(#cyanGlow)"
      >
        {(centerScore * 100).toFixed(1)}
      </text>
      <text
        x={CX}
        y={CY + 14}
        textAnchor="middle"
        fontSize="8"
        fontFamily="ui-monospace, monospace"
        fill="rgb(148, 163, 184)"
        letterSpacing="0.1em"
      >
        {centerLabel.toUpperCase()}
      </text>
    </svg>
  );
}

/**
 * Inline progress bar (gauge) for compact metric breakdown.
 */
function MetricBar({
  label,
  value,
  display,
}: {
  label: string;
  value: number; // 0..1
  display?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const displayValue = display ?? value.toFixed(3);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="font-mono text-cyan-300">{displayValue}</span>
      </div>
      <div className="h-1.5 bg-cyan-950/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500/70 to-cyan-300"
          style={{ width: `${pct}%`, boxShadow: "0 0 8px rgba(34,211,238,0.4)" }}
        />
      </div>
    </div>
  );
}

/**
 * Band distribution horizontal bars (6 bands).
 */
function BandDistributionChart({ data }: { data: BandDistribution }) {
  const bands = [
    { key: "subBass", label: "SUB-BASS", v: data.subBass },
    { key: "bass", label: "BASS", v: data.bass },
    { key: "lowMid", label: "LOW-MID", v: data.lowMid },
    { key: "mid", label: "MID", v: data.mid },
    { key: "highMid", label: "HIGH-MID", v: data.highMid },
    { key: "high", label: "HIGH", v: data.high },
  ];
  const max = Math.max(...bands.map((b) => b.v), 0.001);

  return (
    <div className="space-y-1.5">
      {bands.map((b) => {
        const pct = (b.v / max) * 100;
        return (
          <div key={b.key} className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted-foreground w-16 shrink-0">
              {b.label}
            </span>
            <div className="flex-1 h-3 bg-cyan-950/30 rounded-sm overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-600/60 to-cyan-300 rounded-sm"
                style={{
                  width: `${pct}%`,
                  boxShadow: "0 0 6px rgba(34,211,238,0.5)",
                }}
              />
            </div>
            <span className="font-mono text-[10px] text-cyan-300 w-14 text-right">
              {b.v.toFixed(4)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Stereo Imager — DAW-style polar/radial frequency visualization.
 *
 * Renders a 360° circular display with 6 frequency bands radiating outward:
 *   SUB / LOW / LO-MID / MID / HI / AIR
 *
 * Each band's value is plotted as a radius from center;
 * the connected envelope forms a smooth cyan polygon with glow.
 * Concentric reference rings indicate strength levels.
 *
 * Present-stem mapping (display-only re-binning):
 *   - SUB    ← bass↔drums correlation
 *   - LOW    ← bass↔drums (slightly different position)
 *   - LO-MID ← drums↔other
 *   - MID    ← vocal↔drums
 *   - HI     ← vocal↔drums (higher position)
 *   - AIR    ← vocal↔other
 *
 * Stem-presence dimming: any band whose source stem is absent appears dimmed.
 */
function StereoImager({
  data,
  presence,
}: {
  data: InterTrackCorrelation;
  presence: StemPresence;
}) {
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_MAX = 86;
  const RINGS = [0.25, 0.5, 0.75, 1.0];

  // 6 frequency bands distributed around the circle (60° apart, starting from 12 o'clock)
  type SrcStem = "vocal" | "drums" | "bass" | "other";
  interface Band {
    label: string;
    value: number; // 0..1
    sources: SrcStem[]; // dimmed if all sources absent
  }

  const bands: Band[] = [
    {
      label: "AIR",
      value: data.vocalOther,
      sources: ["vocal", "other"],
    },
    {
      label: "HI",
      value: Math.min(1, data.vocalDrum + 0.05),
      sources: ["vocal", "drums"],
    },
    {
      label: "MID",
      value: data.drumOther,
      sources: ["drums", "other"],
    },
    {
      label: "LO-MID",
      value: Math.min(1, data.bassDrum * 0.8),
      sources: ["drums", "bass"],
    },
    {
      label: "LOW",
      value: data.bassDrum,
      sources: ["bass", "drums"],
    },
    {
      label: "SUB",
      value: Math.min(1, data.bassDrum * 0.7),
      sources: ["bass"],
    },
  ];

  const N = bands.length;
  // Start at 12 o'clock, go clockwise
  const angleFor = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;

  const pointAt = (i: number, r: number) => ({
    x: CX + Math.cos(angleFor(i)) * r,
    y: CY + Math.sin(angleFor(i)) * r,
  });

  // Effective values (dimmed bands clamp to small inner value)
  const effectiveValues = bands.map((b) => {
    const allAbsent = b.sources.every((s) => !presence[s]);
    if (allAbsent) return 0.05; // visible inner dot but very small
    return Math.max(0, Math.min(1, b.value));
  });

  const envelopePath =
    effectiveValues
      .map((v, i) => {
        const p = pointAt(i, R_MAX * v);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full h-auto max-w-[220px]"
      role="img"
      aria-label="Stereo imager"
    >
      <defs>
        <filter id="imagerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="imagerCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34, 211, 238, 0.18)" />
          <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
        </radialGradient>
      </defs>

      {/* Outer ring (frame) */}
      <circle
        cx={CX}
        cy={CY}
        r={R_MAX + 4}
        fill="none"
        stroke="rgba(100, 116, 139, 0.35)"
        strokeWidth="0.8"
      />

      {/* Inner core glow */}
      <circle cx={CX} cy={CY} r={R_MAX} fill="url(#imagerCoreGrad)" />

      {/* Concentric reference rings */}
      {RINGS.map((r) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={R_MAX * r}
          fill="none"
          stroke="rgba(80, 90, 130, 0.22)"
          strokeWidth="0.5"
          strokeDasharray={r < 1 ? "2 3" : undefined}
        />
      ))}

      {/* Radial spokes */}
      {bands.map((_, i) => {
        const p = pointAt(i, R_MAX);
        return (
          <line
            key={`spoke-${i}`}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="rgba(80, 90, 130, 0.22)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Envelope polygon (measured) */}
      <path
        d={envelopePath}
        fill="rgba(34, 211, 238, 0.22)"
        stroke="rgb(34, 211, 238)"
        strokeWidth="1.4"
        filter="url(#imagerGlow)"
      />

      {/* Center dot */}
      <circle
        cx={CX}
        cy={CY}
        r="2.2"
        fill="rgb(34, 211, 238)"
        filter="url(#imagerGlow)"
      />

      {/* Band dots on envelope */}
      {bands.map((b, i) => {
        const allAbsent = b.sources.every((s) => !presence[s]);
        const p = pointAt(i, R_MAX * effectiveValues[i]);
        return (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={allAbsent ? 2.2 : 3}
            fill={allAbsent ? "transparent" : "rgb(34, 211, 238)"}
            stroke={allAbsent ? "rgba(100, 116, 139, 0.5)" : "none"}
            strokeWidth={allAbsent ? 1 : 0}
            strokeDasharray={allAbsent ? "2 2" : undefined}
            filter={allAbsent ? undefined : "url(#imagerGlow)"}
          />
        );
      })}

      {/* Band labels (outside frame) */}
      {bands.map((b, i) => {
        const allAbsent = b.sources.every((s) => !presence[s]);
        const p = pointAt(i, R_MAX + 18);
        const align = Math.abs(p.x - CX) < 8 ? "middle" : p.x > CX ? "start" : "end";
        return (
          <text
            key={`label-${i}`}
            x={p.x}
            y={p.y}
            textAnchor={align}
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill={allAbsent ? "rgba(100, 116, 139, 0.55)" : "rgb(165, 243, 252)"}
            letterSpacing="0.08em"
          >
            {b.label}
          </text>
        );
      })}
    </svg>
  );
}

/**
 * Compact metric tile (bottom row).
 */
function Tile({
  title,
  rows,
  accent = "cyan",
}: {
  title: string;
  rows: { label: string; value: string; muted?: boolean }[];
  accent?: "cyan" | "amber" | "emerald";
}) {
  const accentClass = {
    cyan: "border-cyan-500/20 bg-cyan-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
  }[accent];

  const titleClass = {
    cyan: "text-cyan-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  }[accent];

  return (
    <div className={cn("rounded-lg border overflow-hidden", accentClass)}>
      <div className="px-2.5 py-1.5 border-b border-current/10">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", titleClass)}>
          {title}
        </span>
      </div>
      <div className="p-2 space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{r.label}</span>
            <span
              className={cn(
                "font-mono text-[11px]",
                r.muted ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Score computation (display-only — does NOT affect verdict)
// ============================================================================

/**
 * Compute a display-only forensic score from forensic axes.
 * This is a UI presentation aggregate, not a verdict.
 */
function computeForensicScore(data: ForensicAnalysisData): number {
  const samples: number[] = [];
  if (data.temporalPattern) samples.push(data.temporalPattern.curvatureMean * 10);
  if (data.signalPersistence) samples.push(data.signalPersistence.length / 100);
  if (data.interTrackCorrelation) {
    const c = data.interTrackCorrelation;
    samples.push((c.vocalDrum + c.bassDrum + c.vocalOther + c.drumOther) / 4);
  }
  if (data.spectralBalance) samples.push(data.spectralBalance.symmetryIndex);
  if (data.bandDistribution) samples.push(data.bandDistribution.bandEntropy / 3);
  if (data.highFrequencyAnomaly) samples.push(data.highFrequencyAnomaly.hfResidualVar * 5);
  if (samples.length === 0) return 0;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return Math.max(0, Math.min(1, mean));
}

// ============================================================================
// Main component
// ============================================================================

interface AdvancedSignalAnalysisProps {
  data?: ForensicAnalysisData | null;
  isProcessing?: boolean;
}

export function AdvancedSignalAnalysis({
  data,
  isProcessing = false,
}: AdvancedSignalAnalysisProps) {
  // Processing state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Advanced Signal Analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400">ANALYZING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          <div className="h-48 bg-muted/10 rounded-lg flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span>Advanced Signal Analysis</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          <div className="h-32 bg-muted/10 rounded-lg border border-dashed border-border/30 flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Forensic signature will appear after scan
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Detect stem presence (vocal/drums/bass/other independently)
  const presence = detectStemPresence(data.stemEnergies);
  const mixType = detectMixType(presence);

  // Build radar axes from forensic data (6-axis hexagon).
  // Naturalness axis adapts: vocal-based when vocal present, instrument texture otherwise.
  const naturalnessLabel = presence.vocal ? "Naturalness" : "Instr. Texture";
  const naturalnessValue = data.directMixTexture
    ? presence.vocal
      ? data.directMixTexture.vocalNaturalness
      : data.directMixTexture.instrumentTexture
    : 0;

  const radarAxes: RadarAxis[] = [
    {
      key: "temporal",
      label: "Temporal",
      value: data.temporalPattern ? Math.min(1, data.temporalPattern.curvatureMean * 12) : 0,
      baseline: 0.7,
    },
    {
      key: "persistence",
      label: "Persistence",
      value: data.signalPersistence ? Math.min(1, data.signalPersistence.length / 60) : 0,
      baseline: 0.75,
    },
    {
      key: "coupling",
      label: "Coupling",
      value: data.interTrackCorrelation
        ? (data.interTrackCorrelation.vocalDrum +
            data.interTrackCorrelation.bassDrum +
            data.interTrackCorrelation.vocalOther +
            data.interTrackCorrelation.drumOther) /
          4
        : 0,
      baseline: 0.8,
    },
    {
      key: "spectral",
      label: "Spectral",
      value: data.spectralBalance ? data.spectralBalance.symmetryIndex : 0,
      baseline: 0.7,
    },
    {
      key: "anomaly",
      label: "Anomaly",
      value: data.highFrequencyAnomaly
        ? Math.min(1, data.highFrequencyAnomaly.hfResidualVar * 8)
        : 0,
      baseline: 0.6,
    },
    {
      key: "naturalness",
      label: naturalnessLabel,
      value: naturalnessValue,
      baseline: 0.85,
    },
  ];

  const score = computeForensicScore(data);

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Advanced Signal Analysis</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase tracking-wide">
          Corroborative
        </span>
      </div>


      <div className="forensic-panel-content space-y-4">
        {/* ===== HERO: Radar + Breakdown ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 lg:gap-6 items-center">
          {/* Radar polygon */}
          <div className="flex justify-center">
            <RadarHero
              axes={radarAxes}
              centerScore={score}
              centerLabel="Forensic Index"
            />
          </div>

          {/* Right: breakdown bars */}
          <div className="space-y-3">
            {radarAxes.map((a) => (
              <MetricBar
                key={a.key}
                label={a.label}
                value={a.value}
                display={a.value.toFixed(3)}
              />
            ))}
          </div>
        </div>

        {/* ===== MID ROW: Band Distribution + Stem Triangle ===== */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          {/* Band Distribution */}
          {data.bandDistribution && (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  Band Distribution
                </span>
                <span className="text-[9px] font-mono text-muted-foreground">
                  entropy {data.bandDistribution.bandEntropy.toFixed(3)}
                </span>
              </div>
              <BandDistributionChart data={data.bandDistribution} />
            </div>
          )}

          {/* Stereo Imager */}
          {data.interTrackCorrelation && (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-1 gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  Stereo Imager
                </span>
                <span
                  className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider",
                    mixType === "Full Mix"
                      ? "bg-cyan-500/15 text-cyan-300/80"
                      : "bg-amber-500/15 text-amber-300"
                  )}
                  title="Detected mix configuration"
                >
                  {mixType}
                </span>
              </div>
              <StereoImager data={data.interTrackCorrelation} presence={presence} />
              <div className="mt-1 text-[9px] font-mono text-muted-foreground text-center">
                {presence.vocal && presence.drums && presence.bass && presence.other
                  ? "polar field · radius ∝ band strength"
                  : "dimmed bands = source absent"}
              </div>
            </div>
          )}
        </div>

        {/* ===== BOTTOM ROW: Compact tiles ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Anomaly */}
          <Tile
            title="Anomaly"
            accent="cyan"
            rows={[
              {
                label: "HF Res. Var",
                value: data.highFrequencyAnomaly
                  ? data.highFrequencyAnomaly.hfResidualVar.toFixed(4)
                  : "—",
              },
              {
                label: "Drift Index",
                value: data.temporalAnomaly
                  ? data.temporalAnomaly.driftIndex.toFixed(3)
                  : "—",
              },
              {
                label: "Sharpness",
                value: data.transientAnomaly
                  ? data.transientAnomaly.sharpness.toFixed(3)
                  : "—",
              },
            ]}
          />

          {/* Flatness */}
          <Tile
            title="Flatness"
            accent="cyan"
            rows={[
              {
                label: "Flat Run Max",
                value: data.temporalFlatnessIndex
                  ? String(Math.round(data.temporalFlatnessIndex.flatRunMax))
                  : "—",
              },
              {
                label: "Run Density",
                value: data.temporalFlatnessIndex
                  ? data.temporalFlatnessIndex.flatRunDensity.toFixed(3)
                  : "—",
              },
            ]}
          />

          {/* Frequency Signature */}
          <Tile
            title="Freq. Signature"
            accent="cyan"
            rows={[
              {
                label: "Detected",
                value: data.frequencySignature
                  ? data.frequencySignature.detected
                    ? "Yes"
                    : "No"
                  : "—",
              },
              {
                label: "Pairwise Sim",
                value: data.crossTrackSpectralPattern
                  ? data.crossTrackSpectralPattern.pairwiseSimilarity.toFixed(3)
                  : "—",
              },
              {
                label: "Role Collapse",
                value: data.crossTrackSpectralPattern
                  ? data.crossTrackSpectralPattern.roleCollapseRate.toFixed(3)
                  : "—",
              },
            ]}
          />

          {/* EQ Signature */}
          <Tile
            title="EQ Signature"
            accent="cyan"
            rows={[
              {
                label: "High EQ",
                value: data.directMixTexture
                  ? data.directMixTexture.vocalNaturalness.toFixed(3)
                  : "—",
              },
              {
                label: "Mid EQ",
                value: data.directMixTexture
                  ? data.directMixTexture.instrumentTexture.toFixed(3)
                  : "—",
              },
              {
                label: "Low EQ",
                value: data.directMixTexture
                  ? data.directMixTexture.spatialDepth.toFixed(3)
                  : "—",
              },
              {
                label: "Air",
                value: data.directMixTexture
                  ? data.directMixTexture.frequencyAnomaly.toFixed(3)
                  : "—",
              },
            ]}
          />
        </div>

        {/* ===== FOOTER ===== */}
        <div className="pt-3 border-t border-border/30 grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px]">
          <div className="flex flex-col">
            <span className="text-muted-foreground/70 uppercase tracking-wider">Engine</span>
            <span className="font-mono text-cyan-300/80">DetectX Forensic 1.4</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground/70 uppercase tracking-wider">Reference</span>
            <span className="font-mono text-foreground/70">Human Baseline DB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground/70 uppercase tracking-wider">Mode</span>
            <span className="font-mono text-foreground/70">Deterministic</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground/70 uppercase tracking-wider">Authority</span>
            <span className="font-mono text-foreground/70">Corroborative</span>
          </div>
        </div>
      </div>
    </div>
  );
}
