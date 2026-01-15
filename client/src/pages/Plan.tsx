/**
 * Plan Page - Subscription Management
 * 
 * v1.1 BETA CONFIGURATION:
 * 
 * FREE ($0/forever):
 * - 5 verifications per month
 * - Basic CR-G analysis
 * - PDF & JSON export
 * - Standard processing queue
 * - Community support
 * - NO API access, NO batch processing, NO priority queue
 * 
 * PROFESSIONAL (Beta) - NO PRICE DISPLAYED:
 * - Currently available as beta version
 * - Up to 30 verifications
 * - Full AI signal evidence analysis
 * - Same detection engine as the upcoming full release
 * - NO price, NO subscription, NO payment
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
 * 
 * IMPORTANT: Plan section is visible to ALL users (login NOT required)
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, X, Zap, Building2, Sparkles, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

// v1.1 BETA pricing structure - Professional has NO price
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
    name: "Professional",
    // NO price - Beta version
    isBeta: true,
    icon: Zap,
    positioning: "Currently available as a beta version.",
    features: [
      "Up to 30 verifications",
      "Full AI signal evidence analysis",
      "Same detection engine as the upcoming full release",
    ],
    restrictions: [
      "NO API access",
      "NO automation",
      "NO webhooks",
    ],
    restrictionNote: "Professional is for people, not systems.",
    current: false,
    recommended: true,
    badgeText: "Get Professional",
    badgeVariant: "default" as const,
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
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use contact.submit mutation to send email notification
  const submitMutation = trpc.contact.submit.useMutation();

  const handleUpgrade = (planName: string) => {
    if (planName === "Enterprise") {
      toast.info("Contact sales@detectx.app for Enterprise pricing");
    } else if (planName === "Professional") {
      // Open email collection modal
      setEmailModalOpen(true);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        inquiryType: "professional-beta-interest",
        name: user?.name || "Anonymous User",
        email: email,
        subject: "Professional Plan Beta Interest",
        message: `User expressed interest in Professional Plan (Beta).
        
Email: ${email}
User ID: ${user?.id || "Not logged in"}
Timestamp: ${new Date().toISOString()}

This user would like to receive early access benefits and special privileges when the official version launches.`,
      });

      toast.success("Thank you! We'll notify you when the official version launches.");
      setEmailModalOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Failed to submit email:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // IMPORTANT: Plan page is visible to ALL users (login NOT required)
  // Removed authentication check - anyone can view plans

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
                  {plan.isBeta && (
                    <span className="ml-auto px-2 py-0.5 bg-forensic-amber/20 text-forensic-amber text-xs font-medium rounded">
                      Beta
                    </span>
                  )}
                </div>
                <div className="forensic-panel-content flex flex-col flex-1">
                  {/* Price - Only show for non-beta plans */}
                  {!plan.isBeta && plan.price && (
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {plan.period}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Positioning */}
                  <p className="text-xs text-muted-foreground text-center mb-4 min-h-[40px]">
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
                        {plan.name === "Professional" ? "Restrictions (MANDATORY)" : "Limitations"}
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

        {/* Usage Stats - Only show if authenticated */}
        {isAuthenticated && (
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
        )}

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
                  What is the Professional Beta?
                </h4>
                <p className="text-xs text-muted-foreground">
                  The Professional plan is currently available as a free beta. Leave your email to receive early access benefits when the official version launches.
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

      {/* Email Collection Modal for Professional Beta */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-forensic-cyan" />
              Professional Plan
              <span className="px-2 py-0.5 bg-forensic-amber/20 text-forensic-amber text-xs font-medium rounded">
                Beta
              </span>
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Professional Plan is currently available as a beta version.
              </p>
              <p>
                Leave your email address below.
              </p>
              <p>
                When the official version launches, you will receive early access benefits and special privileges.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Email address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleEmailSubmit}
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ForensicLayout>
  );
}
