import { NextResponse } from "next/server";

/**
 * CSERP-001: Cookie domain must be evaluated at RUNTIME, not compile-time.
 * Turbopack inlines compile-time constants, which caused the old domain
 * to persist in builds even after changing the source.
 * 
 * Using undefined (no explicit domain) — browser uses exact host origin.
 */
function getCookieDomain(): string | undefined {
  return undefined;
}

interface CookieOptions {
  name: string;
  value: string;
  maxAge: number;
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const IS_PROD = process.env.NODE_ENV === "production";
  const cookieBase = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
    domain: getCookieDomain(),
  };

  response.cookies.set({
    ...cookieBase,
    name: "cs_access_token",
    value: accessToken,
    maxAge: 15 * 60,
  });

  response.cookies.set({
    ...cookieBase,
    name: "cs_refresh_token",
    value: refreshToken,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  const IS_PROD = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: "cs_csrf",
    value: token,
    httpOnly: false,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    domain: getCookieDomain(),
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  const IS_PROD = process.env.NODE_ENV === "production";
  const cookieBase = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
    domain: getCookieDomain(),
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

  response.cookies.set({
    name: "cs_csrf",
    value: "",
    httpOnly: false,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
    domain: getCookieDomain(),
    maxAge: 0,
  });
}
