import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db, clearTenantRLS } from "@/lib/db";
import { users } from "@/db/schema";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, formatZodErrors } from "@/lib/validation";
import { getClientIp } from "@/lib/request";
import { sendPasswordResetEmail } from "@/lib/email";
import { createHash } from "crypto";

const GENERIC_RESPONSE = {
  data: {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  },
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Secondary rate limit by IP (prevents enumeration across emails)
    const ipRlKey = `forgot-ip:${createHash("sha256").update(ip).digest("hex")}`;
    const ipRl = await checkRateLimit(ipRlKey, 10, 60 * 60 * 1000);
    if (!ipRl.allowed) {
      // Still return generic response to not leak info
      return NextResponse.json(GENERIC_RESPONSE);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { email } = parsed.data;

    // Rate limit: 3 requests per hour per email
    const rateLimitKey = `forgot:${createHash("sha256")
      .update(email)
      .digest("hex")}`;
    const rateCheck = await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);

    if (!rateCheck.allowed) {
      // Still return generic response to not leak info
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Clear stale tenant context from pooled connection (prevents RLS filtering)
    await clearTenantRLS();

    // Find user — always return same response regardless (exclude soft-deleted)
    const [user] = await db
      .select({ id: users.id, tenantId: users.tenantId })
      .from(users)
      .where(
        and(
          eq(users.email, email),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    if (user) {
      const token = generateSecureToken();
      const tokenHash = hashToken(token);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db
        .update(users)
        .set({
          passwordResetToken: tokenHash,
          passwordResetExpires: expires,
        })
        .where(eq(users.id, user.id));

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("[forgot-password]", error);
    // Return generic response even on error
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
