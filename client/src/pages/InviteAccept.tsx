import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { fetchWithAuth } from "@/lib/api";
import { getApiUrl } from "@/lib/api";
import { Users, Loader2, CheckCircle, XCircle, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function InviteAccept() {
  const [, params] = useRoute("/invite/:token");
  const token = params?.token || "";
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  // Fetch invite info (no auth required)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(getApiUrl(`/api/team/invite/${token}`));
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Invalid invite link");
        }
        const data = await res.json();
        setInviteInfo(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingInfo(false);
      }
    })();
  }, [token]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetchWithAuth(`/api/team/join/${token}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to join team");
      }
      setJoined(true);
      toast.success("Welcome to the team!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <img src="/detectx-logo.png" alt="DetectX" className="w-8 h-8 object-contain" />
            <span className="text-xl font-semibold tracking-tight text-foreground">DetectX</span>
          </div>
        </div>

        <div className="border border-border rounded-xl p-8 bg-card">
          {loadingInfo ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading invite...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-lg font-medium text-foreground mb-2">Invalid Invite</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">{error}</p>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                Go Home
              </Button>
            </div>
          ) : joined ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
              <h2 className="text-lg font-medium text-foreground mb-2">You're in!</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                You've joined <strong>{inviteInfo?.team_name}</strong>. You now have Studio plan access with shared verification quota.
              </p>
              <Button onClick={() => (window.location.href = "/verify-audio")}>
                Start Verifying
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-lg font-medium text-foreground mb-1">Team Invite</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                <strong>{inviteInfo?.inviter_name}</strong> invited you to join{" "}
                <strong>{inviteInfo?.team_name}</strong> on DetectX.
              </p>
              <div className="w-full p-4 rounded-lg bg-muted/30 border border-border/50 mb-6">
                <p className="text-xs text-muted-foreground text-center">
                  As a team member, you'll get Studio plan access with 1,000 verifications/month shared with the team.
                </p>
              </div>

              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : isAuthenticated ? (
                <Button className="w-full" onClick={handleJoin} disabled={joining}>
                  {joining ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Join Team
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    // Store token, redirect to login, then come back
                    localStorage.setItem("detectx_pending_invite", token);
                    window.location.href = getLoginUrl();
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in with Google to Join
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
