import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import { Sun, Moon, ArrowLeft } from "lucide-react";

/**
 * DetectX Login Page
 * 
 * Provides Google and Apple login options.
 * Currently uses Manus OAuth as the primary authentication method.
 * Google and Apple login buttons are UI placeholders for future integration.
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

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const manusLoginUrl = getLoginUrl();

  const handleGoogleLogin = () => {
    // For now, redirect to Manus OAuth which handles authentication
    // In future, this will be replaced with direct Google OAuth
    window.location.href = manusLoginUrl;
  };

  const handleAppleLogin = () => {
    // For now, redirect to Manus OAuth which handles authentication
    // In future, this will be replaced with direct Apple OAuth
    window.location.href = manusLoginUrl;
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
          {/* Login Card */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Sign in to DetectX
              </h1>
              <p className="text-sm text-muted-foreground">
                Access your verification history and account settings
              </p>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Google Login */}
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </Button>

              {/* Apple Login */}
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium flex items-center justify-center gap-3"
                onClick={handleAppleLogin}
              >
                <AppleIcon className="h-5 w-5" />
                Continue with Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Manus OAuth (Primary) */}
            <a href={manusLoginUrl} className="block">
              <Button
                className="w-full h-12 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign in with Manus Account
              </Button>
            </a>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              By signing in, you agree to our{" "}
              <Link href="/about" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/about" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Beta Notice */}
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium text-foreground">Beta Mode</span> — 
              DetectX is currently in beta. All features are free during this period.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
