/**
 * AdminVerdictPanel
 *
 * Admin-only verdict viewer that mirrors VerdictPanel but exposes internal
 * forensic metrics (raw scores, RECON 7-metric thresholds, model versions).
 * Distinct from VerdictPanel so the user-facing component is never
 * accidentally polluted with internal numbers.
 *
 * IMPORTANT: this component is only mounted inside the admin investigation
 * route. The base VerdictPanel.tsx is left untouched.
 *
 * Terminology rules (internal_terminology_protection):
 *   "Primary Engine"      = CNN
 *   "Deep Forensic Engine" = RECON
 * Variable names + comments remain in English.
 */

import { useEffect, useState } from "react";
import { ShieldCheck, Cpu, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import {
  formatMarginPct,
  strengthColor,
  strengthLabel,
  type ReconMetricEnriched,
  type StrengthSummary,
} from "@/lib/recon_strength";

// Mirror the VerdictPanel contract — kept inline so we don't import a locked
// type from the user-facing file.
type DetectXVerdictText =
  | "AI signal evidence was observed."
  | "AI signal evidence was not observed.";

interface DetectXVerificationResult {
  verdict: DetectXVerdictText | string;
  authority: string;
  exceeded_axes: string[];
}

// Server returns per-metric threshold meta via /api/admin/recon-thresholds.
interface ReconThreshold {
  key: string;          // raw metric key (e.g. metric_1)
  label?: string;       // optional human label
  threshold: number;
  direction: "above" | "below" | string;
}

interface AdminVerdictPanelProps {
  verdict: DetectXVerificationResult | null;
  cnnScore?: number | null;
  finalScore?: number | null;
  finalScoreSource?: string | null;
  tier?: string | null;
  /** Raw record from the verifications history API. */
  verificationRecord: any;
}

type VerdictTier = "human" | "mixed-human" | "mixed-ai" | "ai" | "inconclusive" | "unknown";

function normalizeTier(tier: string | null | undefined): VerdictTier {
  switch (tier) {
    case "human":
    case "mixed-human":
    case "mixed-ai":
    case "ai":
    case "inconclusive":
      return tier;
    default:
      return "unknown";
  }
}

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
    case "inconclusive":
      return "AI Signal Inconclusive";
    case "unknown":
    default:
      return backendVerdict || "Pending";
  }
}

function fmt4(v: number | null | undefined): string {
  return v != null ? v.toFixed(4) : "—";
}

