import { NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = IS_PROD ? "cs-erp.codilla.ai" : undefined;

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
}
