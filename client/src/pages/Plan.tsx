/**
 * Plan Page - Subscription Management
 * 
 * v1.0 FINAL:
 * - Updated pricing tiers: Free, Pro ($19/mo), Enterprise (Custom)
 * - Free: 10 verifications/month, basic features
 * - Pro: 200 verifications/month, all features, API access
 * - Enterprise: Unlimited, custom integrations, SLA
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Check, LogIn, Zap, Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// v1.0 FINAL pricing structure
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    description: "Perfect for individual researchers and occasional use",
    features: [
      "10 verifications per month",
      "Basic CR-G analysis",
      "PDF & JSON export",
      "Standard processing queue",
      "Community support",
    ],
    limitations: [
      "No API access",
      "No batch processing",
      "Standard queue priority",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    icon: Zap,
    description: "For professionals and teams requiring advanced features",
    features: [
      "200 verifications per month",
      "Full CR-G analysis suite",
      "All export formats (PDF, JSON, CSV, MD)",
      "Download All (ZIP bundle)",
      "Priority processing queue",
      "API access (REST)",
      "Batch processing (up to 10 files)",
      "Email support",
    ],
    limitations: [],
    current: false,
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    icon: Building2,
    description: "For organizations with high-volume or specialized needs",
    features: [
      "Unlimited verifications",
      "Custom CR-G model tuning",
      "All export formats + custom templates",
      "Dedicated processing infrastructure",
      "Full API access + webhooks",
      "Unlimited batch processing",
      "On-premise deployment option",
      "Dedicated account manager",
      "SLA guarantee (99.9% uptime)",
      "Custom integrations",
    ],
    limitations: [],
    current: false,
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
        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`forensic-panel relative ${
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
                <div className="forensic-panel-content">
                  {/* Price */}
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      /{plan.period}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground text-center mb-4 min-h-[32px]">
                    {plan.description}
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

                  {/* Limitations (for Free plan) */}
                  {plan.limitations.length > 0 && (
                    <div className="border-t border-border/30 pt-3 mb-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Limitations
                      </p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation) => (
                          <li key={limitation} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="text-muted-foreground/50">—</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.recommended ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {plan.name === "Enterprise" ? (
                        <>Contact Sales</>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </Button>
                  )}
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
                  0 <span className="text-sm font-normal text-muted-foreground">/ 10</span>
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
                <p className="text-xs text-muted-foreground mt-2">Upgrade to Pro for API access</p>
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
                  What file formats are supported?
                </h4>
                <p className="text-xs text-muted-foreground">
                  We support WAV, MP3, FLAC, OGG, and M4A formats across all plans.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Is there a file size limit?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Free: 50MB per file. Pro: 200MB per file. Enterprise: Custom limits available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
