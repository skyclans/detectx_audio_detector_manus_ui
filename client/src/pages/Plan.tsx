/**
 * Plan Page - Subscription Management
 *
 * v2.0 PRICING STRUCTURE:
 *
 * FREE ($0/forever):
 * - 3 verifications per month
 * - Verdict only (AI/Human) — no detailed report
 * - No PDF export, No certificate
 * - Standard processing queue
 *
 * PRO ($39.99/month):
 * - 50 verifications per month ($0.80/song)
 * - Full analysis report + PDF export
 * - Human Verification Certificate
 * - Priority processing queue
 * - Email support
 *
 * STUDIO ($399/month):
 * - 1,000 verifications per month ($0.40/song)
 * - Full API access (REST)
 * - Batch processing
 * - Priority support
 *
 * ENTERPRISE (Custom/Contact Sales):
 * - Unlimited verifications
 * - Dedicated processing infrastructure
 * - SLA guarantee (99.9% uptime)
 * - On-premise deployment option
 * - Custom integrations
 * - Dedicated account manager
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { fetchWithAuth } from "@/lib/api";
import { Check, X, Zap, Building2, Sparkles, Music, Loader2, CreditCard, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// v2.0 pricing structure
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    positioning: "Quick evaluation — verdict only.",
    perSong: null,
    features: [
      "3 verifications per month",
      "AI / Human verdict",
      "Standard processing queue",
    ],
    restrictions: [
      "Verdict only — no detailed report",
      "No PDF export or certificate",
      "No API access",
      "No batch processing",
    ],
    current: true,
    recommended: false,
    badgeText: "Current Plan",
    badgeVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$39.99",
    period: "month",
    icon: Zap,
    positioning: "Full forensic analysis for individual creators.",
    perSong: "$0.80 / song",
    features: [
      "50 verifications per month",
      "Full analysis report with dual-engine metrics",
      "PDF export & Human Verification Certificate",
      "All export formats (PDF, JSON, CSV, Markdown)",
      "Priority processing queue",
      "Email support",
    ],
    restrictions: [
      "No API access",
      "No batch processing",
    ],
    current: false,
    recommended: true,
    badgeText: "Get Pro",
    badgeVariant: "default" as const,
  },
  {
    name: "Studio",
    price: "$399",
    period: "month",
    icon: Music,
    positioning: "Production-grade batch analysis for studios and labels.",
    perSong: "$0.40 / song",
    features: [
      "1,000 verifications per month",
      "Batch processing — scan hundreds of tracks at once",
      "Full forensic report with dual-engine metrics",
      "PDF export & Human Verification Certificate",
      "All export formats (PDF, JSON, CSV, Markdown)",
      "Dedicated priority processing queue",
      "Up to 5 team member accounts",
      "Priority email & chat support",
    ],
    restrictions: [
      "No REST API access (Enterprise only)",
    ],
    current: false,
    recommended: false,
    badgeText: "Get Studio",
    badgeVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact Sales",
    icon: Building2,
    positioning: "For labels, publishers, and rights organizations.",
    perSong: null,
    features: [
      "Unlimited verifications",
      "REST API + Webhooks",
      "Dedicated GPU processing cluster",
      "SLA guarantee (99.9% uptime)",
      "On-premise deployment option",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team accounts",
    ],
    restrictions: [],
    current: false,
    recommended: false,
    badgeText: "Contact Sales",
    badgeVariant: "outline" as const,
  },
];

export default function Plan() {
  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<string | null>(null); // plan key awaiting confirmation

  // Handle payment success/cancel URL params (return from Stripe Checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const plan = params.get("plan");

    if (payment === "success" && plan) {
      toast.success(`Successfully subscribed to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
      // Refresh user data to reflect the new plan
      refreshUser();
      // Clean URL params
      window.history.replaceState({}, "", "/plan");
    } else if (payment === "cancelled") {
      toast.info("Payment was cancelled.");
      window.history.replaceState({}, "", "/plan");
    }
  }, [refreshUser]);

  const handleUpgrade = async (planName: string) => {
    if (planName === "Enterprise") {
      window.location.href = "/contact?type=enterprise-sales";
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to upgrade your plan.");
      return;
    }

    const planKey = planName.toLowerCase();

    // Show confirmation for any plan change (except clicking same plan)
    if (userPlan !== planKey && !confirmUpgrade) {
      setConfirmUpgrade(planKey);
      return;
    }

    setConfirmUpgrade(null);
    setLoadingPlan(planKey);

    try {
      const res = await fetchWithAuth("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Failed to create checkout session`);
      }

      const result = await res.json();
      if (result.upgraded) {
        // Direct upgrade (existing subscription modified) — refresh user data in-place
        toast.success(`Successfully upgraded to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)}!`);
        await refreshUser();
      } else if (result.url) {
        // New subscription — redirect to Stripe Checkout
        window.location.href = result.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan("portal");
    try {
      const res = await fetchWithAuth("/api/stripe/create-portal-session", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to open billing portal");
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal.");
    } finally {
      setLoadingPlan(null);
    }
  };

  // Determine user's current plan
  const userPlan = user?.plan || "free";
  const planRank: Record<string, number> = { free: 0, pro: 1, studio: 2, enterprise: 3 };
  const userRank = planRank[userPlan] ?? 0;

  // Plan page is accessible to all users (logged-in and non-logged-in)
  return (
    <ForensicLayout title="Pricing" subtitle="Choose the plan that fits your workflow">
      <div className="max-w-6xl">
        {/* Plan Cards - All badges aligned at same vertical position */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrent = plan.name.toLowerCase() === userPlan;
            // Only show "Recommended" if user is on a lower plan
            const showRecommended = plan.recommended && !isCurrent && userRank < (planRank[plan.name.toLowerCase()] ?? 0);
            return (
              <div
                key={plan.name}
                className={`forensic-panel relative flex flex-col ${
                  isCurrent ? "ring-2 ring-forensic-green" : showRecommended ? "ring-2 ring-forensic-cyan" : ""
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-forensic-green text-background text-xs font-medium rounded-full">
                    Your Plan
                  </div>
                )}
                {showRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-forensic-cyan text-background text-xs font-medium rounded-full">
                    Recommended
                  </div>
                )}
                <div className="forensic-panel-header flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {plan.name}
                </div>
                <div className="forensic-panel-content flex flex-col flex-1">
                  {/* Price */}
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period !== "forever" && plan.price !== "Custom" && (
                      <span className="text-xs text-muted-foreground">
                        per {plan.period}
                      </span>
                    )}
                    {plan.perSong && (
                      <span className="text-[10px] text-forensic-cyan mt-1">
                        {plan.perSong}
                      </span>
                    )}
                  </div>

                  {/* Positioning */}
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    {plan.positioning}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Restrictions (for Free and Professional) */}
                  {plan.restrictions.length > 0 && (
                    <div className="border-t border-border/30 pt-3 mb-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Limitations
                      </p>
                      <ul className="space-y-1">
                        {plan.restrictions.map((restriction) => (
                          <li key={restriction} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <X className="w-3 h-3 text-red-500/70 flex-shrink-0 mt-0.5" />
                            <span>{restriction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Spacer to push badge to bottom */}
                  <div className="flex-1" />

                  {/* CTA Button/Badge - ALL aligned at same vertical position */}
                  <div className="mt-auto pt-4">
                    {(() => {
                      const planKey = plan.name.toLowerCase();
                      const isLoading = loadingPlan === planKey;
                      const thisRank = planRank[planKey] ?? 0;

                      if (isCurrent) {
                        return (
                          <Button variant="outline" className="w-full h-10 border-forensic-green text-forensic-green" disabled>
                            Your Plan
                          </Button>
                        );
                      }

                      // Free plan card: show "Free Plan" (not a clickable action) when user is on a paid plan
                      if (planKey === "free" && userRank > 0) {
                        return (
                          <Button variant="outline" className="w-full h-10 opacity-50" disabled>
                            Free Plan
                          </Button>
                        );
                      }

                      return (
                        <Button
                          className="w-full h-10"
                          variant={showRecommended ? "default" : "outline"}
                          onClick={() => handleUpgrade(plan.name)}
                          disabled={isLoading || loadingPlan !== null}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redirecting...
                            </>
                          ) : plan.name === "Enterprise" ? (
                            <>{plan.badgeText}</>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              {thisRank > userRank ? `Get ${plan.name}` : plan.badgeText}
                            </>
                          )}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage Stats */}
        <div className="forensic-panel mt-6">
          <div className="forensic-panel-header flex items-center justify-between">
            <span>Current Usage</span>
            {userPlan !== "free" && isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleManageSubscription}
                disabled={loadingPlan === "portal"}
              >
                {loadingPlan === "portal" ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <CreditCard className="w-3 h-3 mr-1" />
                )}
                Manage Subscription
              </Button>
            )}
          </div>
          <div className="forensic-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Plan
                </p>
                <p className="text-2xl font-bold text-foreground capitalize">
                  {userPlan}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Verifications This Month
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {user?.usage_count ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {(user?.monthly_limit ?? 3) < 0 ? "Unlimited" : user?.monthly_limit ?? 3}
                  </span>
                </p>
                {(user?.monthly_limit ?? 3) > 0 && (
                  <div className="w-full h-2 bg-muted rounded-full mt-2">
                    <div
                      className="h-full bg-forensic-cyan rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((user?.usage_count ?? 0) / (user?.monthly_limit ?? 3)) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Remaining
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {(user?.monthly_limit ?? 3) < 0
                    ? "Unlimited"
                    : Math.max(0, (user?.monthly_limit ?? 3) - (user?.usage_count ?? 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="forensic-panel mt-6">
          <div className="forensic-panel-header">Frequently Asked Questions</div>
          <div className="forensic-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  What counts as a verification?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Each audio file analyzed counts as one verification, regardless of file size or duration.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Can I upgrade or downgrade anytime?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  What's the difference between Free and Pro?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Free provides only the AI/Human verdict. Pro unlocks the full analysis report with detailed metrics, PDF export, and Human Verification Certificate.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  What file formats are supported?
                </h4>
                <p className="text-xs text-muted-foreground">
                  We support WAV, MP3, FLAC, OGG, and M4A formats across all plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Change Confirmation Modal */}
      {confirmUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="forensic-panel w-full max-w-md mx-4">
            <div className="forensic-panel-header flex items-center gap-2">
              {userPlan === "free" ? (
                <Zap className="w-4 h-4 text-forensic-cyan" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              {userPlan === "free" ? "Confirm Subscription" : "Confirm Plan Change"}
            </div>
            <div className="forensic-panel-content space-y-4">
              <p className="text-sm text-foreground">
                {userPlan === "free" ? (
                  <>
                    You are about to subscribe to the{" "}
                    <span className="font-semibold capitalize">{confirmUpgrade}</span> plan.
                  </>
                ) : (
                  <>
                    You are about to change your plan from{" "}
                    <span className="font-semibold capitalize">{userPlan}</span> to{" "}
                    <span className="font-semibold capitalize">{confirmUpgrade}</span>.
                  </>
                )}
              </p>
              <div className="bg-muted/50 rounded-md p-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Price:{" "}
                  <span className="text-foreground font-medium">
                    {plans.find((p) => p.name.toLowerCase() === confirmUpgrade)?.price}/month
                  </span>
                </p>
                {userPlan !== "free" && (
                  <p className="text-xs text-muted-foreground">
                    Your current billing will be prorated automatically.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmUpgrade(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleUpgrade(confirmUpgrade.charAt(0).toUpperCase() + confirmUpgrade.slice(1))}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {userPlan === "free" ? "Subscribe" : "Confirm Change"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ForensicLayout>
  );
}
