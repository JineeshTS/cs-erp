import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";

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

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

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

    // Set user info on request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub as string);
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
