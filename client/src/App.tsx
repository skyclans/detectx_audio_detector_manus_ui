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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
