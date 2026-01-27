import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Sun, Moon, ArrowLeft, LogOut, User } from "lucide-react";

/**
 * DetectX Login Page
 * 
 * Standard SaaS login flow with:
 * - Google, Apple, and Microsoft login options (all visible from start)
 * - Account selection always enabled (prompt=select_account)
 * - Logout option for already logged-in users
 * - Terms and Privacy agreement required before login
 */

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Apple icon SVG component
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

// Microsoft icon SVG component
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
      <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
    </svg>
  );
}

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  // Terms agreement state
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const canLogin = termsAgreed && privacyAgreed;

  // Direct OAuth login handlers
  const handleGoogleLogin = () => {
    if (!canLogin) return;
    window.location.href = "/api/auth/google";
  };

  const handleAppleLogin = () => {
    if (!canLogin) return;
    // Apple OAuth - coming soon
    alert("Apple login coming soon!");
  };

  const handleMicrosoftLogin = () => {
    if (!canLogin) return;
    // Microsoft OAuth - coming soon
    alert("Microsoft login coming soon!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* Back to Home */}
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>

            {/* Logo */}
            <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
              DetectX
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Already Logged In Card */}
          {isAuthenticated && user && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/verify-audio" className="flex-1">
                  <Button className="w-full" variant="default">
                    Go to Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => logout()}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Want to use a different account? Sign out first, then sign in with another account.
              </p>
            </div>
          )}

          {/* Login Card */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {isAuthenticated ? "Switch Account" : "Sign in to DetectX"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated 
                  ? "Sign out above to switch to a different account"
                  : "Choose your preferred sign-in method"
                }
              </p>
            </div>

            {/* Terms Agreement Checkboxes */}
            {!isAuthenticated && (
              <div className="space-y-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-3">
                  Please agree to the following to continue:
                </p>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-agreement"
                    checked={termsAgreed}
                    onCheckedChange={(checked) => setTermsAgreed(checked === true)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms-agreement"
                    className="text-sm text-foreground cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      Terms of Service
                    </Link>
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy-agreement"
                    checked={privacyAgreed}
                    onCheckedChange={(checked) => setPrivacyAgreed(checked === true)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="privacy-agreement"
                    className="text-sm text-foreground cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link href="/privacy" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            )}

            {/* Login Options - All visible from start */}
            <div className="space-y-3">
              {/* Google Login - Primary option */}
              <Button
                className="w-full h-12 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
                disabled={!canLogin || isAuthenticated}
              >
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </Button>

              {/* Apple Login */}
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium flex items-center justify-center gap-3 opacity-50"
                onClick={handleAppleLogin}
                disabled={!canLogin || isAuthenticated}
              >
                <AppleIcon className="h-5 w-5" />
                Continue with Apple
                <span className="text-[10px] text-muted-foreground">(Soon)</span>
              </Button>

              {/* Microsoft Login */}
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium flex items-center justify-center gap-3 opacity-50"
                onClick={handleMicrosoftLogin}
                disabled={!canLogin || isAuthenticated}
              >
                <MicrosoftIcon className="h-5 w-5" />
                Continue with Microsoft
                <span className="text-[10px] text-muted-foreground">(Soon)</span>
              </Button>
            </div>

            {/* Helper text when checkboxes not checked */}
            {!canLogin && !isAuthenticated && (
              <p className="text-xs text-amber-500 text-center mt-4">
                Please agree to both Terms of Service and Privacy Policy to continue.
              </p>
            )}
          </div>

          {/* Beta Notice */}
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium text-foreground">Beta Mode</span> — 
              DetectX is currently in beta. All features are free during this period.
            </p>
          </div>

          {/* Account Selection Info */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400 text-center">
              <span className="font-medium">Multiple Accounts?</span> — 
              You can choose which account to sign in with. If you're already signed in with another account in your browser, you'll see an account selection screen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
