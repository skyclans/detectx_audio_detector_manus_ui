/**
 * CreditBalanceSidebar — sidebar credit widget.
 *
 * Displayed at the bottom of ForensicLayout sidebar.
 *
 * Backend contract (Phase 3 /auth/me extensions):
 *   user.credits_balance: number  (-1 = unlimited)
 *   user.monthly_grant:   number
 *   user.tier:            "free" | "basic" | "pro" | "studio" | "enterprise"
 *   user.tier_renewed_at: ISO datetime string
 *   user.free_usage:      { mp3_used, lossless_used, hires_used }
 *
 * Backward compatible: when the new fields are missing (legacy backend),
 * falls back to the legacy "plan + monthly_limit + usage_count" model.
 */

import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { CreditCard, Gem, Gift, Sparkles, Zap } from "lucide-react";

interface FreeUsage {
  mp3_used?: number;
  lossless_used?: number;
  hires_used?: number;
}

function daysUntilReset(renewedAt?: string | null): number {
  if (!renewedAt) return 30;
  try {
    const renewed = new Date(renewedAt).getTime();
    const next = renewed + 30 * 24 * 60 * 60 * 1000;
    const ms = next - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  } catch {
    return 30;
  }
}

export function CreditBalanceSidebar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated || !user) return null;

  const u = user as any;

  // Read tier / plan (tier is preferred, fallback to plan)
  const tier: string = (u.tier ?? u.plan ?? "free").toLowerCase();
  const balance: number | undefined = u.credits_balance;
  const monthlyGrant: number | undefined = u.monthly_grant;
  const renewedAt: string | null | undefined = u.tier_renewed_at;
  const freeUsage: FreeUsage = u.free_usage ?? {};
  const resetDays = daysUntilReset(renewedAt);

  // Unlimited tier (Enterprise) — backend signals via balance = -1
  if (balance === -1) {
    return (
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div
          className="p-3 rounded-lg bg-sidebar-accent/30 cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
          onClick={() => setLocation("/plan")}
        >
          <div className="flex items-center gap-2 mb-1">
            <Gem className="w-4 h-4 text-forensic-cyan" />
            <span className="text-xs font-medium uppercase tracking-wider text-forensic-cyan">
              Unlimited
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground capitalize">
            {tier} tier
          </div>
        </div>
      </div>
    );
  }

  // Free tier — trial scan counts (only when backend reports tier=free with grant)
  if (tier === "free") {
    // Show REMAINING scans (limit - used), not the used count
    const mp3Left = Math.max(0, 2 - (freeUsage.mp3_used ?? 0));
    const losslessLeft = Math.max(0, 1 - (freeUsage.lossless_used ?? 0));
    const hiresLeft = Math.max(0, 1 - (freeUsage.hires_used ?? 0));
    return (
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="p-3 rounded-lg bg-sidebar-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Free Trial
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MP3</span>
              <span className={cn("font-mono", mp3Left <= 0 && "text-red-500")}>
                {mp3Left} / 2
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lossless</span>
              <span className={cn("font-mono", losslessLeft <= 0 && "text-red-500")}>
                {losslessLeft} / 1
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hi-Res</span>
              <span className={cn("font-mono", hiresLeft <= 0 && "text-red-500")}>
                {hiresLeft} / 1
              </span>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">
            Resets in {resetDays} days
          </div>
          <button
            onClick={() => setLocation("/plan")}
            className="w-full mt-2.5 px-2 py-1.5 text-xs bg-forensic-cyan text-background rounded font-medium hover:bg-forensic-cyan/90 transition-colors flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  // Paid tier with credits_balance — render real credit widget
  if (balance != null && monthlyGrant != null) {
    const percentage =
      monthlyGrant > 0 ? Math.max(0, Math.min(100, (balance / monthlyGrant) * 100)) : 0;
    const isLow = percentage < 15;

    return (
      <>
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-sidebar-accent/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-forensic-cyan" />
                <span className="text-xs font-medium uppercase tracking-wider text-forensic-cyan">
                  Credits
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground capitalize">
                {tier}
              </span>
            </div>

            <div className="text-lg font-bold text-foreground leading-tight">
              {balance.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              of {monthlyGrant.toLocaleString()} this month
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isLow
                    ? "bg-red-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500",
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              Resets in {resetDays} days
            </div>

            <button
              onClick={() => setLocation("/plan#topup")}
              className="w-full mt-2.5 px-2 py-1.5 text-xs bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              Top-up
            </button>
          </div>
        </div>
      </>
    );
  }

  // Legacy fallback: monthly_limit + usage_count (Phase < 3 backend)
  const usage = user.usage_count ?? 0;
  const limit = user.monthly_limit ?? 0;
  const remaining = limit > 0 ? Math.max(0, limit - usage) : 0;
  const limitPct = limit > 0 ? Math.max(0, Math.min(100, (remaining / limit) * 100)) : 0;
  const isPaid =
    tier === "pro" || tier === "studio" || tier === "basic" || tier === "enterprise";

  return (
    <div className="px-3 py-3 border-t border-sidebar-border">
      <div
        className="p-3 rounded-lg bg-sidebar-accent/30 cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
        onClick={() => setLocation("/plan")}
      >
        <div className="flex items-center gap-2 mb-2">
          {isPaid ? (
            <Zap className="w-4 h-4 text-forensic-cyan" />
          ) : (
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-xs font-medium uppercase tracking-wider capitalize",
              isPaid ? "text-forensic-cyan" : "text-muted-foreground",
            )}
          >
            {tier}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span
              className={cn(
                "font-medium",
                remaining === 0 ? "text-red-500" : "text-foreground",
              )}
            >
              {limit < 0 ? "Unlimited" : `${remaining} / ${limit}`}
            </span>
          </div>
          {limit > 0 && (
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  remaining === 0 ? "bg-red-500" : "bg-forensic-cyan",
                )}
                style={{ width: `${limitPct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
