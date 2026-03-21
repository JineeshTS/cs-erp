import { NextResponse } from "next/server";

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: "cs_access_token",
    value: accessToken,
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set({
    name: "cs_refresh_token",
    value: refreshToken,
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: "cs_csrf",
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set({ name: "cs_access_token", value: "", httpOnly: true, secure, sameSite: "strict", path: "/", maxAge: 0 });
  response.cookies.set({ name: "cs_refresh_token", value: "", httpOnly: true, secure, sameSite: "strict", path: "/", maxAge: 0 });
  response.cookies.set({ name: "cs_csrf", value: "", httpOnly: false, secure, sameSite: "strict", path: "/", maxAge: 0 });
}
