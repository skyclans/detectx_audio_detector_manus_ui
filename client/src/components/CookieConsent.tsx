import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "detectx_cookie_consent";

// Push the user's choice into Google Consent Mode v2. The default state is set
// in index.html (denied for EEA/UK/CH); this updates it once the user decides.
function updateConsent(granted: boolean) {
  const value = granted ? "granted" : "denied";
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent === "granted") {
      updateConsent(true); // re-apply on return visits
    } else if (consent === "denied") {
      updateConsent(false);
    } else {
      // No valid choice yet (includes legacy "acknowledged") — ask.
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const choose = (granted: boolean) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, granted ? "granted" : "denied");
    updateConsent(granted);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use essential cookies for authentication and security, and — only with
            your consent — analytics and advertising cookies to improve DetectX. See our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => choose(false)}
            className="text-sm"
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => choose(true)}
            className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
