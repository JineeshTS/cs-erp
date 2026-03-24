import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { ielEdiMessages, ielEdiProcessingLogs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { generateEdiSchema } from "@/lib/integration-edi-layer/validation";
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
    const parsed = generateEdiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { messageType, ediStandard, senderCode, receiverCode, data } = parsed.data;
    const standard = ediStandard || "EDIFACT";
    const messageRef = `EDI-${Date.now()}`;

    // Generate raw content representation (JSON stringified for now)
    const rawContent = JSON.stringify(data);

    // Create the outbound EDI message record
    const [message] = await db.insert(ielEdiMessages).values({
      tenantId: user.tenantId,
      messageRef,
      messageType,
      ediStandard: standard,
      direction: "outbound",
      senderCode,
      receiverCode,
      status: "generated",
      rawContent,
      parsedContent: data,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "generate", entityId: message.id, module: "integration-edi-layer", newData: message as Record<string, unknown>, request });

    // Create processing log entry
    await db.insert(ielEdiProcessingLogs).values({
      tenantId: user.tenantId,
      messageId: message.id,
      logLevel: "info",
      step: "generate_complete",
      message: `Generated outbound ${standard} ${messageType} message`,
      durationMs: 0,
    });

    return NextResponse.json({
      data: {
        messageId: message.id,
        messageRef,
        status: "generated",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to generate EDI content:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
