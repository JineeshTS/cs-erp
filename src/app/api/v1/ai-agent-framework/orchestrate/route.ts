import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aafOrchestrationTasks } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createOrchestrationTaskSchema } from "@/lib/ai-agent-framework/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ai:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createOrchestrationTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [created] = await db.insert(aafOrchestrationTasks).values({ tenantId: user.tenantId, triggeredBy: user.id, ...parsed.data }).returning();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create orchestration task:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
