/**
 * Google OAuth Implementation
 *
 * Direct Google OAuth integration without external OAuth server.
 * Uses passport-google-oauth20 for authentication.
 */

import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

// Initialize Passport with Google Strategy
export function initializeGoogleOAuth(app: Express) {
  const clientID = ENV.googleClientId;
  const clientSecret = ENV.googleClientSecret;

  if (!clientID || !clientSecret) {
    console.error("[Google OAuth] ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured!");
    return;
  }

  // Configure passport
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const userInfo = {
            openId: `google_${profile.id}`,
            name: profile.displayName || profile.name?.givenName || "User",
            email: profile.emails?.[0]?.value || null,
            loginMethod: "google",
          };
          done(null, userInfo);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.use(passport.initialize());

  console.log("[Google OAuth] Initialized successfully");
}

// Register Google OAuth routes
export function registerGoogleOAuthRoutes(app: Express) {
  // Start Google OAuth flow
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account", // Always show account selector
      session: false,
    })
  );

  // Google OAuth callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login?error=auth_failed",
      session: false,
    }),
    async (req: Request, res: Response) => {
      try {
        const userInfo = req.user as {
          openId: string;
          name: string;
          email: string | null;
          loginMethod: string;
        };

        if (!userInfo?.openId) {
          console.error("[Google OAuth] No user info received");
          return res.redirect("/login?error=no_user_info");
        }

        // Upsert user in database
        await db.upsertUser({
          openId: userInfo.openId,
          name: userInfo.name,
          email: userInfo.email,
          loginMethod: userInfo.loginMethod,
          lastSignedIn: new Date(),
        });

        // Create session token
        const sessionToken = await createSessionToken(userInfo.openId, userInfo.name);

        // Set cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        // Redirect to mode selection page
        res.redirect(302, "/select-mode");
      } catch (error) {
        console.error("[Google OAuth] Callback error:", error);
        res.redirect("/login?error=callback_failed");
      }
    }
  );
}

// Create session token (JWT)
async function createSessionToken(openId: string, name: string): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

  return new SignJWT({
    openId,
    appId: ENV.appId,
    name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secret);
}
