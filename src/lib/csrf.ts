/**
 * CSRF Protection — Double-Submit Cookie Pattern
 *
 * On login/refresh: server sets a `cs_csrf` cookie (NOT httpOnly — JS-readable).
 * On mutations: client reads cookie and sends value via `X-CSRF-Token` header.
 * Server validates: header value === cookie value.
 *
 * This prevents CSRF because:
 * 1. Attacker sites cannot read cookies from our domain (SameSite + SOP)
 * 2. The token must be explicitly sent in a header (not auto-attached like cookies)
 */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const CSRF_COOKIE_NAME = "cs_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Validate the CSRF token from request header against the cookie value.
 * Returns a 403 NextResponse if validation fails, or null if valid.
 *
 * Only validates on mutation methods (POST, PUT, PATCH, DELETE).
 */
export function validateCsrfToken(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();

  // Skip CSRF check for safe/read-only methods
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return null;
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    console.error(`[CSRF] Missing — cookie: ${cookieToken ? "present" : "ABSENT"}, header: ${headerToken ? "present" : "ABSENT"}, path: ${request.nextUrl.pathname}`);
    return NextResponse.json(
      { error: { code: "CSRF_MISSING", message: `CSRF token required (cookie: ${cookieToken ? "yes" : "no"}, header: ${headerToken ? "yes" : "no"})` } },
      { status: 403 }
    );
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return NextResponse.json(
      { error: { code: "CSRF_INVALID", message: "Invalid CSRF token" } },
      { status: 403 }
    );
  }

  // Use timingSafeEqual for constant-time comparison
  const { timingSafeEqual } = require("crypto");
  const a = Buffer.from(cookieToken, "utf-8");
  const b = Buffer.from(headerToken, "utf-8");

  if (!timingSafeEqual(a, b)) {
    return NextResponse.json(
      { error: { code: "CSRF_INVALID", message: "Invalid CSRF token" } },
      { status: 403 }
    );
  }

  return null;
}
