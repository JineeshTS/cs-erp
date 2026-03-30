import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { scmCustomers } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";

/**
 * ERP-093: Portal customer authentication API.
 * POST — Login: validates email + password against customers table, sets portal_session cookie.
 * DELETE — Logout: clears portal_session cookie.
 */

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    // Support form-based DELETE via hidden _method field
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      if (formData.get("_method") === "DELETE") {
        return handleLogout();
      }
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find customer by email — portal password stored in metadata.portalPasswordHash
    const [customer] = await db
      .select({
        id: scmCustomers.id,
        tenantId: scmCustomers.tenantId,
        companyName: scmCustomers.companyName,
        email: scmCustomers.email,
        metadata: scmCustomers.metadata,
      })
      .from(scmCustomers)
      .where(
        and(
          eq(scmCustomers.email, email),
          isNull(scmCustomers.deletedAt)
        )
      )
      .limit(1);

    if (!customer) {
      // Timing-safe: still verify against dummy hash
      await verifyPassword(password, null);
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    const meta = customer.metadata as Record<string, unknown> | null;
    const passwordHash = (meta?.portalPasswordHash as string) ?? null;
    const valid = await verifyPassword(password, passwordHash);
    if (!valid) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Set portal_session cookie = customerId:tenantId
    const sessionValue = `${customer.id}:${customer.tenantId}`;
    const secure = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      data: {
        customerId: customer.id,
        name: customer.companyName,
      },
    });

    response.cookies.set({
      name: "portal_session",
      value: sessionValue,
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err) {
    console.error("[Portal Auth] Login error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  return handleLogout();
}

function handleLogout(): NextResponse {
  const secure = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ data: { loggedOut: true } });

  response.cookies.set({
    name: "portal_session",
    value: "",
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
