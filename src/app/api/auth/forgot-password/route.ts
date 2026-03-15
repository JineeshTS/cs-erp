import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, formatZodErrors } from "@/lib/validation";
import { getClientIp } from "@/lib/request";
import { sendPasswordResetEmail } from "@/lib/email";
import { createHash } from "crypto";

const GENERIC_RESPONSE = {
  message:
    "If an account with that email exists, a password reset link has been sent.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodErrors(parsed.error) },
        { status: 422 }
      );
    }

    const { email } = parsed.data;
    const ip = getClientIp(request);

    // Rate limit: 3 requests per hour per email
    const rateLimitKey = `forgot:${createHash("sha256")
      .update(email)
      .digest("hex")}`;
    const rateCheck = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);

    if (!rateCheck.allowed) {
      // Still return generic response to not leak info
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Find user — always return same response regardless
    const [user] = await db
      .select({ id: users.id, tenantId: users.tenantId })
      .from(users)
      .where(eq(users.email, email))
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
