import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Plan from "./pages/Plan";
import ComingSoon from "./pages/ComingSoon";
import Technology from "./pages/Technology";
import Research from "./pages/Research";
import Updates from "./pages/Updates";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ModeSelection from "./pages/ModeSelection";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import HomeTest from "./pages/HomeTest";
import HistoryTest from "./pages/HistoryTest";
import { CookieConsent } from "./components/CookieConsent";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminUserDetail from "./pages/admin/UserDetail";
import AdminVerifications from "./pages/admin/Verifications";
import AdminLogs from "./pages/admin/Logs";

function Router() {
  return (
    <Switch>
      {/* Landing page (HOME) - main entry point */}
      <Route path="/" component={Landing} />
      
      {/* Verify Audio tool */}
      <Route path="/verify-audio" component={Home} />
      
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
      <Route path="/blog" component={ComingSoon} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/select-mode" component={ModeSelection} />
      
      {/* Legal pages */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      
      {/* Test environment (port 8001) */}
      <Route path="/test" component={HomeTest} />
      <Route path="/test/verify-audio" component={HomeTest} />
      <Route path="/test/history" component={HistoryTest} />
      
      {/* Admin pages (restricted access) */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/users/:id" component={AdminUserDetail} />
      <Route path="/admin/verifications" component={AdminVerifications} />
      <Route path="/admin/logs" component={AdminLogs} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
