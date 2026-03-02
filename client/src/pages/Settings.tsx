/**
 * Settings Page
 * 
 * v1.0 FINAL:
 * - Profile section with user info
 * - Account actions (sign out)
 * - About section with version info
 * - System information panel
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { fetchWithAuth } from "@/lib/api";
import { LogIn, User, Info, Shield, Cpu, CreditCard, AlertTriangle, Gift, ArrowDown, Loader2, Pause, Play, Users, Mail, X, UserPlus, Crown } from "lucide-react";
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
  const [pausing, setPausing] = useState(false);

  // Team state
  const [teamData, setTeamData] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState("My Team");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const userPlan = (user as any)?.plan || "free";
  const isPaid = userPlan !== "free";
  const isTeamEligible = ["studio", "enterprise", "master"].includes(userPlan);
  const userTeam = (user as any)?.team;
  const isTeamOwner = teamData?.team?.role === "owner" || userTeam?.role === "owner";

  const fetchTeamData = async () => {
    if (!isTeamEligible && !userTeam) return;
    setTeamLoading(true);
    try {
      const res = await fetchWithAuth("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeamData(data);
      }
    } catch {}
    setTeamLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && (isTeamEligible || userTeam)) {
      fetchTeamData();
    }
  }, [isAuthenticated, userPlan]);

  const handleCreateTeam = async () => {
    setCreatingTeam(true);
    try {
      const res = await fetchWithAuth("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create team");
      }
      toast.success("Team created!");
      setShowCreateTeam(false);
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetchWithAuth("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send invite");
      }
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteModal(false);
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;
    try {
      const res = await fetchWithAuth(`/api/team/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to remove member");
      }
      toast.success("Member removed");
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const res = await fetchWithAuth(`/api/team/invite/${inviteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to revoke invite");
      }
      toast.success("Invite revoked");
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Leave this team? You'll revert to your personal plan.")) return;
    try {
      const res = await fetchWithAuth("/api/team/leave", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to leave team");
      }
      toast.success("You left the team");
      setTeamData(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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

  const handlePause = async () => {
    setPausing(true);
    try {
      const res = await fetchWithAuth("/api/stripe/pause-subscription", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to pause subscription");
      }
      toast.success("Subscription paused for 1 month. Billing will resume automatically.");
      setShowCancelModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to pause. Please try again.");
    } finally {
      setPausing(false);
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

        {/* Team Management */}
        {(isTeamEligible || userTeam) && (
          <div className="forensic-panel">
            <div className="forensic-panel-header">
              <Users className="w-4 h-4 mr-2 inline" />
              Team
            </div>
            <div className="forensic-panel-content">
              {teamLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : teamData?.team ? (
                <div className="space-y-4">
                  {/* Team Header */}
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Team Name
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {teamData.team.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Your Role
                    </span>
                    <span className="text-sm font-medium text-foreground capitalize flex items-center gap-1.5">
                      {teamData.team.role === "owner" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                      {teamData.team.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Seats
                    </span>
                    <span className="text-sm font-mono text-foreground">
                      {teamData.team.member_count} / {teamData.team.max_seats}
                    </span>
                  </div>

                  {/* Members List */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      Members
                    </p>
                    <div className="space-y-2">
                      {teamData.members?.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {m.role === "owner" ? (
                                <Crown className="w-4 h-4 text-amber-500" />
                              ) : (
                                <User className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-foreground">{m.name || m.email}</p>
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                          {isTeamOwner && m.role !== "owner" && (
                            <button
                              onClick={() => handleRemoveMember(m.id, m.name || m.email)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Remove member"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Invites */}
                  {teamData.pending_invites?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                        Pending Invites
                      </p>
                      <div className="space-y-2">
                        {teamData.pending_invites.map((inv: any) => (
                          <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-foreground">{inv.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Expires {new Date(inv.expires_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {isTeamOwner && (
                              <button
                                onClick={() => handleRevokeInvite(inv.id)}
                                className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {isTeamOwner ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowInviteModal(true)}
                      disabled={teamData.team.member_count >= teamData.team.max_seats}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-red-500"
                      onClick={handleLeaveTeam}
                    >
                      Leave Team
                    </Button>
                  )}
                </div>
              ) : isTeamEligible ? (
                /* No team yet — show create button */
                <div className="text-center py-4">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Your Studio plan includes up to 5 team members.
                  </p>
                  <Button onClick={() => setShowCreateTeam(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </div>
              ) : null}
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
                    © {new Date().getFullYear()} DetectX Inc. Patent pending.
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
                    onClick={handlePause}
                    disabled={pausing}
                    className="w-full p-4 rounded-lg border border-forensic-cyan/30 bg-forensic-cyan/5 hover:bg-forensic-cyan/10 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      {pausing ? (
                        <Loader2 className="w-5 h-5 text-forensic-cyan animate-spin" />
                      ) : (
                        <Pause className="w-5 h-5 text-forensic-cyan" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {pausing ? "Pausing..." : "Pause instead?"}
                        </p>
                        <p className="text-xs text-muted-foreground">Take a break — pause billing for 1 month. Resumes automatically.</p>
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

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the email address of the person you'd like to invite. They'll receive an email with a link to join your team.
            </p>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Team Modal */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Give your team a name. You can invite up to 5 members who will share your Studio plan's verification quota.
            </p>
            <Input
              type="text"
              placeholder="My Team"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateTeam(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateTeam}
                disabled={creatingTeam || !teamName.trim()}
              >
                {creatingTeam ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Create Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ForensicLayout>
  );
}
