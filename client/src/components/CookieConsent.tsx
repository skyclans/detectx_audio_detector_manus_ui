import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "detectx_cookie_consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 pr-8">
          <p className="text-sm text-foreground font-medium mb-1">
            Cookie Notice
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to enhance your experience, analyze site usage, and assist in our verification services. 
            By clicking "Accept", you consent to the use of cookies. For more information, please read our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="text-sm"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Accept
          </Button>
        </div>
        <button
          onClick={handleDecline}
          className="absolute top-4 right-4 md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close cookie banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
