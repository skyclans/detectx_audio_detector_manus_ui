export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Get login page URL.
 *
 * With direct Google OAuth, we simply redirect to the /login page
 * which provides the login UI with Google/Apple/Microsoft options.
 */
export const getLoginUrl = () => "/login";

// Alias for backward compatibility
export const getLoginUrlWithAccountSelection = () => getLoginUrl();
