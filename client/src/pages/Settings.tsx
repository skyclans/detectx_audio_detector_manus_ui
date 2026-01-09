import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { LogIn, Settings as SettingsIcon, User } from "lucide-react";

export default function Settings() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

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
          <div className="forensic-panel-header">Profile</div>
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
                  {user?.loginMethod || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">Account Actions</div>
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

        {/* About */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">About</div>
          <div className="forensic-panel-content">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Application
                </span>
                <span className="text-sm text-foreground">DetectX Audio</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Version
                </span>
                <span className="text-sm font-mono text-foreground">1.0.0</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              DetectX Audio is a forensic audio verification platform for
              detecting AI-generated content through structural signal analysis.
            </p>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
