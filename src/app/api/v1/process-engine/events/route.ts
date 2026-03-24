import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { logEvent, listEventLog } from "@/lib/process-engine/service";
import { logEventSchema } from "@/lib/process-engine/validation";
import { formatZodErrors } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const result = await listEventLog(user.tenantId, {
      eventType: url.searchParams.get("eventType") ?? undefined,
      entityType: url.searchParams.get("entityType") ?? undefined,
      entityId: url.searchParams.get("entityId") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 50),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[process-engine/events] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list events" } },
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
    const parsed = logEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const entry = await logEvent({
      tenantId: user.tenantId,
      userId: user.id,
      ...parsed.data,
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (err) {
    console.error("[process-engine/events] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to log event" } },
      { status: 500 }
    );
  }
}
