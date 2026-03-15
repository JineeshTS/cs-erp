import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ielCustomsFilings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";
import { submitCustomsFilingSchema } from "@/lib/integration-edi-layer/validation";
import { formatZodErrors } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "integration:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = submitCustomsFilingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Fetch the filing by filingId
    const [filing] = await db.select()
      .from(ielCustomsFilings)
      .where(and(
        eq(ielCustomsFilings.id, parsed.data.filingId),
        eq(ielCustomsFilings.tenantId, user.tenantId),
        isNull(ielCustomsFilings.deletedAt)
      ))
      .limit(1);

    if (!filing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customs filing not found" } },
        { status: 404 }
      );
    }

    // Verify status is "draft"
    if (filing.status !== "draft") {
      return NextResponse.json(
        { error: { code: "INVALID_STATUS", message: "Only draft filings can be submitted" } },
        { status: 409 }
      );
    }

    const submittedAt = new Date();

    // Update status to "submitted"
    await db.update(ielCustomsFilings)
      .set({
        status: "submitted",
        submittedAt,
        submittedBy: user.id,
        updatedAt: submittedAt,
      })
      .where(and(
        eq(ielCustomsFilings.id, parsed.data.filingId),
        eq(ielCustomsFilings.tenantId, user.tenantId),
        isNull(ielCustomsFilings.deletedAt)
      ));

    return NextResponse.json({
      data: {
        filingId: parsed.data.filingId,
        status: "submitted",
        submittedAt: submittedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to submit customs filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
