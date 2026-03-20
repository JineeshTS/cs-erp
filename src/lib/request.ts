import { NextRequest } from "next/server";

/**
 * Extract client IP from request headers.
 * CSERP-012: Use the LAST x-forwarded-for value (added by Caddy reverse_proxy)
 * instead of the first (which can be spoofed by the client).
 * When behind a single trusted proxy (Caddy), the last value is the real client IP.
 */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    // Last entry is added by the trusted proxy (Caddy)
    return parts[parts.length - 1] || "0.0.0.0";
  }
  return request.headers.get("x-real-ip") || "0.0.0.0";
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}
