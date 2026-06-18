import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Clock,
  CreditCard,
  LogOut,
  Settings,
  User,
  AudioLines,
  Mic,
  Sun,
  Moon,
  Home,
  Menu,
  X,
  Zap,
  Sparkles,
  Layers,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { CreditBalanceSidebar } from "./CreditBalanceSidebar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  comingSoon?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Audio",
    items: [
      { label: "Single", href: "/verify-audio", icon: <AudioLines className="w-4 h-4" /> },
      { label: "Batch", href: "/batch-verify", icon: <Layers className="w-4 h-4" /> },
    ],
  },
  {
    title: "Voice",
    items: [
      { label: "Verify", href: "/verify-voice", icon: <Mic className="w-4 h-4" />, badge: "Beta" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "History", href: "/history", icon: <Clock className="w-4 h-4" /> },
      { label: "Plan", href: "/plan", icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
];

/**
 * Plan & Usage Display Component
 * Shows current plan and remaining usage in sidebar
 */
function PlanUsageDisplay() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [usageCount, setUsageCount] = useState(0);
  const [modeLimit, setModeLimit] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  useEffect(() => {
    // PRIORITY: Use DB data for authenticated users (single source of truth)
    if (isAuthenticated && user) {
      const dbPlan = (user as any).plan as string | undefined;
      const dbMonthlyLimit = (user as any).monthlyLimit as number | undefined;
      const dbUsageCount = (user as any).usageCount as number | undefined;

      if (dbPlan) {
        setSelectedMode(dbPlan);
        setModeLimit(dbPlan === "enterprise" ? null : (dbMonthlyLimit ?? 3));
        setUsageCount(dbUsageCount ?? 0);

        // Sync to localStorage as cache (not source of truth)
        localStorage.setItem("detectx_selected_mode", dbPlan);
        localStorage.setItem("detectx_mode_limit", dbPlan === "enterprise" ? "unlimited" : String(dbMonthlyLimit ?? 3));
        localStorage.setItem("detectx_usage_count", String(dbUsageCount ?? 0));
        return;
      }
    }
    
    // Fallback to localStorage only for non-authenticated users
    const mode = localStorage.getItem("detectx_selected_mode");
    const limit = localStorage.getItem("detectx_mode_limit");
    
    if (mode) {
      setSelectedMode(mode);
      if (limit === "unlimited" || mode === "enterprise") {
        setModeLimit(null); // Unlimited
      } else {
        setModeLimit(parseInt(limit || "3", 10));
      }
    } else {
      // Default to free plan if no mode selected
      setModeLimit(3);
    }
    
    // Get usage count from localStorage for non-authenticated users
    const storedUsage = localStorage.getItem("detectx_usage_count");
    if (storedUsage) {
      setUsageCount(parseInt(storedUsage, 10));
    }
  }, [isAuthenticated, user]);

  // Determine plan name
  const getPlanName = () => {
    if (!selectedMode || selectedMode === "free") return "Free";
    if (selectedMode === "pro") return "Pro";
    if (selectedMode === "studio") return "Studio";
    if (selectedMode === "enterprise") return "Enterprise";
    return "Free";
  };

  // Calculate remaining
  const remaining = modeLimit !== null ? Math.max(0, modeLimit - usageCount) : null;
  const isPaid = selectedMode === "pro" || selectedMode === "studio" || selectedMode === "enterprise";

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-3 py-3 border-t border-sidebar-border">
      <div 
        className="p-3 rounded-lg bg-sidebar-accent/30 cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
        onClick={() => setLocation("/plan")}
      >
        {/* Plan Badge */}
        <div className="flex items-center gap-2 mb-2">
          {isPaid ? (
            <Zap className="w-4 h-4 text-forensic-cyan" />
          ) : (
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          )}
          <span className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isPaid ? "text-forensic-cyan" : "text-muted-foreground"
          )}>
            {getPlanName()}
          </span>
        </div>

        {/* Usage Display */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className={cn(
              "font-medium",
              remaining === 0 ? "text-red-500" : "text-foreground"
            )}>
              {modeLimit === null ? "Unlimited" : `${remaining} / ${modeLimit}`}
            </span>
          </div>
          
          {/* Progress bar */}
          {modeLimit !== null && (
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  remaining === 0 ? "bg-red-500" : "bg-forensic-cyan"
                )}
                style={{ width: `${Math.max(0, ((remaining ?? 0) / modeLimit) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Upgrade prompt when exhausted */}
        {remaining === 0 && !isPaid && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <span className="text-[10px] text-forensic-cyan font-medium">
              Upgrade to Pro →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItemComponent({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  if (item.comingSoon) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
          "text-muted-foreground/50 cursor-not-allowed"
        )}
      >
        {item.icon}
        <span>{item.label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider opacity-50">Soon</span>
      </div>
    );
  }

  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-primary font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-forensic-cyan/15 text-forensic-cyan">
            {item.badge}
          </span>
        )}
        {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
      </div>
    </Link>
  );
}

/**
 * SIDEBAR BRAND HEIGHT: h-20 (80px)
 * Header must EXACTLY match this height for visual alignment
 */
const BRAND_HEIGHT = "h-20"; // 80px - shared between sidebar brand and header

function Sidebar({ isMobileOpen, onMobileClose }: { isMobileOpen: boolean; onMobileClose: () => void }) {
  const [location, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50",
        "transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand - Logo as primary brand element */}
        <div className={cn(BRAND_HEIGHT, "flex items-center justify-between px-6 border-b border-sidebar-border")}>
          <Link href="/" className="flex items-center gap-4" onClick={onMobileClose}>
            <img
              src="/detectx-logo.png"
              alt="DetectX"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-semibold text-sidebar-foreground tracking-tight">DetectX</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="px-3 pt-4">
          <Link href="/" onClick={onMobileClose}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section, idx) => (
            <div key={section.title} className={cn(idx > 0 && "mt-6")}>
              <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItemComponent
                    key={item.label}
                    item={item}
                    isActive={location === item.href}
                    onClick={onMobileClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Credit / Plan / Trial section (Phase 5) */}
        <CreditBalanceSidebar />
        {/* Legacy fallback widget — kept for safe rollback. Comment out to disable. */}
        {/* <PlanUsageDisplay /> */}

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          {loading ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : user ? (
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
              onClick={() => { setLocation("/settings"); onMobileClose(); }}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email || "No email"}
                </div>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

/**
 * HEADER LAYOUT OVERRIDE:
 * - Height EXACTLY matches sidebar brand area (h-20 = 80px)
 * - Navigation font size increased for improved readability
 * - Improved contrast for high visibility
 * - Navigation feels clear, deliberate, and professional
 */
function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const headerLinks = [
    { label: "Technology", href: "/technology" },
    { label: "Research", href: "/research" },
    { label: "Pricing", href: "/plan" },
    { label: "Updates", href: "/updates" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className={cn(
      BRAND_HEIGHT, // EXACTLY match sidebar brand height
      "bg-sidebar border-b border-border flex items-center justify-between px-4 lg:px-8"
    )}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors lg:hidden mr-3"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <h1 className="text-lg lg:text-xl font-semibold text-foreground tracking-tight truncate">{title}</h1>
        <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>
      </div>
      <nav className="hidden lg:flex items-center gap-8">
        {headerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

interface ForensicLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function ForensicLayout({
  children,
  title = "Audio Verification",
  subtitle = "Structural signal inspection",
}: ForensicLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="lg:ml-64">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
