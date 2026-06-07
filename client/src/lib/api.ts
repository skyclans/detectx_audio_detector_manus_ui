/**
 * API Helper Functions for RunPod JWT Authentication
 * 
 * Provides common utilities for API calls with Bearer token authentication
 * and automatic 401 error handling (session expiration).
 */

const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://detectx.app";

/**
 * Get the current JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem("detectx_token");
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Get the full API URL for a given path
 */
export function getApiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${RUNPOD_API_URL}${normalizedPath}`;
}

/**
 * Handle 401 Unauthorized response
 * Clears tokens and redirects to login page
 */
function handleUnauthorized(): void {
  console.warn("[API] Session expired or invalid token");
  localStorage.removeItem("detectx_token");
  localStorage.removeItem("detectx_user");
  localStorage.removeItem("detectx_selected_mode");
  localStorage.removeItem("detectx_mode_limit");
  localStorage.removeItem("detectx_user_id");
  localStorage.removeItem("detectx_usage_count");
  localStorage.removeItem("manus-runtime-user-info");
  
  // Redirect to login with error message
  window.location.href = "/login?error=session_expired";
}

/**
 * Fetch wrapper with automatic JWT authentication and 401 handling
 * 
 * @param url - The URL to fetch (can be relative path or full URL)
 * @param options - Standard fetch options
 * @returns Promise<Response>
 * @throws Error if session expired (after redirect) or network error
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
  // Merge headers
  const headers: HeadersInit = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Determine full URL
  const fullUrl = url.startsWith("http") ? url : getApiUrl(url);

  const response = await fetch(fullUrl, { ...options, headers });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired");
  }

  return response;
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = localStorage.getItem("detectx_user");
  return !!token && !!user;
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem("detectx_token");
  localStorage.removeItem("detectx_user");
  localStorage.removeItem("detectx_selected_mode");
  localStorage.removeItem("detectx_mode_limit");
  localStorage.removeItem("detectx_user_id");
  localStorage.removeItem("detectx_usage_count");
  localStorage.removeItem("manus-runtime-user-info");
}
