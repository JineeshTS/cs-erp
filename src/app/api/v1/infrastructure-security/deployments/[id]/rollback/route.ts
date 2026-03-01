import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { isfDeploymentConfigs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { rollbackDeploymentSchema } from "@/lib/infrastructure-security/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:edit")))
      return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = rollbackDeploymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(isfDeploymentConfigs).set({
      rollbackVersion: parsed.data.targetVersion,
      lastRollbackAt: new Date(),
      status: "deploying",
    })
      .where(and(eq(isfDeploymentConfigs.id, id), eq(isfDeploymentConfigs.tenantId, user.tenantId), isNull(isfDeploymentConfigs.deletedAt)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Deployment not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to rollback deployment:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
