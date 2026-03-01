import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { isfEncryptionKeys, isfKeyRotationLog } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getEncryptionKey } from "@/lib/infrastructure-security/service";
import { rotateKeySchema } from "@/lib/infrastructure-security/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:create")))
      return forbiddenResponse();

    const { id } = await params;

    const body = await request.json();
    const parsed = rotateKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const currentKey = await getEncryptionKey(id, user.tenantId);
    if (!currentKey) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Encryption key not found" } },
        { status: 404 }
      );
    }

    // Update key version and rotation timestamp
    const [updatedKey] = await db.update(isfEncryptionKeys)
      .set({ version: currentKey.version + 1, lastRotatedAt: new Date() })
      .where(and(eq(isfEncryptionKeys.id, id), eq(isfEncryptionKeys.tenantId, user.tenantId)))
      .returning();

    // Insert rotation log entry
    await db.insert(isfKeyRotationLog).values({
      tenantId: user.tenantId,
      keyId: id,
      previousVersion: currentKey.version,
      newVersion: currentKey.version + 1,
      rotationType: "manual",
      rotatedBy: user.id,
      reason: parsed.data.reason,
    });

    return NextResponse.json({ data: updatedKey });
  } catch (error) {
    console.error("Failed to rotate encryption key:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
