/**
 * Plan Page - Subscription Management
 * 
 * v1.1 BETA PRICING CONFIGURATION:
 * 
 * FREE ($0/forever):
 * - 5 verifications per month
 * - Basic CR-G analysis
 * - PDF & JSON export
 * - Standard processing queue
 * - Community support
 * - NO API access, NO batch processing, NO priority queue
 * 
 * PROFESSIONAL (BETA - FREE ACCESS This Month Only):
 * - Up to 30 verifications during the beta period
 * - Full CR-G analysis suite
 * - All export formats (PDF, JSON, CSV, Markdown)
 * - Batch processing (UI-based only)
 * - Priority support
 * - NO API access, NO automation, NO webhooks
 * - "Professional is for people, not systems"
 * 
 * ENTERPRISE (Custom/Contact Sales):
 * - Unlimited verifications
 * - Full API access (REST)
 * - Webhooks
 * - Unlimited batch processing
 * - Dedicated processing infrastructure
 * - SLA guarantee (99.9% uptime)
 * - On-premise deployment option
 * - Custom integrations
 * - Dedicated account manager
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Check, X, LogIn, Zap, Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// v1.0 FINAL pricing structure - EXACTLY as specified
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    positioning: "Evaluation and light research use.",
    features: [
      "5 verifications per month",
      "Basic CR-G analysis",
      "PDF & JSON export",
      "Standard processing queue",
      "Community support",
    ],
    restrictions: [
      "No API access",
      "No batch processing",
      "No priority queue",
    ],
    current: true,
    recommended: false,
    badgeText: "Current Plan",
    badgeVariant: "outline" as const,
  },
  {
    name: "Professional Plan",
    subtitle: "BETA — FREE ACCESS (This Month Only)",
    price: "Free",
    period: "beta",
    icon: Zap,
    positioning: "This plan is currently available as a beta version.",
    betaDescription: `Free access is provided for this month only while payment infrastructure is being finalized.

During the beta period, up to 30 verification certificates are available for testing and evaluation.`,
    features: [
      "Up to 30 verifications during the beta period",
      "Full CR-G analysis suite",
      "All export formats (PDF, JSON, CSV, Markdown)",
      "Batch processing (UI-based only)",
      "Priority support",
    ],
    restrictions: [
      "NO API access",
      "NO automation",
      "NO webhooks",
    ],
    restrictionNote: "Professional is for people, not systems.",
    current: false,
    recommended: true,
    badgeText: "Get Professional (Beta)",
    badgeVariant: "default" as const,
    isBeta: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact Sales",
    icon: Building2,
    positioning: "System-level and organizational integration.",
    features: [
      "Unlimited verifications",
      "Full API access (REST)",
      "Webhooks",
      "Unlimited batch processing",
      "Dedicated processing infrastructure",
      "SLA guarantee (99.9% uptime)",
      "On-premise deployment option",
      "Custom integrations",
      "Dedicated account manager",
    ],
    restrictions: [],
    current: false,
    recommended: false,
    badgeText: "Contact Sales",
    badgeVariant: "outline" as const,
  },
];

export default function Plan() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const handleUpgrade = (planName: string) => {
    if (planName === "Enterprise") {
      toast.info("Contact sales@detectx.app for Enterprise pricing");
    } else {
      toast.info(`${planName} plan upgrade coming soon`);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout title="Plan" subtitle="Subscription management">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sign in to view and manage your subscription plan.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In to Continue
          </Button>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout title="Plan" subtitle="Subscription management">
      <div className="max-w-6xl">
        {/* Plan Cards - All badges aligned at same vertical position */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`forensic-panel relative flex flex-col ${
                  plan.recommended ? "ring-2 ring-forensic-cyan" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-forensic-cyan text-background text-xs font-medium rounded-full">
                    Recommended
                  </div>
                )}
                <div className="forensic-panel-header flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {plan.name}
                </div>
                <div className="forensic-panel-content flex flex-col flex-1">
                  {/* Subtitle for Beta */}
                  {'subtitle' in plan && plan.subtitle && (
                    <p className="text-xs text-forensic-cyan font-medium text-center mb-2">
                      {plan.subtitle}
                    </p>
                  )}
                  
                  {/* Price - Clear text format to avoid confusion */}
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period !== "forever" && plan.period !== "beta" && plan.price !== "Custom" && (
                      <span className="text-xs text-muted-foreground">
                        per {plan.period}
                      </span>
                    )}
                  </div>

                  {/* Positioning */}
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    {plan.positioning}
                  </p>
                  
                  {/* Beta Description */}
                  {'betaDescription' in plan && plan.betaDescription && (
                    <p className="text-xs text-muted-foreground text-center mb-4 whitespace-pre-line">
                      {plan.betaDescription}
                    </p>
                  )}

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
                        {plan.name.includes("Professional") ? "Restrictions (MANDATORY)" : "Limitations"}
                      </p>
                      <ul className="space-y-1">
                        {plan.restrictions.map((restriction) => (
                          <li key={restriction} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <X className="w-3 h-3 text-red-500/70 flex-shrink-0 mt-0.5" />
                            <span>{restriction}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.restrictionNote && (
                        <p className="text-[10px] text-forensic-amber mt-2 italic">
                          {plan.restrictionNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Spacer to push badge to bottom */}
                  <div className="flex-1" />

                  {/* CTA Button/Badge - ALL aligned at same vertical position */}
                  <div className="mt-auto pt-4">
                    {plan.current ? (
                      <Button variant="outline" className="w-full h-10" disabled>
                        {plan.badgeText}
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10"
                        variant={plan.recommended ? "default" : "outline"}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        {plan.name === "Enterprise" ? (
                          <>{plan.badgeText}</>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            {plan.badgeText}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage Stats */}
        <div className="forensic-panel mt-6">
          <div className="forensic-panel-header">Current Usage</div>
          <div className="forensic-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Verifications This Month
                </p>
                <p className="text-2xl font-bold text-foreground">
                  0 <span className="text-sm font-normal text-muted-foreground">/ 5</span>
                </p>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div className="w-0 h-full bg-forensic-cyan rounded-full" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Storage Used
                </p>
                <p className="text-2xl font-bold text-foreground">
                  0 MB <span className="text-sm font-normal text-muted-foreground">/ 100 MB</span>
                </p>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div className="w-0 h-full bg-forensic-cyan rounded-full" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  API Calls This Month
                </p>
                <p className="text-2xl font-bold text-foreground">
                  0 <span className="text-sm font-normal text-muted-foreground">/ 0</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">Enterprise only</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Billing Period Ends
                </p>
                <p className="text-2xl font-bold text-foreground">N/A</p>
                <p className="text-xs text-muted-foreground mt-2">Free plan - no billing</p>
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
                  Why doesn't Professional include API access?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Professional is designed for manual, UI-driven forensic verification. API access and automation are reserved for Enterprise customers with system-level integration needs.
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
    </ForensicLayout>
  );
}
