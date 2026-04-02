import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { ielOracleSyncJobs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";
import { triggerOracleSyncSchema } from "@/lib/integration-edi-layer/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "integration:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = triggerOracleSyncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const startedAt = new Date();

    if (parsed.data.jobId) {
      // Fetch existing job and update status to "running"
      const [existing] = await db.select()
        .from(ielOracleSyncJobs)
        .where(and(
          eq(ielOracleSyncJobs.id, parsed.data.jobId),
          eq(ielOracleSyncJobs.tenantId, user.tenantId),
          isNull(ielOracleSyncJobs.deletedAt)
        ))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Oracle sync job not found" } },
          { status: 404 }
        );
      }

      await db.update(ielOracleSyncJobs)
        .set({
          status: "running",
          startedAt,
          updatedAt: startedAt,
        })
        .where(and(
          eq(ielOracleSyncJobs.id, parsed.data.jobId),
          eq(ielOracleSyncJobs.tenantId, user.tenantId),
          isNull(ielOracleSyncJobs.deletedAt)
        ));

      return NextResponse.json({
        data: {
          jobId: parsed.data.jobId,
          status: "running",
          startedAt: startedAt.toISOString(),
        },
      });
    }

    // No jobId provided — create a new job with status "running"
    const jobCode = `SYNC-${Date.now()}`;
    const syncType = parsed.data.syncType || "manual";
    const entityType = parsed.data.entityType || "all";

    const [created] = await db.insert(ielOracleSyncJobs).values({
      tenantId: user.tenantId,
      jobCode,
      syncType,
      entityType,
      status: "running",
      startedAt,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "sync", entityId: created.id, module: "integration-edi-layer", newData: created as Record<string, unknown>, request });

    return NextResponse.json({
      data: {
        jobId: created.id,
        status: "running",
        startedAt: startedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to trigger Oracle sync:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
