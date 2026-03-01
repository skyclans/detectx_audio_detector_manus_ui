/**
 * Settings Page
 * 
 * v1.0 FINAL:
 * - Profile section with user info
 * - Account actions (sign out)
 * - About section with version info
 * - System information panel
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { fetchWithAuth } from "@/lib/api";
import { LogIn, User, Info, Shield, Cpu, CreditCard, AlertTriangle, Gift, ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Version constants - v2.0
const APP_VERSION = "2.0.0";
const BUILD_DATE = "2026-03-02";
const ENGINE_VERSION = "CR-G v2.0 + Voice SSL v2";

const cancelReasons = [
  "Too expensive",
  "Not using it enough",
  "Found a better alternative",
  "Missing features I need",
  "Just testing, not ready yet",
  "Other",
];

export default function Settings() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<"reason" | "offer" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const userPlan = (user as any)?.plan || "free";
  const isPaid = userPlan !== "free";

  const openCancelFlow = () => {
    setCancelStep("reason");
    setSelectedReason(null);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      const res = await fetchWithAuth("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: selectedReason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to cancel subscription");
      }
      toast.success("Subscription cancelled. You'll retain access until the end of your billing period.");
      setShowCancelModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetchWithAuth("/api/stripe/create-portal-session", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to open billing portal");
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout title="Settings" subtitle="Account configuration">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sign in to access your account settings.
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
    <ForensicLayout title="Settings" subtitle="Account configuration">
      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <User className="w-4 h-4 mr-2 inline" />
            Profile
          </div>
          <div className="forensic-panel-content">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  User ID
                </span>
                <span className="text-sm font-mono text-foreground">
                  {user?.id || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Role
                </span>
                <span className="text-sm text-foreground capitalize">
                  {user?.role || "user"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Login Method
                </span>
                <span className="text-sm text-foreground">
                  Google OAuth
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        {isPaid && (
          <div className="forensic-panel">
            <div className="forensic-panel-header">
              <CreditCard className="w-4 h-4 mr-2 inline" />
              Subscription
            </div>
            <div className="forensic-panel-content space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Current Plan
                </span>
                <span className="text-sm font-medium text-forensic-cyan capitalize">
                  {userPlan}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Status
                </span>
                <span className="text-sm font-medium text-emerald-500">
                  Active
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleManageBilling}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Manage Billing
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={openCancelFlow}
                >
                  Cancel Plan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <Shield className="w-4 h-4 mr-2 inline" />
            Account
          </div>
          <div className="forensic-panel-content">
            <Button
              variant="destructive"
              onClick={() => logout()}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* System Information - v1.0 FINAL */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <Cpu className="w-4 h-4 mr-2 inline" />
            System Information
          </div>
          <div className="forensic-panel-content">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Application Version
                </span>
                <span className="text-sm font-mono text-forensic-cyan font-semibold">
                  v{APP_VERSION}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Build Date
                </span>
                <span className="text-sm font-mono text-foreground">
                  {BUILD_DATE}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Analysis Engine
                </span>
                <span className="text-sm font-mono text-foreground">
                  {ENGINE_VERSION}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Supported Formats
                </span>
                <span className="text-sm font-mono text-foreground">
                  WAV, MP3, FLAC, OGG, M4A
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <Info className="w-4 h-4 mr-2 inline" />
            About DetectX Audio
          </div>
          <div className="forensic-panel-content">
            <div className="space-y-4">
              <p className="text-sm text-foreground">
                DetectX Audio is a forensic audio verification platform for
                detecting AI-generated content through structural signal analysis.
              </p>
              
              <div className="bg-muted/20 rounded p-3 border border-border/30">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Evidence-Only Approach:</strong>{" "}
                  This system provides structural signal evidence only. It does not 
                  estimate probability, attribute authorship, or reference any specific 
                  AI model names. All verdicts are based on CR-G (Computational 
                  Reproducibility Geometry) analysis.
                </p>
              </div>

              <div className="pt-3 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    © 2026 DetectX
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    v{APP_VERSION}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Prevention Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {cancelStep === "reason" && "We're sorry to see you go"}
              {cancelStep === "offer" && "Before you go..."}
              {cancelStep === "confirm" && "Confirm cancellation"}
            </DialogTitle>
          </DialogHeader>

          {/* Step 1: Reason */}
          {cancelStep === "reason" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Help us improve — why are you cancelling?
              </p>
              <div className="space-y-2">
                {cancelReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selectedReason === reason
                        ? "border-forensic-cyan bg-forensic-cyan/10 text-foreground"
                        : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep My Plan
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-muted-foreground"
                  disabled={!selectedReason}
                  onClick={() => setCancelStep("offer")}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Retention Offer */}
          {cancelStep === "offer" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      You'll lose access to:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>- Full analysis reports & detailed metrics</li>
                      <li>- PDF export & Human Verification Certificate</li>
                      <li>- Priority processing queue</li>
                      {userPlan === "studio" && <li>- Batch processing & team accounts</li>}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedReason === "Too expensive" && (
                  <button
                    onClick={() => { setShowCancelModal(false); window.location.href = "/plan"; }}
                    className="w-full p-4 rounded-lg border border-forensic-cyan/30 bg-forensic-cyan/5 hover:bg-forensic-cyan/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowDown className="w-5 h-5 text-forensic-cyan" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Downgrade instead?</p>
                        <p className="text-xs text-muted-foreground">Switch to a lower plan and keep your features.</p>
                      </div>
                    </div>
                  </button>
                )}

                {(selectedReason === "Not using it enough" || selectedReason === "Just testing, not ready yet") && (
                  <button
                    onClick={() => { setShowCancelModal(false); toast.info("Contact support@detectx.app to pause your subscription."); }}
                    className="w-full p-4 rounded-lg border border-forensic-cyan/30 bg-forensic-cyan/5 hover:bg-forensic-cyan/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-forensic-cyan" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Pause instead?</p>
                        <p className="text-xs text-muted-foreground">Take a break — pause billing for up to 3 months.</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep My Plan
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-muted-foreground"
                  onClick={() => setCancelStep("confirm")}
                >
                  Still cancel
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Final Confirm */}
          {cancelStep === "confirm" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-foreground">
                  Your <strong className="capitalize">{userPlan}</strong> subscription will be cancelled.
                  You'll keep access until the end of your current billing period.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep My Plan
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelConfirm}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Cancel Subscription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ForensicLayout>
  );
}
