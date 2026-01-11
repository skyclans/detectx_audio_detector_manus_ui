import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ChevronRight,
  Clock,
  CreditCard,
  LogOut,
  Settings,
  User,
  AudioLines,
  Sun,
  Moon,
  Home,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Verify",
    items: [
      { label: "Audio", href: "/verify-audio", icon: <AudioLines className="w-4 h-4" /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "History", href: "/history", icon: <Clock className="w-4 h-4" /> },
      { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
      { label: "Plan", href: "/plan", icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
];

function NavItemComponent({ item, isActive }: { item: NavItem; isActive: boolean }) {
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
    <Link href={item.href}>
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

function Sidebar() {
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Brand - Logo as primary brand element */}
      <div className={cn(BRAND_HEIGHT, "flex items-center justify-between px-6 border-b border-sidebar-border")}>
        <Link href="/" className="flex items-center gap-4">
          <img
            src="/detectx-logo.png"
            alt="DetectX"
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-semibold text-sidebar-foreground tracking-tight">DetectX</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Back to Home Link */}
      <div className="px-3 pt-4">
        <Link href="/">
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
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

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
          <div className="flex items-center gap-3 px-3 py-2">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
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
  );
}

interface HeaderProps {
  title: string;
  subtitle: string;
}

/**
 * HEADER LAYOUT OVERRIDE:
 * - Height EXACTLY matches sidebar brand area (h-20 = 80px)
 * - Navigation font size increased for improved readability
 * - Improved contrast for high visibility
 * - Navigation feels clear, deliberate, and professional
 */
function Header({ title, subtitle }: HeaderProps) {
  const headerLinks = [
    { label: "Technology", href: "/technology" },
    { label: "Research", href: "/research" },
    { label: "Updates", href: "/updates" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className={cn(
      BRAND_HEIGHT, // EXACTLY match sidebar brand height
      "bg-sidebar border-b border-border flex items-center justify-between px-8"
    )}>
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
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
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
