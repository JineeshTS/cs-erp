import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import type { SessionUser } from "./session";

/**
 * Extract authenticated user from request.
 * Always verifies JWT — never trusts raw headers (they can be spoofed).
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
    return {
      id: payload.sub,
      tenantId: payload.tid,
      email: payload.email,
      role: payload.role,
    };
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
