import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { peEventTriggers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateEventTrigger, deleteEventTrigger } from "@/lib/process-engine/e2e-flow-service";
import { updateEventTriggerSchema } from "@/lib/process-engine/validation";
import { formatZodErrors } from "@/lib/validation";

// M15: Add missing GET handler for event trigger by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { id } = await params;
    const [trigger] = await db
      .select()
      .from(peEventTriggers)
      .where(
        and(
          eq(peEventTriggers.id, id),
          eq(peEventTriggers.tenantId, user.tenantId)
        )
      )
      .limit(1);

    if (!trigger) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Event trigger not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: trigger });
  } catch (err) {
    console.error("[event-triggers/[id]] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get event trigger" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateEventTriggerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const updated = await updateEventTrigger(id, user.tenantId, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Event trigger not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[event-triggers/[id]] PATCH error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update event trigger" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const deleted = await deleteEventTrigger(id, user.tenantId);
    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Event trigger not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: deleted });
  } catch (err) {
    console.error("[event-triggers/[id]] DELETE error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete event trigger" } },
      { status: 500 }
    );
  }
}
