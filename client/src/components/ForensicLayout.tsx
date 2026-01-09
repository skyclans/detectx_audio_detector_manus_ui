import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  AudioLines,
  ChevronRight,
  Clock,
  CreditCard,
  Image,
  LogOut,
  Settings,
  Type,
  Sparkles,
  User,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
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
      { label: "Audio", href: "/", icon: <AudioLines className="w-4 h-4" /> },
      { label: "Image", href: "/image", icon: <Image className="w-4 h-4" />, comingSoon: true },
      { label: "Text", href: "/text", icon: <Type className="w-4 h-4" />, comingSoon: true },
      { label: "Anime", href: "/anime", icon: <Sparkles className="w-4 h-4" />, comingSoon: true },
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

function Sidebar() {
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <AudioLines className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">DetectX</span>
        </div>
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

function Header({ title, subtitle }: HeaderProps) {
  const headerLinks = [
    { label: "Home", href: "#" },
    { label: "Technology", href: "#" },
    { label: "Methodology", href: "#" },
    { label: "Use Cases", href: "#" },
    { label: "Contact", href: "#" },
    { label: "About Us", href: "#" },
  ];

  return (
    <header className="h-16 bg-sidebar border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <nav className="flex items-center gap-6">
        {headerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
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
