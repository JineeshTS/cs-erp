import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, isTokenBlacklisted } from "@/lib/jwt";
import { setTenantRLS } from "@/lib/db";
import type { SessionUser } from "./session";

/**
 * Extract authenticated user from request and set RLS tenant context.
 * Always verifies JWT — never trusts raw headers (they can be spoofed).
 *
 * After successful auth, calls set_config('app.tenant_id', tenantId)
 * so PostgreSQL RLS policies can enforce tenant isolation.
 */
export async function getApiUser(
  request: NextRequest
): Promise<SessionUser | null> {
  let token: string | undefined;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = request.cookies.get("cs_access_token")?.value;
  }

  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);

    // CSERP-010: Check if token was blacklisted (e.g., after logout)
    if (await isTokenBlacklisted(payload.jti)) {
      return null;
    }

    const user: SessionUser = {
      id: payload.sub,
      tenantId: payload.tid,
      email: payload.email,
      role: payload.role,
    };

    // Set PostgreSQL RLS context for this request
    await setTenantRLS(user.tenantId);

    return user;
  } catch {
    return null;
  }
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="cs-erp"' } }
  );
}

export function forbiddenResponse(
  message = "You do not have permission to perform this action"
): NextResponse {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}
