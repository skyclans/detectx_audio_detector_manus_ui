import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/CookieConsent";

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

// User-facing account pages (lazy)
const AccountMarketingConsent = lazy(
  () => import("./pages/account/MarketingConsent"),
);

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
    <Switch>
      {/* Landing page (HOME) - main entry point */}
      <Route path="/" component={Landing} />
      
      {/* Verify Audio tool */}
      <Route path="/verify-audio" component={Home} />
      <Route path="/verify-voice" component={VoiceVerify} />
      <Route path="/batch-verify" component={BatchVerify} />

      {/* Account pages */}
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/plan" component={Plan} />
      
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

      {/* Multilingual SEO landing pages */}
      <Route path="/en" component={LandingEN} />
      <Route path="/en/" component={LandingEN} />
      <Route path="/ko" component={LandingKO} />
      <Route path="/ko/" component={LandingKO} />
      <Route path="/ja" component={LandingJA} />
      <Route path="/ja/" component={LandingJA} />
      <Route path="/es" component={LandingES} />
      <Route path="/es/" component={LandingES} />
      <Route path="/de" component={LandingDE} />
      <Route path="/de/" component={LandingDE} />
      <Route path="/fr" component={LandingFR} />
      <Route path="/fr/" component={LandingFR} />
      <Route path="/pt" component={LandingPT} />
      <Route path="/pt/" component={LandingPT} />
      <Route path="/zh" component={LandingZH} />
      <Route path="/zh/" component={LandingZH} />

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

      {/* User-facing account preferences */}
      <Route path="/account/marketing-preferences" component={AccountMarketingConsent} />
      
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
