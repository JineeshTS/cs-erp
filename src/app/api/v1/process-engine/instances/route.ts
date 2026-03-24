import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listProcessInstances, createProcessInstance } from "@/lib/process-engine/service";
import { createProcessInstanceSchema } from "@/lib/process-engine/validation";
import { formatZodErrors } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const result = await listProcessInstances({
      tenantId: user.tenantId,
      status: url.searchParams.get("status") ?? undefined,
      processId: url.searchParams.get("processId") ?? undefined,
      entityType: url.searchParams.get("entityType") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 50),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[process-engine/instances] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list process instances" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createProcessInstanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const instance = await createProcessInstance({
      tenantId: user.tenantId,
      ...parsed.data,
      triggeredBy: user.id,
      slaDeadline: parsed.data.slaDeadline ? new Date(parsed.data.slaDeadline) : undefined,
    });

    return NextResponse.json({ data: instance }, { status: 201 });
  } catch (err) {
    console.error("[process-engine/instances] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create process instance" } },
      { status: 500 }
    );
  }
}
