import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";
import { checkMiddlewareRateLimit } from "@/lib/middleware-rate-limit";

let publicKey: CryptoKey | null = null;

async function getPublicKey(): Promise<CryptoKey> {
  if (publicKey) return publicKey;
  const pem = process.env.JWT_PUBLIC_KEY_PEM;
  if (!pem) throw new Error("JWT_PUBLIC_KEY_PEM not set");
  publicKey = await importSPKI(pem, "RS256");
  return publicKey;
}

// Public paths that don't require authentication
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/",
  "/api/health",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

const STATIC_EXT = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff2?|ttf|eot|map)$/;

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    STATIC_EXT.test(pathname)
  );
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Rate limit: 60 mutations per minute per user
const MUTATION_RATE_LIMIT = 60;
const MUTATION_RATE_WINDOW_MS = 60_000;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Extract token
  const token =
    request.cookies.get("cs_access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="cs-erp"' } }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify RS256 JWT
  try {
    const key = await getPublicKey();
    const { payload } = await jwtVerify(token, key, {
      issuer: "cs-erp",
      audience: "cs-erp",
    });

    // Validate required claims exist
    if (!payload.sub || !payload.tid || !payload.email || !payload.role) {
      throw new Error("Missing required JWT claims");
    }

    const userId = payload.sub as string;

    // Rate limit mutations (POST/PUT/PATCH/DELETE) — 60 req/min per user
    if (pathname.startsWith("/api/") && MUTATION_METHODS.has(request.method)) {
      const rlResult = checkMiddlewareRateLimit(
        `mut:${userId}`,
        MUTATION_RATE_LIMIT,
        MUTATION_RATE_WINDOW_MS
      );

      if (!rlResult.allowed) {
        return NextResponse.json(
          { error: { code: "RATE_LIMIT", message: "Too many requests. Please slow down." } },
          {
            status: 429,
            headers: {
              "Retry-After": String(rlResult.resetAt - Math.floor(Date.now() / 1000)),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(rlResult.resetAt),
            },
          }
        );
      }

      // Set user info on request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", userId);
      requestHeaders.set("x-tenant-id", payload.tid as string);
      requestHeaders.set("x-user-email", payload.email as string);
      requestHeaders.set("x-user-role", payload.role as string);

      return NextResponse.next({
        request: { headers: requestHeaders },
        headers: {
          "X-RateLimit-Remaining": String(rlResult.remaining),
          "X-RateLimit-Reset": String(rlResult.resetAt),
        },
      });
    }

    // Non-mutation requests — just set user info
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-tenant-id", payload.tid as string);
    requestHeaders.set("x-user-email", payload.email as string);
    requestHeaders.set("x-user-role", payload.role as string);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalid/expired
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
        { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="cs-erp", error="invalid_token"' } }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
