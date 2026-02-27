import { NextRequest, NextResponse } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/",
  "/api/health",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and public paths
  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for access token
  const accessToken =
    request.cookies.get("cs_access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    // API routes: return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        {
          status: 401,
          headers: { "WWW-Authenticate": 'Bearer realm="cs-erp"' },
        }
      );
    }

    // Page routes: redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For middleware, we do a lightweight check — just verify the token is present.
  // Full JWT verification happens in the API route handlers (jose needs async crypto
  // which works in middleware but keeping it simple here — the /api/auth/me route
  // does full verification).
  //
  // In production the access token is a short-lived RS256 JWT (15 min).
  // The middleware acts as a first gate; individual routes do full verification.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
