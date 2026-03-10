import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listEventTriggers, createEventTrigger } from "@/lib/process-engine/e2e-flow-service";
import { createEventTriggerSchema } from "@/lib/process-engine/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const eventType = url.searchParams.get("eventType") ?? undefined;
    const data = await listEventTriggers(user.tenantId, eventType);

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[event-triggers] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list event triggers" } },
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

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createEventTriggerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const trigger = await createEventTrigger({
      tenantId: user.tenantId,
      ...parsed.data,
    });

    return NextResponse.json({ data: trigger }, { status: 201 });
  } catch (err) {
    console.error("[event-triggers] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create event trigger" } },
      { status: 500 }
    );
  }
}
