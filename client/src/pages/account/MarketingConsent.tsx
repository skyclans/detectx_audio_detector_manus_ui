/**
 * Marketing Consent — user-facing preferences page
 *
 * Lets a logged-in user opt in/out of marketing email.
 * Transactional email (account, billing, dispute responses) is always sent
 * regardless of this setting.
 *
 * Backend contract (TODO — not yet implemented):
 *   GET  /api/user/marketing-consent       → { consent: boolean }
 *   POST /api/user/marketing-consent       → body { consent: boolean } → { ok: boolean }
 *
 * Until the backend lands, the GET silently falls back to `false` and POST
 * surfaces an informative error toast.
 */

import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { ForensicLayout } from "@/components/ForensicLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, Shield, Save, AlertCircle, ArrowLeft } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

export default function MarketingConsent() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [consent, setConsent] = useState<boolean>(false);
  const [initialConsent, setInitialConsent] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchWithAuth("/api/user/marketing-consent");
      if (resp.ok) {
        const data = await resp.json();
        const c = Boolean(data?.consent);
        setConsent(c);
        setInitialConsent(c);
      } else if (resp.status === 404) {
        // Backend not yet implemented — silently default to false
        setConsent(false);
        setInitialConsent(false);
      } else {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
    } catch (err) {
      // Don't surface 404 / network as a UI error — feature degrades gracefully
      console.warn("[MarketingConsent] fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsent();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchConsent]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const resp = await fetchWithAuth("/api/user/marketing-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      setInitialConsent(consent);
      toast.success(
        consent
          ? "You're subscribed to product updates."
          : "Unsubscribed from product updates.",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const dirty = consent !== initialConsent;

  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout>
        <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
          <div className="text-lg font-semibold">Sign in required</div>
          <p className="text-sm text-muted-foreground">
            Please log in to manage your email preferences.
          </p>
          <Link href="/login">
            <a className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Log in
            </a>
          </Link>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <Link href="/settings">
            <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to settings
            </a>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Marketing preferences
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose whether to receive product updates, announcements, and
            occasional newsletters from DetectX.
            {user?.email ? (
              <span className="ml-1 font-medium">({user.email})</span>
            ) : null}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Receive product updates and announcements
            </CardTitle>
            <CardDescription>
              Major releases, AI music / voice detection updates, and
              occasional newsletters. Roughly 1-2 emails per month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
                <Switch
                  id="marketing-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(Boolean(v))}
                />
                <Label htmlFor="marketing-consent" className="cursor-pointer">
                  {consent
                    ? "Subscribed to product updates"
                    : "Not subscribed"}
                </Label>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {error}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
              <p>
                Transactional emails (account, billing, dispute responses) will
                always be sent regardless of this setting — they are required
                to operate your account.
              </p>
              <p>
                You can also unsubscribe from any marketing email directly via
                the link in the email footer.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving || !dirty}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ForensicLayout>
  );
}
