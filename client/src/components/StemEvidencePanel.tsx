/**
 * StemEvidencePanel — credit-priced stem separation, exposed on the
 * scan result page (Home.tsx / VerificationResult).
 *
 * Tier rules:
 *   - Free  → locked, prompts upgrade
 *   - Basic+→ available; Studio gets 5 free stems / month, then credits.
 *
 * Backend contract (Phase 4):
 *   POST /api/stems/estimate-cost
 *     body: { record_id?, duration_sec, quality_tier }
 *     resp: {
 *       credits_required: number,
 *       was_free_for_studio: boolean,
 *       free_remaining: number,
 *     }
 *   POST /api/stems/separate
 *     body: { record_id, duration_sec, quality_tier }
 *     resp: { job_id } | { stems: [...] } | 402 (insufficient credits)
 *
 * On 402 the parent's CreditExhaustedModal is shown (this component
 * raises onCreditExhausted with the payload).
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { Lock, Wand2, Loader2, Sparkles } from "lucide-react";

interface EstimateResp {
  credits_required: number;
  was_free_for_studio?: boolean;
  free_remaining?: number;
}

interface CreditExhaustedPayload {
  required: number;
  balance: number;
  quality_tier: string;
  duration_sec: number;
  reset_in_days: number;
}

interface Props {
  recordId?: string | null;
  durationSec: number;
  qualityTier?: string;
  onCreditExhausted?: (p: CreditExhaustedPayload) => void;
  onSeparated?: (data: any) => void;
}

export function StemEvidencePanel({
  recordId,
  durationSec,
  qualityTier = "standard",
  onCreditExhausted,
  onSeparated,
}: Props) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const u = user as any;
  const tier = (u?.tier ?? u?.plan ?? "free").toLowerCase();

  const [estimate, setEstimate] = useState<EstimateResp | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (tier === "free") return;
    if (durationSec <= 0) return;

    let cancelled = false;
    setEstimating(true);

    fetchWithAuth("/api/stems/estimate-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record_id: recordId,
        duration_sec: durationSec,
        quality_tier: qualityTier,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`estimate ${r.status}`);
        return r.json();
      })
      .then((d: EstimateResp) => {
        if (!cancelled) setEstimate(d);
      })
      .catch(() => {
        if (!cancelled) setEstimate(null);
      })
      .finally(() => {
        if (!cancelled) setEstimating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recordId, durationSec, qualityTier, tier, isAuthenticated]);

  const handleSeparate = async () => {
    if (!recordId) {
      toast.error("Run a scan first to enable stem separation.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/stems/separate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_id: recordId,
          duration_sec: durationSec,
          quality_tier: qualityTier,
        }),
      });

      if (res.status === 402) {
        const data = await res.json().catch(() => ({}));
        onCreditExhausted?.({
          required: data.required ?? estimate?.credits_required ?? 0,
          balance: data.balance ?? (u?.credits_balance ?? 0),
          quality_tier: data.quality_tier ?? qualityTier,
          duration_sec: data.duration_sec ?? durationSec,
          reset_in_days: data.reset_in_days ?? 30,
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Separation failed (${res.status})`);
      }

      const data = await res.json();
      toast.success("Stems requested. Job submitted.");
      onSeparated?.(data);
    } catch (err: any) {
      toast.error(err.message || "Stem separation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Render ----

  if (!isAuthenticated) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Stem Evidence
        </div>
        <div className="forensic-panel-content">
          <p className="text-xs text-muted-foreground mb-3">
            Sign in to separate this track into 4 stems
            (vocal / drums / bass / other).
          </p>
          <Button
            size="sm"
            className="w-full"
            onClick={() => setLocation("/login")}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (tier === "free") {
    return (
      <div className="forensic-panel border-muted">
        <div className="forensic-panel-header flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Stem Evidence
        </div>
        <div className="forensic-panel-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
              <Lock className="w-3 h-3" />
              Locked
            </span>
            <span className="text-[10px] text-muted-foreground">
              Free tier
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Separate this track into 4 stems (vocal / drums / bass / other) —
            forensic-grade analysis for catalog evidence and self-verification.
            Available with Basic plan or higher.
          </p>
          <Button
            onClick={() => setLocation("/plan")}
            size="sm"
            className="w-full"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Upgrade to Basic
          </Button>
        </div>
      </div>
    );
  }

  const cost = estimate?.credits_required ?? 0;
  const isFree = !!estimate?.was_free_for_studio;
  const freeLeft = estimate?.free_remaining ?? 0;
  const insufficient =
    !isFree && cost > 0 && cost > (u?.credits_balance ?? 0);

  return (
    <div className="forensic-panel border-purple-500/40">
      <div className="forensic-panel-header flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-purple-500" />
        Open Stem Evidence
      </div>
      <div className="forensic-panel-content">
        <p className="text-xs text-muted-foreground mb-3">
          Separate this track into 4 stems (vocal / drums / bass / other).
          Forensic-grade analysis for catalog evidence and self-verification.
        </p>

        {estimating ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
            <Loader2 className="w-3 h-3 animate-spin" />
            Estimating cost…
          </div>
        ) : estimate ? (
          <div className="bg-muted/30 rounded-md p-3 mb-3 text-xs space-y-1">
            {isFree ? (
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-full bg-green-600 text-white text-[10px] font-bold">
                  FREE
                </span>
                <span className="text-muted-foreground">
                  Studio quota — {freeLeft} stem(s) free remaining this month
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="font-mono font-medium">
                    {cost.toLocaleString()} credits
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{Math.ceil(durationSec / 60)} min</span>
                  <span className="capitalize">{qualityTier}</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground mb-3">
            Run a scan first to enable stem separation.
          </div>
        )}

        <Button
          onClick={handleSeparate}
          className="w-full"
          size="sm"
          disabled={submitting || estimating || !estimate || insufficient}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Separate Stems
              {estimate &&
                (isFree
                  ? " (Free)"
                  : ` (${cost.toLocaleString()} credits)`)}
            </>
          )}
        </Button>

        {insufficient && (
          <p className="text-[11px] text-red-500 text-center mt-2">
            Insufficient credits — top-up to proceed.
          </p>
        )}
      </div>
    </div>
  );
}

export default StemEvidencePanel;
