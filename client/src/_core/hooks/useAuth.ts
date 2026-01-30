import { useState, useEffect, useCallback, useMemo } from "react";

const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://emjvw2an6oynf9-8000.proxy.runpod.net";

/**
 * User interface matching RunPod /auth/me response
 */
interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  plan: string;
  usage_count: number;
  monthly_limit: number;
  remaining: number;
  usage_reset_date: string | null;
  created_at?: string;
  last_signed_in?: string;
  // Legacy compatibility fields (mapped from RunPod response)
  openId?: string;
  usageCount?: number;
  monthlyLimit?: number;
}

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Authentication hook using RunPod JWT
 * 
 * Replaces the previous tRPC-based authentication with direct
 * RunPod API calls using JWT tokens stored in localStorage.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  // Initialize user from localStorage cache
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem("detectx_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const token = localStorage.getItem("detectx_token");
  const isAuthenticated = !!user && !!token;

  /**
   * Fetch user info from RunPod /auth/me
   */
  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("detectx_token");
    
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${RUNPOD_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401) {
        // Token expired or invalid → logout
        console.warn("[Auth] Token invalid or expired");
        localStorage.removeItem("detectx_token");
        localStorage.removeItem("detectx_user");
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const userData = await res.json();
        
        // Map RunPod response to include legacy compatibility fields
        const mappedUser: User = {
          ...userData,
          openId: userData.id,
          usageCount: userData.usage_count,
          monthlyLimit: userData.monthly_limit,
        };
        
        setUser(mappedUser);
        localStorage.setItem("detectx_user", JSON.stringify(mappedUser));
        
        // Also update legacy localStorage keys for backward compatibility
        localStorage.setItem("detectx_selected_mode", userData.plan || "free");
        localStorage.setItem("detectx_usage_count", String(userData.usage_count || 0));
        localStorage.setItem("detectx_mode_limit", String(userData.monthly_limit || 5));
        localStorage.setItem("manus-runtime-user-info", JSON.stringify(mappedUser));
        
        setError(null);
      } else {
        console.error("[Auth] Failed to fetch user:", res.status);
        setError(new Error(`Failed to fetch user: ${res.status}`));
      }
    } catch (err) {
      console.error("[Auth] Error fetching user:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Logout - clear tokens and redirect to login
   */
  const logout = useCallback(() => {
    // Clear all auth-related localStorage
    localStorage.removeItem("detectx_token");
    localStorage.removeItem("detectx_user");
    localStorage.removeItem("detectx_selected_mode");
    localStorage.removeItem("detectx_mode_limit");
    localStorage.removeItem("detectx_user_id");
    localStorage.removeItem("detectx_usage_count");
    localStorage.removeItem("manus-runtime-user-info");
    
    setUser(null);
    
    // Redirect to login page
    window.location.href = "/login";
  }, []);

  /**
   * Refresh user info (call after verification to update usage count)
   */
  const refreshUser = useCallback(() => {
    return fetchUser();
  }, [fetchUser]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (isLoading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    if (window.location.pathname === "/auth/callback") return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, isLoading, user]);

  const state = useMemo(() => ({
    user,
    loading: isLoading,
    error,
    isAuthenticated,
  }), [user, isLoading, error, isAuthenticated]);

  return {
    ...state,
    refresh: refreshUser,
    refreshUser,
    logout,
  };
}
