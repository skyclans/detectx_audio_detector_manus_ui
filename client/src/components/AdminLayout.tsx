import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Settings,
  ArrowLeft,
  Shield,
  ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatus {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading: isAuthLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Check admin status from server
  useEffect(() => {
    async function checkAdminStatus() {
      if (!isAuthenticated) {
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const response = await fetchWithAuth("/api/admin/check-status");
        if (response.ok) {
          const data: AdminStatus = await response.json();
          setAdminStatus(data);
        } else {
          setAdminStatus({ isAdmin: false, isSuperAdmin: false });
        }
      } catch (error) {
        console.error("[AdminLayout] Failed to check admin status:", error);
        setAdminStatus({ isAdmin: false, isSuperAdmin: false });
      } finally {
        setIsCheckingAdmin(false);
      }
    }

    if (!isAuthLoading) {
      checkAdminStatus();
    }
  }, [isAuthenticated, isAuthLoading]);

  const isLoading = isAuthLoading || isCheckingAdmin;
  const isAdmin = adminStatus?.isAdmin ?? false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access the admin panel.
          </p>
          <Link href="/login">
            <a className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Log In
            </a>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin panel.
            <br />
            <span className="text-sm">Logged in as: {user.email}</span>
          </p>
          <Link href="/">
            <a className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/verifications", icon: FileCheck, label: "Verifications" },
    { href: "/admin/logs", icon: ScrollText, label: "Activity Logs" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Site</span>
              </a>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">DetectX Admin</span>
              {adminStatus?.isSuperAdmin && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border min-h-[calc(100vh-4rem)] bg-card">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/admin" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Export admin status hook for use in child components
export function useAdminStatus() {
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetchWithAuth("/api/admin/check-status");
        if (response.ok) {
          const data: AdminStatus = await response.json();
          setAdminStatus(data);
        } else {
          setAdminStatus({ isAdmin: false, isSuperAdmin: false });
        }
      } catch (error) {
        setAdminStatus({ isAdmin: false, isSuperAdmin: false });
      } finally {
        setIsLoading(false);
      }
    }
    checkStatus();
  }, []);

  return { adminStatus, isLoading, isSuperAdmin: adminStatus?.isSuperAdmin ?? false };
}
