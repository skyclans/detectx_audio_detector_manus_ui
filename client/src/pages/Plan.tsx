/**
 * Plan Page - Subscription Management
 * 
 * v1.2 PLAN CONFIGURATION (from Manual):
 * 
 * FREE ($0/forever):
 * - 10 verifications per month
 * - 50MB max file size
 * - Basic verification
 * 
 * PRO (Beta) - NO PRICE:
 * - 20 verifications per month
 * - 100MB max file size
 * - History, priority queue
 * 
 * ENTERPRISE (Contact Sales):
 * - Unlimited verifications
 * - 500MB max file size
 * - API access, custom integration
 * 
 * MASTER EMAILS (Unlimited Access):
 * - skyclans2@gmail.com
 * - ceo@detectx.app
 * - support@detectx.app
 * - coolkimy@gmail.com
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, X, Zap, Building2, Sparkles, Mail, Crown } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

// Master emails with unlimited access
const MASTER_EMAILS = [
  "skyclans2@gmail.com",
  "ceo@detectx.app",
  "support@detectx.app",
  "coolkimy@gmail.com",
];

// DetectX RunPod Server URL
const DETECTX_API_URL = "https://emjvw2an6oynf9-8000.proxy.runpod.net";

// v1.2 Plan configuration from manual
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    positioning: "Evaluation and light research use.",
    features: [
      "10 verifications per month",
      "50MB max file size",
      "Basic verification",
      "PDF & JSON export",
      "Standard processing queue",
    ],
    restrictions: [
      "No history access",
      "No priority queue",
      "No API access",
    ],
    monthlyLimit: 10,
    maxFileSize: 50,
    current: true,
    recommended: false,
    badgeText: "Current Plan",
    badgeVariant: "outline" as const,
  },
  {
    name: "Pro",
    // NO price - Beta version
    isBeta: true,
    icon: Zap,
    positioning: "Currently available as a beta version.",
    features: [
      "20 verifications per month",
      "100MB max file size",
      "Full AI signal evidence analysis",
      "Verification history",
      "Priority processing queue",
    ],
    restrictions: [
      "No API access",
      "No automation",
      "No webhooks",
    ],
    restrictionNote: "Pro is for people, not systems.",
    monthlyLimit: 20,
    maxFileSize: 100,
    current: false,
    recommended: true,
    badgeText: "Get Pro",
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
      "500MB max file size",
      "Full API access (REST)",
      "Webhooks",
      "Unlimited batch processing",
      "Dedicated processing infrastructure",
      "SLA guarantee (99.9% uptime)",
      "Custom integrations",
      "Dedicated account manager",
    ],
    restrictions: [],
    monthlyLimit: -1, // Unlimited
    maxFileSize: 500,
    current: false,
    recommended: false,
    badgeText: "Contact Sales",
    badgeVariant: "outline" as const,
  },
];

interface PlanInfo {
  plan_type: string;
  monthly_limit: number;
  current_usage: number;
  remaining: number;
  max_file_size_mb: number;
  features: string[];
}

export default function Plan() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Check if user is a master user
  const isMasterUser = user?.email && MASTER_EMAILS.includes(user.email);

  // Use contact.submit mutation to send email notification
  const submitMutation = trpc.contact.submit.useMutation();

  // Fetch user's plan info from RunPod
  useEffect(() => {
    if (user?.id) {
      fetchPlanInfo(user.id.toString());
    }
  }, [user?.id]);

  const fetchPlanInfo = async (userId: string) => {
    setLoadingPlan(true);
    try {
      const response = await fetch(`${DETECTX_API_URL}/plan/${encodeURIComponent(userId)}`);
      if (response.ok) {
        const data = await response.json();
        setPlanInfo(data);
      }
    } catch (err) {
      console.error("Failed to fetch plan info:", err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleUpgrade = (planName: string) => {
    if (planName === "Enterprise") {
      // Navigate to contact page
      window.location.href = "https://detectx.app/contact";
    } else if (planName === "Pro") {
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
        subject: "Pro Plan Beta Interest",
        message: `User expressed interest in Pro Plan (Beta).
        
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

  // Determine current plan based on planInfo
  const getCurrentPlanName = () => {
    if (isMasterUser) return "Master";
    if (!planInfo) return "Free";
    return planInfo.plan_type.charAt(0).toUpperCase() + planInfo.plan_type.slice(1);
  };

  const currentPlanName = getCurrentPlanName();

  return (
    <ForensicLayout title="Plan" subtitle="Subscription management">
      <div className="max-w-6xl">
        {/* Master Badge */}
        {isMasterUser && (
          <div className="forensic-panel mb-6 border-forensic-cyan">
            <div className="forensic-panel-content">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-forensic-cyan/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-forensic-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    Master Account
                    <span className="px-2 py-0.5 bg-forensic-cyan/20 text-forensic-cyan text-xs font-medium rounded">
                      Unlimited
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have unlimited access to all features. No restrictions apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = currentPlanName.toLowerCase() === plan.name.toLowerCase();
            return (
              <div
                key={plan.name}
                className={`forensic-panel relative flex flex-col ${
                  plan.recommended && !isMasterUser ? "ring-2 ring-forensic-cyan" : ""
                } ${isCurrentPlan && !isMasterUser ? "ring-2 ring-forensic-green" : ""}`}
              >
                {plan.recommended && !isMasterUser && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-forensic-cyan text-background text-xs font-medium rounded-full">
                    Recommended
                  </div>
                )}
                {isCurrentPlan && !isMasterUser && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-forensic-green text-background text-xs font-medium rounded-full">
                    Current Plan
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

                  {/* Restrictions */}
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
                      {plan.restrictionNote && (
                        <p className="text-[10px] text-forensic-amber mt-2 italic">
                          {plan.restrictionNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* CTA Button */}
                  <div className="mt-auto pt-4">
                    {isCurrentPlan && !isMasterUser ? (
                      <Button variant="outline" className="w-full h-10" disabled>
                        Current Plan
                      </Button>
                    ) : isMasterUser ? (
                      <Button variant="outline" className="w-full h-10" disabled>
                        Included in Master
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
              {loadingPlan ? (
                <div className="text-center py-4 text-muted-foreground">Loading usage data...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Verifications This Month
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {isMasterUser ? "∞" : (planInfo?.current_usage || 0)}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {isMasterUser ? "∞" : (planInfo?.monthly_limit || 10)}
                      </span>
                    </p>
                    <div className="w-full h-2 bg-muted rounded-full mt-2">
                      <div 
                        className="h-full bg-forensic-cyan rounded-full transition-all" 
                        style={{ 
                          width: isMasterUser ? "0%" : 
                            `${Math.min(100, ((planInfo?.current_usage || 0) / (planInfo?.monthly_limit || 10)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Max File Size
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {isMasterUser ? "500" : (planInfo?.max_file_size_mb || 50)} MB
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Per file limit</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Remaining
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {isMasterUser ? "∞" : (planInfo?.remaining ?? (10 - (planInfo?.current_usage || 0)))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Verifications left</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Plan Type
                    </p>
                    <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                      {isMasterUser ? (
                        <>
                          Master
                          <Crown className="w-5 h-5 text-forensic-cyan" />
                        </>
                      ) : (
                        currentPlanName
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isMasterUser ? "Unlimited access" : "Monthly billing"}
                    </p>
                  </div>
                </div>
              )}
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
                  What is the Pro Beta?
                </h4>
                <p className="text-xs text-muted-foreground">
                  The Pro plan is currently available as a free beta. Leave your email to receive early access benefits when the official version launches.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Why doesn't Pro include API access?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pro is designed for manual, UI-driven forensic verification. API access and automation are reserved for Enterprise customers with system-level integration needs.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  What file formats are supported?
                </h4>
                <p className="text-xs text-muted-foreground">
                  We support WAV, MP3, FLAC, OGG, AAC, and M4A formats across all plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Collection Modal for Pro Beta */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-forensic-cyan" />
              Pro Plan
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleEmailSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ForensicLayout>
  );
}