export function AdminVerdictPanel({
  verdict,
  cnnScore = null,
  finalScore = null,
  finalScoreSource = null,
  tier: serverTier = null,
  verificationRecord,
}: AdminVerdictPanelProps) {
  const [thresholds, setThresholds] = useState<ReconThreshold[]>([]);
  const [thresholdsLoading, setThresholdsLoading] = useState(true);
  const [thresholdsError, setThresholdsError] = useState<string | null>(null);

  // Fetch RECON thresholds once for the metric table overlay.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetchWithAuth("/api/admin/recon-thresholds");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (cancelled) return;
        // Accept both array and { thresholds: [...] }.
        const list: ReconThreshold[] = Array.isArray(data)
          ? data
          : data?.thresholds || [];
        setThresholds(list);
      } catch (err) {
        if (cancelled) return;
        setThresholdsError(
          err instanceof Error ? err.message : "Failed to load thresholds",
        );
      } finally {
        if (!cancelled) setThresholdsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tier = normalizeTier(serverTier);
  const displayScore = finalScore != null ? finalScore : cnnScore;

  const verdictBoxClass =
    tier === "human" ? "bg-forensic-green/10 border-forensic-green" :
    tier === "mixed-human" ? "bg-emerald-500/10 border-emerald-500" :
    tier === "mixed-ai" ? "bg-amber-500/10 border-amber-500" :
    tier === "inconclusive" ? "bg-amber-500/10 border-amber-500" :
    tier === "ai" ? "bg-forensic-amber/10 border-forensic-amber" :
    "bg-muted/10 border-border";

  const verdictTextClass =
    tier === "human" ? "text-forensic-green" :
    tier === "mixed-human" ? "text-emerald-400" :
    tier === "mixed-ai" ? "text-amber-400" :
    tier === "inconclusive" ? "text-amber-400" :
    tier === "ai" ? "text-forensic-amber" :
    "text-muted-foreground";

  const displayLabel = verdict
    ? getDisplayLabelFromTier(tier, verdict.verdict)
    : "No verdict";

  // Source of truth for enriched RECON rows: prefer the field on the record.
  const enriched: ReconMetricEnriched[] =
    verificationRecord?.recon_metrics_enriched ||
    verificationRecord?.reconMetricsEnriched ||
    [];

  const strengthSummary: StrengthSummary | null =
    verificationRecord?.strength_summary ||
    verificationRecord?.strengthSummary ||
    null;

  // Build a key -> threshold map (key normalization).
  const thresholdByKey = new Map<string, ReconThreshold>();
  for (const t of thresholds) {
    if (t?.key) thresholdByKey.set(String(t.key).toLowerCase(), t);
  }
  const lookupThreshold = (row: ReconMetricEnriched): ReconThreshold | null => {
    const candidates: string[] = [];
    if ((row as any).id) candidates.push(String((row as any).id).toLowerCase());
    if ((row as any).key) candidates.push(String((row as any).key).toLowerCase());
    if (row.label) candidates.push(String(row.label).toLowerCase());
    for (const k of candidates) {
      const hit = thresholdByKey.get(k);
      if (hit) return hit;
    }
    return null;
  };

  // Model versions placeholder — backend will populate later.
  const modelVersions = verificationRecord?.model_versions
    || verificationRecord?.modelVersions
    || null;

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Microscope className="h-4 w-4 text-forensic-cyan" />
          <span>Verdict (Admin View)</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Internal — Admin Only
        </span>
      </div>
      <div className="forensic-panel-content space-y-5">
        {/* Verdict box */}
        <div className={cn("p-4 rounded-md border-l-4", verdictBoxClass)}>
          <p className={cn("text-lg font-medium", verdictTextClass)}>
            {displayLabel}
          </p>
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
            </div>
          )}
        </div>

        {/* Internal raw scores */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Cpu className="h-3 w-3" />
            Internal Scores
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-muted/20 border border-border/40">
              <span className="text-muted-foreground">Primary Engine Raw Score</span>
              <span className="font-mono">{fmt4(cnnScore)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/20 border border-border/40">
              <span className="text-muted-foreground">Deep Forensic Engine Final Score</span>
              <span className="font-mono">{fmt4(finalScore)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/20 border border-border/40">
              <span className="text-muted-foreground">Final Score Source</span>
              <span className="font-mono uppercase">
                {finalScoreSource === "recon"
                  ? "Deep Forensic"
                  : finalScoreSource === "cnn"
                    ? "Primary"
                    : finalScoreSource || "—"}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/20 border border-border/40">
              <span className="text-muted-foreground">Server Tier</span>
              <span className="font-mono uppercase">{serverTier || "—"}</span>
            </div>
          </div>
        </div>

        {/* RECON 7-metric table */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Deep Forensic Engine — 7 Metric Table</span>
            {strengthSummary?.text && (
              <span className="text-[10px] font-mono text-muted-foreground/80">
                {strengthSummary.text}
              </span>
            )}
          </div>
          {thresholdsError && (
            <div className="text-[10px] text-red-400">
              Threshold overlay unavailable: {thresholdsError}
            </div>
          )}
          <div className="overflow-x-auto rounded border border-border/40">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Metric</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Raw Value</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Threshold</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Direction</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Exceeded</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Margin</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Strength</th>
                </tr>
              </thead>
              <tbody>
                {enriched.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted-foreground">
                      {thresholdsLoading ? "Loading…" : "No metrics available for this record"}
                    </td>
                  </tr>
                ) : (
                  enriched.map((row) => {
                    const thresh = lookupThreshold(row);
                    const color = row.strength ? strengthColor(row.strength) : null;
                    return (
                      <tr key={row.id} className="border-t border-border/40">
                        <td className="py-2 px-2 text-foreground">{row.label}</td>
                        <td className="py-2 px-2 text-right font-mono">
                          {row.formatted ?? fmt4(row.value)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {thresh ? fmt4(thresh.threshold) : "—"}
                        </td>
                        <td className="py-2 px-2 text-center font-mono uppercase text-[10px]">
                          {thresh?.direction || "—"}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {row.exceeded_ai ? (
                            <span className="text-amber-400 font-semibold">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {row.margin != null ? formatMarginPct(row.margin) : "—"}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {row.strength && color ? (
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                color.bg,
                                color.text,
                                color.border,
                              )}
                            >
                              {strengthLabel(row.strength)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model versions (placeholder — backend will populate later) */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Model Versions
          </div>
          {modelVersions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(modelVersions).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between p-2 rounded bg-muted/20 border border-border/40"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              Model version metadata not yet provided by backend.
            </div>
          )}
        </div>

        {/* Engine + exceeded axes (verbatim from server) */}
        {verdict && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-wider">Engine</span>
              <span className="font-mono text-foreground">{verdict.authority}</span>
            </div>
            {verdict.exceeded_axes?.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider">Detected By</span>
                <span className="font-mono text-foreground">
                  {verdict.exceeded_axes.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
