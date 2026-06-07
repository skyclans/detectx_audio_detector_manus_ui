import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://detectx.app";

/**
 * OAuth Callback Page
 * 
 * Handles the redirect from RunPod after Google OAuth completion.
 * RunPod redirects to: detectx.app/auth/callback?token=<JWT>
 * 
 * This page:
 * 1. Extracts the JWT token from URL params
 * 2. Stores it in localStorage
 * 3. Fetches user info from /auth/me
 * 4. Redirects to /verify-audio
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      console.error("[Auth] OAuth error:", error);
      setStatus("error");
      setErrorMessage(error);
      // Redirect to login after showing error briefly
      setTimeout(() => {
        setLocation("/login?error=" + encodeURIComponent(error));
      }, 2000);
      return;
    }

    if (token) {
      // Store JWT in localStorage
      localStorage.setItem("detectx_token", token);
      console.log("[Auth] JWT token stored");

      // Fetch user info to cache
      fetch(`${RUNPOD_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch user: ${res.status}`);
          }
          return res.json();
        })
        .then((user) => {
          console.log("[Auth] User info fetched:", user.email);
          localStorage.setItem("detectx_user", JSON.stringify(user));
          
          // Check for pending team invite (set before login redirect from invite page)
          const pendingInvite = localStorage.getItem("detectx_pending_invite");
          if (pendingInvite) {
            localStorage.removeItem("detectx_pending_invite");
            setLocation(`/invite/${pendingInvite}`);
            return;
          }

          // Check for returnUrl in localStorage (set before login redirect)
          const returnUrl = localStorage.getItem("detectx_return_url");
          if (returnUrl && returnUrl.startsWith("/")) {
            localStorage.removeItem("detectx_return_url");
            setLocation(returnUrl);
          } else {
            setLocation("/verify-audio");
          }
        })
        .catch((err) => {
          console.error("[Auth] Failed to fetch user info:", err);
          // Token is stored, proceed anyway - useAuth will retry
          setLocation("/verify-audio");
        });
    } else {
      console.error("[Auth] No token in callback URL");
      setStatus("error");
      setErrorMessage("No authentication token received");
      setTimeout(() => {
        setLocation("/login?error=no_token");
      }, 2000);
    }
  }, [setLocation]);

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing in...</p>
      </div>
    </div>
  );
}
