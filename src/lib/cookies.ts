import { NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";
// CSERP-001 fix: Remove explicit domain — let browser use exact host origin.
// Explicit domain caused cookie accessibility issues with the double-submit CSRF pattern.
const COOKIE_DOMAIN = undefined;

interface CookieOptions {
  name: string;
  value: string;
  maxAge: number; // seconds
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const cookieBase = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
    domain: COOKIE_DOMAIN,
  };

  response.cookies.set({
    ...cookieBase,
    name: "cs_access_token",
    value: accessToken,
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set({
    ...cookieBase,
    name: "cs_refresh_token",
    value: refreshToken,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: "cs_csrf",
    value: token,
    httpOnly: false, // Must be readable by JavaScript for double-submit pattern
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: 30 * 24 * 60 * 60, // 30 days (matches refresh token)
  });
}

export function clearAuthCookies(response: NextResponse): void {
  const cookieBase = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
    domain: COOKIE_DOMAIN,
  };

  response.cookies.set({
    ...cookieBase,
    name: "cs_access_token",
    value: "",
    maxAge: 0,
  });

  response.cookies.set({
    ...cookieBase,
    name: "cs_refresh_token",
    value: "",
    maxAge: 0,
  });

  // Clear CSRF cookie (not httpOnly)
  response.cookies.set({
    name: "cs_csrf",
    value: "",
    httpOnly: false,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: 0,
  });
}
