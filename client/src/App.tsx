import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/CookieConsent";
import { useAuth } from "@/_core/hooks/useAuth";

// Core pages (eagerly loaded)
import Landing from "./pages/Landing";
import Home from "./pages/Home";

// Lazy-loaded pages
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const Plan = lazy(() => import("./pages/Plan"));
const BatchVerify = lazy(() => import("./pages/BatchVerify"));
const VoiceVerify = lazy(() => import("./pages/VoiceVerify"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const Technology = lazy(() => import("./pages/Technology"));
const Research = lazy(() => import("./pages/Research"));
const Updates = lazy(() => import("./pages/Updates"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ModeSelection = lazy(() => import("./pages/ModeSelection"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
const HomeTest = lazy(() => import("./pages/HomeTest"));
const HistoryTest = lazy(() => import("./pages/HistoryTest"));
const PreviewTier4 = lazy(() => import("./pages/PreviewTier4"));
const VerifyAudioV2 = lazy(() => import("./pages/VerifyAudioV2")); // verify-audio 대공사 미리보기

// Forensic Report custom-quote flow (Phase 5)
const ForensicRequest = lazy(() => import("./pages/ForensicRequest"));
const ForensicThankYou = lazy(() => import("./pages/ForensicThankYou"));
const MyForensicRequests = lazy(() => import("./pages/MyForensicRequests"));

// SEO landing pages (lazy)
const LandingEN = lazy(() => import("./pages/LandingEN"));
const LandingKO = lazy(() => import("./pages/LandingKO"));
const LandingJA = lazy(() => import("./pages/LandingJA"));
const LandingES = lazy(() => import("./pages/LandingES"));
const LandingDE = lazy(() => import("./pages/LandingDE"));
const LandingFR = lazy(() => import("./pages/LandingFR"));
const LandingPT = lazy(() => import("./pages/LandingPT"));
const LandingZH = lazy(() => import("./pages/LandingZH"));
const VsACRCloud = lazy(() => import("./pages/VsACRCloud"));
const VsResemble = lazy(() => import("./pages/VsResemble"));
const BlogHowToDetect = lazy(() => import("./pages/BlogHowToDetect"));

// Admin pages (lazy)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminUserDetail = lazy(() => import("./pages/admin/UserDetail"));
const AdminVerifications = lazy(() => import("./pages/admin/Verifications"));
const AdminVerificationDetail = lazy(() => import("./pages/admin/VerificationDetail"));
const AdminDisputes = lazy(() => import("./pages/admin/Disputes"));
const AdminLogs = lazy(() => import("./pages/admin/Logs"));
const AdminEmailCompose = lazy(() => import("./pages/admin/EmailCompose"));
const AdminEmailCampaigns = lazy(() => import("./pages/admin/EmailCampaigns"));
const AdminEmailCampaignDetail = lazy(
  () => import("./pages/admin/EmailCampaignDetail"),
);
const AdminForensicRequests = lazy(
  () => import("./pages/admin/ForensicRequests"),
);
const AdminForensicRequestDetail = lazy(
  () => import("./pages/admin/ForensicRequestDetail"),
);

// User-facing account pages (lazy)
const AccountMarketingConsent = lazy(
  () => import("./pages/account/MarketingConsent"),
);

// This was written for a production where nginx answers "/" with the WAISM
// static page and the SPA only ever reaches this route through in-app
// navigation, in which case forcing a full load hands the request back to the
// server. nginx does not do that: "/" returns this bundle's own index.html.
//
// So the redirect lands on the route that fires the redirect. Every load of the
// homepage replaced itself with the homepage, forever — headers and JS arrived
// fine and the document never finished, which is why the server looked healthy
// from every angle while the page spun. /verify-audio and /admin were untouched
// because they mount their own components.
//
// Kept for the locale roots below, where the premise does hold: /ko/ and the
// rest are prerendered SEO shells, and bouncing a real visitor from one of them
// to "/" now terminates at the landing page.
function LocaleRootRedirect() {
  useEffect(() => {
    // Skip on the prerender/static server (localhost) so the prerendered shell
    // keeps whatever the crawler is meant to see.
    const h = typeof window !== "undefined" ? window.location.hostname : "";
    if (h && h !== "localhost" && h !== "127.0.0.1") {
      window.location.replace("/");
    }
  }, []);
  return null;
}

// Pricing/Plan page is master-account-only (2026-07-26). Non-master (and logged-out)
// visitors are redirected home so pricing/billing stays hidden. Master accounts
// (skyclans2@gmail.com, ceo@detectx.app — plan="master") keep full access + Stripe.
function PlanGuard() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // wait for auth to resolve before deciding
  const isMaster = (user as any)?.plan === "master";
  if (!isMaster) return <Redirect to="/" />;
  return <Plan />;
}

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
    <Switch>
      {/* HOME — the landing page. Must render something: nginx answers "/" with
          this bundle, so a redirect here only reloads into itself. */}
      <Route path="/" component={Landing} />
      
      {/* Verify Audio tool */}
      <Route path="/verify-audio" component={Home} />
      <Route path="/verify-audio-v2" component={VerifyAudioV2} />
      <Route path="/verify-voice" component={VoiceVerify} />
      <Route path="/batch-verify" component={BatchVerify} />

      {/* Account pages */}
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/plan" component={PlanGuard} />
      
      {/* Coming soon modalities */}
      <Route path="/image" component={ComingSoon} />
      <Route path="/text" component={ComingSoon} />
      <Route path="/anime" component={ComingSoon} />
      
      {/* Static pages */}
      <Route path="/technology" component={Technology} />
      <Route path="/research" component={Research} />
      <Route path="/updates" component={Updates} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/select-mode" component={ModeSelection} />
      
      {/* Team invite */}
      <Route path="/invite/:token" component={InviteAccept} />

      {/* Locale roots — served as WAISM by nginx; redirect any client-side nav */}
      <Route path="/en" component={LocaleRootRedirect} />
      <Route path="/en/" component={LocaleRootRedirect} />
      <Route path="/ko" component={LocaleRootRedirect} />
      <Route path="/ko/" component={LocaleRootRedirect} />
      <Route path="/ja" component={LocaleRootRedirect} />
      <Route path="/ja/" component={LocaleRootRedirect} />
      <Route path="/es" component={LocaleRootRedirect} />
      <Route path="/es/" component={LocaleRootRedirect} />
      <Route path="/de" component={LocaleRootRedirect} />
      <Route path="/de/" component={LocaleRootRedirect} />
      <Route path="/fr" component={LocaleRootRedirect} />
      <Route path="/fr/" component={LocaleRootRedirect} />
      <Route path="/pt" component={LocaleRootRedirect} />
      <Route path="/pt/" component={LocaleRootRedirect} />
      <Route path="/zh" component={LocaleRootRedirect} />
      <Route path="/zh/" component={LocaleRootRedirect} />

      {/* Comparison pages */}
      <Route path="/vs/acrcloud" component={VsACRCloud} />
      <Route path="/vs/resemble-ai" component={VsResemble} />

      {/* Blog pages */}
      <Route path="/blog/how-to-detect-ai-generated-music" component={BlogHowToDetect} />

      {/* Legal pages */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      
      {/* Test environment (port 8001) */}
      <Route path="/test" component={HomeTest} />
      <Route path="/test/verify-audio" component={HomeTest} />
      <Route path="/test/history" component={HistoryTest} />

      {/* UI preview (no auth, mock data) */}
      <Route path="/preview" component={PreviewTier4} />
      
      {/* Admin pages (restricted access) */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/users/:id" component={AdminUserDetail} />
      <Route path="/admin/verifications" component={AdminVerifications} />
      <Route path="/admin/verifications/:id" component={AdminVerificationDetail} />
      <Route path="/admin/disputes" component={AdminDisputes} />
      <Route path="/admin/logs" component={AdminLogs} />
      <Route path="/admin/email/compose" component={AdminEmailCompose} />
      <Route path="/admin/email/campaigns" component={AdminEmailCampaigns} />
      <Route path="/admin/email/campaigns/:id" component={AdminEmailCampaignDetail} />

      {/* Admin: Forensic Requests (Phase 5) */}
      <Route path="/admin/forensic-requests" component={AdminForensicRequests} />
      <Route path="/admin/forensic-requests/:id" component={AdminForensicRequestDetail} />

      {/* User-facing account preferences */}
      <Route path="/account/marketing-preferences" component={AccountMarketingConsent} />

      {/* Forensic Report custom-quote flow (Phase 5) */}
      <Route path="/forensic/request" component={ForensicRequest} />
      <Route path="/forensic/thank-you" component={ForensicThankYou} />
      <Route path="/forensic/requests" component={MyForensicRequests} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark" switchable={true}>
          <TooltipProvider>
            <Toaster />
            <Router />
            <CookieConsent />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
