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
      
      {/* Static pages (placeholder) */}
      <Route path="/technology" component={ComingSoon} />
      <Route path="/research" component={ComingSoon} />
      <Route path="/updates" component={ComingSoon} />
      <Route path="/blog" component={ComingSoon} />
      <Route path="/about" component={ComingSoon} />
      <Route path="/contact" component={ComingSoon} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
