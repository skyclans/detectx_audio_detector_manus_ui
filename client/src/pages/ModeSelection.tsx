/**
 * Mode Selection Page
 * 
 * Displayed after login to let users choose their verification mode:
 * - Free Mode: 5 verifications per month
 * - Pro Mode (Beta): 20 verifications per month
 * - Enterprise Mode: Redirect to Contact page
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { LogIn, Zap, Crown, Building2, Check, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

// Master emails with unlimited access
const MASTER_EMAILS = [
  "skyclans2@gmail.com",
  "ceo@detectx.app",
  "support@detectx.app",
  "coolkimy@gmail.com",
];

interface ModeOption {
  id: "free" | "pro" | "enterprise";
  name: string;
  description: string;
  limit: number | "unlimited" | "contact";
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  badge?: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: "free",
    name: "Free Mode",
    description: "Basic verification for personal use",
    limit: 5,
    icon: <Zap className="w-8 h-8" />,
    features: [
      "5 verifications per month",
      "50MB max file size",
      "Basic analysis report",
      "Standard processing speed",
    ],
    buttonText: "Start Free",
  },
  {
    id: "pro",
    name: "Pro Mode",
    description: "Enhanced verification for professionals",
    limit: 20,
    icon: <Crown className="w-8 h-8" />,
    features: [
      "20 verifications per month",
      "100MB max file size",
      "Full AI signal evidence analysis",
      "Priority processing",
    ],
    buttonText: "Start Pro",
    highlighted: true,
    badge: "BETA",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for organizations",
    limit: "contact",
    icon: <Building2 className="w-8 h-8" />,
    features: [
      "Unlimited verifications",
      "500MB max file size",
      "API access",
      "Dedicated support",
    ],
    buttonText: "Contact Sales",
  },
];

export default function ModeSelection() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is a master user
  const isMasterUser = user?.email && MASTER_EMAILS.includes(user.email);
  
  // Check if user has enterprise or master plan set by admin in DB
  const dbPlan = (user as any)?.plan as string | undefined;
  const isEnterpriseUser = dbPlan === "enterprise";
  const isMasterPlanUser = dbPlan === "master";

  // Handle mode selection
  const handleModeSelect = (mode: ModeOption) => {
    if (mode.id === "enterprise") {
      // Redirect to contact page
      setLocation("/contact");
      return;
    }

    // Check if this is a new mode selection (different from current)
    const currentMode = localStorage.getItem("detectx_selected_mode");
    const currentUserId = localStorage.getItem("detectx_user_id");
    const newUserId = user?.openId || user?.email || "anonymous";
    
    // Reset usage count if:
    // 1. User is different (new user)
    // 2. Mode is being selected for the first time
    // 3. User is switching to a different mode
    if (currentUserId !== newUserId || !currentMode || currentMode !== mode.id) {
      localStorage.setItem("detectx_usage_count", "0");
      localStorage.setItem("detectx_user_id", newUserId);
    }

    // Store selected mode in localStorage
    localStorage.setItem("detectx_selected_mode", mode.id);
    localStorage.setItem("detectx_mode_limit", mode.limit.toString());
    
    // Redirect to verify-audio page
    setLocation("/verify-audio");
  };

  // If not authenticated, show login prompt
  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout title="Select Mode" subtitle="Choose your verification plan">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Please sign in to select your verification mode and start analyzing audio files.
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

  // If user has enterprise plan set by admin, auto-redirect
  if (isEnterpriseUser) {
    // Auto-set localStorage and redirect
    const currentUserId = localStorage.getItem("detectx_user_id");
    const newUserId = user?.openId || user?.email || "anonymous";
    const dbMonthlyLimit = (user as any)?.monthlyLimit as number | undefined;
    
    if (currentUserId !== newUserId) {
      localStorage.setItem("detectx_usage_count", "0");
      localStorage.setItem("detectx_user_id", newUserId);
    }
    
    localStorage.setItem("detectx_selected_mode", "enterprise");
    localStorage.setItem("detectx_mode_limit", String(dbMonthlyLimit ?? 1000));
    
    return (
      <ForensicLayout title="Enterprise Access" subtitle="Institutional verification privileges">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-forensic-cyan/20 flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-forensic-cyan" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome, {user?.name || "Enterprise User"}
          </h2>
          <p className="text-muted-foreground mb-2">
            {user?.email}
          </p>
          <div className="px-4 py-2 bg-forensic-cyan/20 text-forensic-cyan rounded-full text-sm font-medium mb-6">
            Enterprise Access Enabled
          </div>
          <p className="text-muted-foreground mb-6 max-w-md">
            Your account has been upgraded to Enterprise by an administrator.
            You have access to extended verification limits and features.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/verify-audio")}
            className="gap-2"
          >
            Continue to Verify Audio
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </ForensicLayout>
    );
  }
  
  // If user has master plan set by admin (not email-based), auto-redirect
  if (isMasterPlanUser && !isMasterUser) {
    const currentUserId = localStorage.getItem("detectx_user_id");
    const newUserId = user?.openId || user?.email || "anonymous";
    
    if (currentUserId !== newUserId) {
      localStorage.setItem("detectx_usage_count", "0");
      localStorage.setItem("detectx_user_id", newUserId);
    }
    
    localStorage.setItem("detectx_selected_mode", "master");
    localStorage.setItem("detectx_mode_limit", "unlimited");
    
    return (
      <ForensicLayout title="Master Access" subtitle="Unlimited verification privileges">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-forensic-cyan/20 flex items-center justify-center mb-6">
            <Crown className="w-10 h-10 text-forensic-cyan" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome, {user?.name || "Master User"}
          </h2>
          <p className="text-muted-foreground mb-2">
            {user?.email}
          </p>
          <div className="px-4 py-2 bg-forensic-cyan/20 text-forensic-cyan rounded-full text-sm font-medium mb-6">
            Unlimited Access Enabled
          </div>
          <p className="text-muted-foreground mb-6 max-w-md">
            Your account has been upgraded to Master by an administrator.
            You have unlimited access to all verification features.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/verify-audio")}
            className="gap-2"
          >
            Continue to Verify Audio
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </ForensicLayout>
    );
  }

  // If master user (by email), show unlimited access message and redirect
  if (isMasterUser) {
    return (
      <ForensicLayout title="Master Access" subtitle="Unlimited verification privileges">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-forensic-cyan/20 flex items-center justify-center mb-6">
            <Crown className="w-10 h-10 text-forensic-cyan" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome, {user?.name || "Master User"}
          </h2>
          <p className="text-muted-foreground mb-2">
            {user?.email}
          </p>
          <div className="px-4 py-2 bg-forensic-cyan/20 text-forensic-cyan rounded-full text-sm font-medium mb-6">
            Unlimited Access Enabled
          </div>
          <p className="text-muted-foreground mb-6 max-w-md">
            As a master user, you have unlimited access to all verification features with no restrictions.
          </p>
          <Button
            size="lg"
            onClick={() => {
              // Check if this is a new user
              const currentUserId = localStorage.getItem("detectx_user_id");
              const newUserId = user?.openId || user?.email || "anonymous";
              
              if (currentUserId !== newUserId) {
                localStorage.setItem("detectx_usage_count", "0");
                localStorage.setItem("detectx_user_id", newUserId);
              }
              
              localStorage.setItem("detectx_selected_mode", "master");
              localStorage.setItem("detectx_mode_limit", "unlimited");
              setLocation("/verify-audio");
            }}
            className="gap-2"
          >
            Continue to Verify Audio
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout title="Select Mode" subtitle="Choose your verification plan">
      <div className="max-w-5xl mx-auto">
        {/* User info */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            Signed in as <span className="text-foreground font-medium">{user?.email}</span>
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODE_OPTIONS.map((mode) => (
            <div
              key={mode.id}
              className={`forensic-panel relative ${
                mode.highlighted ? "border-forensic-cyan" : ""
              }`}
            >
              {mode.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-forensic-cyan text-background text-xs font-bold rounded-full">
                    {mode.badge}
                  </span>
                </div>
              )}
              
              <div className="forensic-panel-content pt-6">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${
                  mode.highlighted 
                    ? "bg-forensic-cyan/20 text-forensic-cyan" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {mode.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground text-center mb-2">
                  {mode.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {mode.description}
                </p>

                {/* Limit display - full text to avoid dollar confusion */}
                <div className="text-center mb-6">
                  {mode.limit === "contact" ? (
                    <span className="text-lg font-bold text-foreground">Custom Plan</span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-foreground">{mode.limit} verifications</span>
                      <span className="text-sm text-muted-foreground">per month</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        mode.highlighted ? "text-forensic-cyan" : "text-forensic-green"
                      }`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  className={`w-full ${
                    mode.highlighted 
                      ? "bg-forensic-cyan hover:bg-forensic-cyan/90 text-background" 
                      : ""
                  }`}
                  variant={mode.highlighted ? "default" : "outline"}
                  onClick={() => handleModeSelect(mode)}
                >
                  {mode.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Beta Notice - Emphasized */}
        <div className="mt-8 p-4 bg-forensic-cyan/10 border border-forensic-cyan/30 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-forensic-cyan text-background text-xs font-bold rounded">BETA</span>
            <span className="text-sm font-medium text-forensic-cyan">Early Access Program</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All plans are currently in beta. Pro Mode features are available for free during the beta period.
            Leave your email on the Plan page to receive early access benefits when the official version launches.
          </p>
        </div>
      </div>
    </ForensicLayout>
  );
}
