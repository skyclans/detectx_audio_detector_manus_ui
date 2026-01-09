import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Check, LogIn, Zap } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 verifications per month",
      "Basic metadata analysis",
      "Standard export formats",
      "Community support",
    ],
    current: true,
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    features: [
      "100 verifications per month",
      "Advanced metadata analysis",
      "All export formats",
      "Priority support",
      "API access",
      "Batch processing",
    ],
    current: false,
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: [
      "Unlimited verifications",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
      "Custom reporting",
    ],
    current: false,
  },
];

export default function Plan() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const handleUpgrade = (planName: string) => {
    toast.info(`${planName} plan upgrade coming soon`);
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
      <div className="max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`forensic-panel relative ${
                plan.recommended ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Recommended
                </div>
              )}
              <div className="forensic-panel-header">{plan.name}</div>
              <div className="forensic-panel-content">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

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
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Stats */}
        <div className="forensic-panel mt-6">
          <div className="forensic-panel-header">Current Usage</div>
          <div className="forensic-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Verifications This Month
                </p>
                <p className="text-2xl font-bold text-foreground">
                  0 <span className="text-sm font-normal text-muted-foreground">/ 5</span>
                </p>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div className="w-0 h-full bg-primary rounded-full" />
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
                  <div className="w-0 h-full bg-primary rounded-full" />
                </div>
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
      </div>
    </ForensicLayout>
  );
}
