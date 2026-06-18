/**
 * Plan Page — Subscription & Credits (Phase 5 redesign)
 *
 * v3.0 CREDIT-BASED PRICING:
 *
 * Free ($0):
 *   - Trial scans: 2 MP3 + 1 Lossless + 1 Hi-Res per month (each up to 6 min)
 *   - Voice detection unlimited (Beta)
 *
 * Basic ($4.99, anchor $14.99):
 *   - 5,000 credits / month
 *   - Voice detection unlimited (Beta)
 *   - Full PDF reports (no watermark)
 *
 * Pro ($23, anchor $79):
 *   - 30,000 credits / month
 *   - + API access
 *   - + Full stem visualization
 *   - + Audit trail (millisecond precision)
 *
 * Studio ($89, anchor $349):  ← Most Popular
 *   - 150,000 credits / month
 *   - + Bulk upload
 *   - + Forensic Report (DDEX)
 *   - + Digital signature audit
 *   - + 30 free Forensic Stem reports / month (Phase 8)
 *   - + Priority processing
 *
 * Enterprise (Custom):
 *   - SLA + On-premise, DDEX automation, white-label PDFs, dedicated support.
 *
 * Quality multipliers (per minute, MP3 baseline = 50 cr/min):
 *   - Standard  (MP3, AAC, OGG, …)        1.0x
 *   - Lossless  (FLAC, WAV 16-bit ≤48k)   1.3x
 *   - Hi-Res    (24-bit OR 88–96k)        1.8x
 *   - Audiophile (≥176k, DSD)             2.5x
 *
 * Top-up packages (one-time):
 *   10,000 cr → $9   (anchor $14, 36% off)
 *   50,000 cr → $40  (anchor $69, 42% off)
 *   200,000 cr → $140 (anchor $249, 44% off)
 *   1,000,000 cr → $600 (anchor $1,200, 50% off)
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/api";
import {
  Check,
  X,
  Zap,
  Building2,
  Sparkles,
  Music,
  Loader2,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { CreditTopUpModal } from "@/components/CreditTopUpModal";

// MP3 baseline: 50 credits per minute
const MP3_CREDITS_PER_MIN = 50;
const QUALITY_MULTIPLIER = {
  standard: 1.0,
  lossless: 1.3,
  hires: 1.8,
  audiophile: 2.5,
};

function creditsToMinutes(credits: number, mult: number): number {
  return Math.floor(credits / (MP3_CREDITS_PER_MIN * mult));
}

function fmt(n: number): string {
  return n.toLocaleString();
}

interface Plan {
  key: string;
  name: string;
  price: string;
  anchor?: string;
  discount?: number;
  period: string;
  icon: any;
  positioning: string;
  monthlyCredits: number | null;
  features: string[];
  restrictions: string[];
  freeTrial?: { mp3: number; lossless: number; hires: number };
  badgeText: string;
  recommended?: boolean;
  current?: boolean;
}

const plans: Plan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    positioning: "Try DetectX with a few free scans every month.",
    monthlyCredits: null,
    freeTrial: { mp3: 2, lossless: 1, hires: 1 },
    features: [
      "2 MP3 trial scans / month (up to 6 min each)",
      "1 Lossless trial scan / month (up to 6 min)",
      "1 Hi-Res trial scan / month (up to 6 min)",
      "Voice detection unlimited (Beta)",
      "Resets monthly",
    ],
    restrictions: ["No API access", "No batch processing"],
    badgeText: "Get Started Free",
  },
  {
    key: "basic",
    name: "Basic",
    price: "$4.99",
    anchor: "$14.99",
    discount: 67,
    period: "month",
    icon: Zap,
    positioning: "For individuals who scan a few tracks per week.",
    monthlyCredits: 5000,
    features: [
      "5,000 credits / month",
      "Voice detection unlimited (Beta)",
      "Full PDF reports (no watermark)",
      "All export formats (PDF, JSON, CSV, Markdown)",
      "5 Stem Evidence trial / month (listen-only, no download)",
    ],
    restrictions: ["No API access", "No batch processing"],
    badgeText: "Upgrade to Basic",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$23",
    anchor: "$79",
    discount: 71,
    period: "month",
    icon: Music,
    positioning: "Producers, writers, and small labels working at volume.",
    monthlyCredits: 30000,
    features: [
      "30,000 credits / month",
      "Voice detection unlimited (Beta)",
      "Full PDF reports (no watermark)",
      "All export formats (PDF, JSON, CSV, Markdown)",
      "Full stem visualization",
      "Snapshot stems in PDF (high-res) + Forensic stems @ 100 cr/min",
      "Audit trail (millisecond precision)",
      "Priority email support",
    ],
    restrictions: ["No API access", "No bulk upload (Studio only)"],
    badgeText: "Upgrade to Pro",
    recommended: true,
  },
  {
    key: "studio",
    name: "Studio",
    price: "$89",
    anchor: "$349",
    discount: 74,
    period: "month",
    icon: Music,
    positioning: "Production-grade volume for studios, labels, and catalogues.",
    monthlyCredits: 150000,
    features: [
      "150,000 credits / month",
      "Voice detection unlimited (Beta)",
      "Full PDF reports (no watermark)",
      "All export formats (PDF, JSON, CSV, Markdown)",
      "Full stem visualization",
      "Snapshot stems in PDF (high-res)",
      "30 free Forensic Stem reports / month (then 100 cr/min)",
      "Audit trail (millisecond precision)",
      "Bulk upload",
      "Forensic Report (DDEX disclosure codes)",
      "Digital signature audit",
      "Priority processing",
    ],
    restrictions: ["No API access"],
    badgeText: "Upgrade to Studio",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "Contact Sales",
    icon: Building2,
    positioning: "Associations, publishers, and rights organizations.",
    monthlyCredits: null,
    features: [
      "Custom credits (unlimited or tailored)",
      "Voice detection unlimited (Beta)",
      "All Basic, Pro, Studio features included",
      "Unlimited Forensic Stem reports",
      "Dedicated cloud GPU (region-closest: Tokyo / Seoul / Singapore / Frankfurt / Virginia / São Paulo)",
      "Lowest latency for your team's location",
      "99.9% uptime SLA (financial-backed)",
      "24/7 dedicated support engineer",
      "Custom audio retention period",
      "DDEX automation (auto-submit to DSP)",
      "White-label PDF reports (your branding)",
      "API access (REST) with custom endpoints",
      "SSO / SAML integration",
      "SCIM user provisioning",
      "Audit log export (compliance-ready)",
      "Multi-team management",
      "Volume discount eligible",
      "Custom model training (on request)",
      "Direct line to engineering",
      "Quarterly business review",
      "On-premise deployment option",
      "Custom integrations (Slack, Teams, JIRA, custom webhooks)",
    ],
    restrictions: [],
    badgeText: "Contact Sales",
  },
];

const topupPacks = [
  { id: "10k", credits: 10000, price: 9, anchor: 14, discount: 36 },
  { id: "50k", credits: 50000, price: 40, anchor: 69, discount: 42 },
  { id: "200k", credits: 200000, price: 140, anchor: 249, discount: 44 },
  { id: "1m", credits: 1_000_000, price: 600, anchor: 1200, discount: 50 },
];

function MinuteBreakdown({ credits }: { credits: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[11px] text-muted-foreground mt-2 whitespace-nowrap">
      <span>MP3</span>
      <span className="font-mono text-foreground text-right">
        ≈ {fmt(creditsToMinutes(credits, QUALITY_MULTIPLIER.standard))} min
      </span>
      <span>Lossless</span>
      <span className="font-mono text-foreground text-right">
        ≈ {fmt(creditsToMinutes(credits, QUALITY_MULTIPLIER.lossless))} min
      </span>
      <span>Hi-Res 24/96</span>
      <span className="font-mono text-foreground text-right">
        ≈ {fmt(creditsToMinutes(credits, QUALITY_MULTIPLIER.hires))} min
      </span>
    </div>
  );
}

export default function Plan() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);

  // Handle payment success/cancel URL params (return from Stripe Checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const plan = params.get("plan");
    const topup = params.get("topup");

    if (payment === "success" && plan) {
      toast.success(
        `Successfully subscribed to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`,
      );
      refreshUser();
      window.history.replaceState({}, "", "/plan");
    } else if (payment === "success" && topup) {
      toast.success(`Credits added to your balance.`);
      refreshUser();
      window.history.replaceState({}, "", "/plan");
    } else if (payment === "cancelled") {
      toast.info("Payment was cancelled.");
      window.history.replaceState({}, "", "/plan");
    }
  }, [refreshUser]);

  const userPlan = (user as any)?.plan || "free";
  const planRank: Record<string, number> = {
    free: 0,
    basic: 1,
    pro: 2,
    studio: 3,
    enterprise: 4,
  };
  const userRank = planRank[userPlan] ?? 0;

  const handleUpgrade = async (planKey: string) => {
    if (planKey === "enterprise") {
      window.location.href = "/contact?type=enterprise-sales";
      return;
    }
    if (planKey === "free") return;

    if (!isAuthenticated) {
      toast.error("Please sign in to upgrade your plan.");
      return;
    }

    // Confirm modal first
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
        toast.success(`Successfully upgraded to ${planKey}!`);
        await refreshUser();
      } else if (result.url) {
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
      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal.");
    } finally {
      setLoadingPlan(null);
    }
  };

  // Tier color map
  const tierColor: Record<string, string> = {
    free: "border-muted",
    basic: "border-blue-500/50",
    pro: "border-purple-500/50",
    studio: "border-red-500/60",
    enterprise: "border-green-600/50",
  };

  return (
    <ForensicLayout
      title="Pricing"
      subtitle="Credit-based plans. Pay for what you scan."
    >
      <SEO
        title="Pricing — Credit-based AI Music & Voice Detection Plans"
        description="DetectX credit pricing. Free trial, Basic $4.99 (5K credits), Pro $23 (30K), Studio $89 (150K). Voice detection unlimited on every plan. Top-up packages available."
        path="/plan/"
      />
      <div className="max-w-7xl">
        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrent = plan.key === userPlan;
            const showRecommended =
              plan.recommended && !isCurrent && userRank < (planRank[plan.key] ?? 0);
            const planRankHere = planRank[plan.key] ?? 0;

            return (
              <div
                key={plan.key}
                className={`forensic-panel relative flex flex-col border-2 ${
                  isCurrent
                    ? "ring-2 ring-forensic-green"
                    : showRecommended
                      ? "ring-2 ring-red-500/70"
                      : tierColor[plan.key] || ""
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-forensic-green text-background text-xs font-medium rounded-full whitespace-nowrap">
                    Your Plan
                  </div>
                )}
                {showRecommended && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                {plan.discount && !isCurrent && (
                  <div className="absolute -top-3 left-3 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                    {plan.discount}% OFF
                  </div>
                )}

                <div className="forensic-panel-header flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {plan.name}
                </div>

                <div className="forensic-panel-content flex flex-col flex-1">
                  {/* Price — uniform 3-row structure for vertical alignment across all tiers */}
                  <div className="flex flex-col items-center mb-3">
                    {/* Row 1: anchor (strikethrough) — invisible placeholder for tiers without anchor */}
                    {plan.anchor ? (
                      <span className="text-gray-400 line-through text-base">
                        {plan.anchor}
                      </span>
                    ) : (
                      <span
                        className="text-base line-through opacity-0 select-none"
                        aria-hidden="true"
                      >
                        $0
                      </span>
                    )}
                    {/* Row 2: main price */}
                    <span className="text-3xl font-bold text-foreground leading-tight">
                      {plan.price}
                    </span>
                    {/* Row 3: period / sub-line — invisible placeholder for "forever" */}
                    {plan.period !== "forever" && plan.price !== "Custom" && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        per {plan.period}
                      </span>
                    )}
                    {plan.price === "Custom" && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Contact Sales
                      </span>
                    )}
                    {plan.period === "forever" && (
                      <span
                        className="text-[10px] uppercase tracking-wider opacity-0 select-none"
                        aria-hidden="true"
                      >
                        per month
                      </span>
                    )}
                  </div>

                  {/* Positioning */}
                  <p className="text-xs text-muted-foreground text-center mb-3 min-h-[2.5rem]">
                    {plan.positioning}
                  </p>

                  {/* Credit breakdown */}
                  {plan.monthlyCredits != null && (
                    <div className="bg-muted/30 rounded-md p-3 mb-3">
                      <p className="text-xs font-medium text-foreground text-center mb-1">
                        {fmt(plan.monthlyCredits)} credits / month
                      </p>
                      <MinuteBreakdown credits={plan.monthlyCredits} />
                    </div>
                  )}

                  {/* Free trial breakdown */}
                  {plan.freeTrial && (
                    <div className="bg-muted/30 rounded-md p-3 mb-3">
                      <p className="font-medium text-foreground text-center mb-1 text-xs">
                        Trial scans / month
                      </p>
                      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[11px] whitespace-nowrap">
                        <span className="text-muted-foreground">MP3</span>
                        <span className="font-mono text-foreground text-right">
                          {plan.freeTrial.mp3}× ≤6min
                        </span>
                        <span className="text-muted-foreground">Lossless</span>
                        <span className="font-mono text-foreground text-right">
                          {plan.freeTrial.lossless}× ≤6min
                        </span>
                        <span className="text-muted-foreground">Hi-Res</span>
                        <span className="font-mono text-foreground text-right">
                          {plan.freeTrial.hires}× ≤6min
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Invisible box placeholder — keeps Enterprise feature list vertically aligned
                      with other tiers that render either credits box or freeTrial box */}
                  {plan.monthlyCredits == null && !plan.freeTrial && (
                    <div
                      className="rounded-md p-3 mb-3 opacity-0 select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      <p className="text-xs font-medium text-center mb-1">
                        placeholder
                      </p>
                      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[11px] whitespace-nowrap">
                        <span>MP3</span>
                        <span className="font-mono text-right">≈ 0 min</span>
                        <span>Lossless</span>
                        <span className="font-mono text-right">≈ 0 min</span>
                        <span>Hi-Res 24/96</span>
                        <span className="font-mono text-right">≈ 0 min</span>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-1.5 mb-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                        <span className="text-foreground leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Restrictions */}
                  {plan.restrictions.length > 0 && (
                    <div className="border-t border-border/30 pt-2 mb-3">
                      <ul className="space-y-1">
                        {plan.restrictions.map((restriction) => (
                          <li
                            key={restriction}
                            className="flex items-start gap-2 text-[11px] text-muted-foreground"
                          >
                            <X className="w-3 h-3 text-red-500/70 flex-shrink-0 mt-0.5" />
                            <span>{restriction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-3">
                    {(() => {
                      const isLoading = loadingPlan === plan.key;

                      if (isCurrent) {
                        return (
                          <Button
                            variant="outline"
                            className="w-full h-10 border-forensic-green text-forensic-green"
                            disabled
                          >
                            Your Plan
                          </Button>
                        );
                      }

                      if (plan.key === "free" && userRank > 0) {
                        return (
                          <Button
                            variant="outline"
                            className="w-full h-10 opacity-50"
                            disabled
                          >
                            Free Plan
                          </Button>
                        );
                      }

                      return (
                        <Button
                          className="w-full h-10"
                          variant={showRecommended ? "default" : "outline"}
                          onClick={() => handleUpgrade(plan.key)}
                          disabled={isLoading || loadingPlan !== null}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redirecting...
                            </>
                          ) : (
                            <>
                              {planRankHere > userRank
                                ? plan.badgeText
                                : plan.badgeText}
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

        {/* Top-up Section */}
        <div className="forensic-panel mt-8">
          <div className="forensic-panel-header flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Buy Credit Packs (One-time)
          </div>
          <div className="forensic-panel-content">
            <p className="text-xs text-muted-foreground mb-4">
              Need more credits? Top-up anytime. Credits never expire while your
              account is active.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topupPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="border border-border rounded-md p-4 hover:border-purple-500/70 transition-colors flex flex-col"
                >
                  <div className="text-xl font-bold text-foreground">
                    {fmt(pack.credits)}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    credits
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-gray-400 line-through text-sm">
                      ${pack.anchor}
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      ${pack.price}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                      {pack.discount}% OFF
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-3 space-y-0.5">
                    <div>
                      ≈ {fmt(creditsToMinutes(pack.credits, 1.0))} MP3 min
                    </div>
                    <div>
                      ≈ {fmt(creditsToMinutes(pack.credits, 1.3))} Lossless min
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowTopUp(true)}
                    className="w-full mt-4"
                    variant={pack.id === "50k" ? "default" : "outline"}
                    size="sm"
                  >
                    Buy Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Standard vs Professional Report */}
        <div className="forensic-panel mt-6">
          <div className="forensic-panel-header flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Report Types
          </div>
          <div className="forensic-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    STANDARD REPORT
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-forensic-green/20 text-forensic-green font-medium">
                    Included
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Auto-included with every scan.
                </p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Verdict + score</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Stem visualization</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Basic metadata</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Audit hash (SHA-256)</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-red-500/50 rounded-md p-4 bg-red-500/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                    PROFESSIONAL FORENSIC
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium">
                    Custom Quote
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Legal-grade evidence for court, copyright associations, and DSP
                  disputes.
                </p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Everything in Standard +</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Digital signature</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Generator FP precise</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Plan estimation</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>DDEX auto-disclosure</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Multilingual PDF (EN/JA/KO)</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                    <span>Expert review certification</span>
                  </li>
                </ul>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setLocation("/forensic/request")}
                >
                  Request Quote
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
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
                  Credits Balance
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {(user as any)?.credits_balance != null
                    ? fmt((user as any).credits_balance)
                    : "—"}
                  {(user as any)?.monthly_grant != null && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      / {fmt((user as any).monthly_grant)}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Verifications This Month
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {user?.usage_count ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="forensic-panel mt-6">
          <div className="forensic-panel-header">Frequently Asked Questions</div>
          <div className="forensic-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  How do credits work?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Each MP3 minute costs 50 credits. Higher-quality formats use a
                  multiplier (Lossless 1.3x, Hi-Res 1.8x, Audiophile 2.5x).
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Do unused credits roll over?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Monthly grant credits reset every month. Top-up credits never
                  expire while your account is active.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Can I top-up on any plan?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Top-up packages are available on Basic, Pro, and Studio plans.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Is Voice detection really unlimited?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Yes, Voice deepfake detection is unlimited on every plan during
                  the Beta period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Change Confirmation */}
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
                    <span className="font-semibold capitalize">{confirmUpgrade}</span>{" "}
                    plan.
                  </>
                ) : (
                  <>
                    You are about to change your plan from{" "}
                    <span className="font-semibold capitalize">{userPlan}</span> to{" "}
                    <span className="font-semibold capitalize">{confirmUpgrade}</span>
                    .
                  </>
                )}
              </p>
              <div className="bg-muted/50 rounded-md p-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Price:{" "}
                  <span className="text-foreground font-medium">
                    {plans.find((p) => p.key === confirmUpgrade)?.price}/month
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
                  onClick={() => handleUpgrade(confirmUpgrade)}
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

      <CreditTopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
    </ForensicLayout>
  );
}
