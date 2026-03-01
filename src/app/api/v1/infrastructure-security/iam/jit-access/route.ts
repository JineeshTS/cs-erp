import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isfJitAccessRequests } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createJitAccessSchema } from "@/lib/infrastructure-security/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:create")))
      return forbiddenResponse();

    const body = await request.json();
    const parsed = createJitAccessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const requestRef = `JIT-${Date.now()}`;

    const [created] = await db
      .insert(isfJitAccessRequests)
      .values({
        tenantId: user.tenantId,
        requestRef,
        requestedBy: user.id,
        resourceType: parsed.data.resourceType,
        resourceId: parsed.data.resourceId,
        accessLevel: parsed.data.accessLevel,
        justification: parsed.data.justification,
        status: "pending",
        expiresAt: parsed.data.expiresAt,
        notes: parsed.data.notes,
        metadata: parsed.data.metadata,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create JIT access request:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
