/**
 * Settings Page
 * 
 * v1.2 UPDATE:
 * - Profile section with user info
 * - Plan usage from RunPod API
 * - Account actions (sign out)
 * - About section with version info
 * - System information panel
 * - Master user badge
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { LogIn, User, Info, Shield, Cpu, Crown, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// Version constants - v1.2 UPDATE
const APP_VERSION = "1.2.0";
const BUILD_DATE = "2025-01-16";
const ENGINE_VERSION = "CR-G v1.0";

// Master emails with unlimited access
const MASTER_EMAILS = [
  "skyclans2@gmail.com",
  "ceo@detectx.app",
  "support@detectx.app",
  "coolkimy@gmail.com",
];

// DetectX RunPod Server URL
const DETECTX_API_URL = "https://emjvw2an6oynf9-8000.proxy.runpod.net";

interface UserSettings {
  user_id: string;
  plan_type: string;
  monthly_limit: number;
  current_usage: number;
  remaining: number;
  max_file_size_mb: number;
  notification_email: boolean;
  notification_slack: boolean;
}

export default function Settings() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Check if user is a master user
  const isMasterUser = user?.email && MASTER_EMAILS.includes(user.email);

  // Fetch user settings from RunPod
  useEffect(() => {
    if (user?.id) {
      fetchSettings(user.id.toString());
    }
  }, [user?.id]);

  const fetchSettings = async (userId: string) => {
    setLoadingSettings(true);
    try {
      const response = await fetch(`${DETECTX_API_URL}/settings/${encodeURIComponent(userId)}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoadingSettings(false);
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
        {/* Master User Badge */}
        {isMasterUser && (
          <div className="forensic-panel border-forensic-cyan">
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

        {/* Profile Section */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <User className="w-4 h-4 mr-2 inline" />
            Profile
          </div>
          <div className="forensic-panel-content">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                {isMasterUser ? (
                  <Crown className="w-8 h-8 text-forensic-cyan" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-foreground flex items-center gap-2">
                  {user?.name || "User"}
                  {isMasterUser && (
                    <Crown className="w-4 h-4 text-forensic-cyan" />
                  )}
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
                  {isMasterUser ? "Master" : (user?.role || "user")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Login Method
                </span>
                <span className="text-sm text-foreground">
                  {user?.loginMethod || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Usage Section */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <Zap className="w-4 h-4 mr-2 inline" />
            Plan & Usage
          </div>
          <div className="forensic-panel-content">
            {loadingSettings ? (
              <div className="text-center py-4 text-muted-foreground">Loading usage data...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Current Plan
                  </span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    {isMasterUser ? (
                      <>
                        Master
                        <Crown className="w-4 h-4 text-forensic-cyan" />
                      </>
                    ) : (
                      settings?.plan_type?.charAt(0).toUpperCase() + (settings?.plan_type?.slice(1) || "") || "Free"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Monthly Usage
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    {isMasterUser ? "∞" : (settings?.current_usage || 0)} / {isMasterUser ? "∞" : (settings?.monthly_limit || 10)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Remaining
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    {isMasterUser ? "∞" : (settings?.remaining ?? 10)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Max File Size
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    {isMasterUser ? "500" : (settings?.max_file_size_mb || 50)} MB
                  </span>
                </div>
                
                {/* Usage Progress Bar */}
                {!isMasterUser && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Usage this month</span>
                      <span>{Math.round(((settings?.current_usage || 0) / (settings?.monthly_limit || 10)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-forensic-cyan rounded-full transition-all" 
                        style={{ 
                          width: `${Math.min(100, ((settings?.current_usage || 0) / (settings?.monthly_limit || 10)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => (window.location.href = "/plan")}
                >
                  {isMasterUser ? "View All Plans" : "Upgrade Plan"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">
            <Shield className="w-4 h-4 mr-2 inline" />
            Account Actions
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

        {/* System Information - v1.2 UPDATE */}
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
                    © 2025 DetectX
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
    </ForensicLayout>
  );
}
