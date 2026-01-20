export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Generate OAuth login URL at runtime.
 * 
 * IMPORTANT: Always forces account selection (prompt=select_account) to:
 * 1. Allow users to choose which account to sign in with
 * 2. Prevent auto-login with browser's cached credentials
 * 3. Provide standard SaaS login experience
 */
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  
  // ALWAYS force account selection for standard SaaS login experience
  // This ensures users can choose which account to sign in with
  url.searchParams.set("prompt", "select_account");

  return url.toString();
};

// Alias for backward compatibility
export const getLoginUrlWithAccountSelection = () => getLoginUrl();
