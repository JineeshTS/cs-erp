import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ielEdiMessages, ielEdiMessageSegments, ielEdiProcessingLogs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";
import { parseEdiSchema } from "@/lib/integration-edi-layer/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "integration:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = parseEdiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { rawContent, ediStandard, messageType } = parsed.data;
    const standard = ediStandard || "EDIFACT";
    const msgType = messageType || "CUSTOM";
    const messageRef = `EDI-${Date.now()}`;
    const startTime = Date.now();

    // Create the EDI message record with status "processing"
    const [message] = await db.insert(ielEdiMessages).values({
      tenantId: user.tenantId,
      messageRef,
      messageType: msgType,
      ediStandard: standard,
      direction: "inbound",
      senderCode: "UNKNOWN",
      receiverCode: "UNKNOWN",
      status: "processing",
      rawContent,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "parse", entityId: message?.id, module: "integration-edi-layer", newData: message as Record<string, unknown>, request });

    // Log the start of processing
    await db.insert(ielEdiProcessingLogs).values({
      tenantId: user.tenantId,
      messageId: message.id,
      logLevel: "info",
      step: "parse_start",
      message: `Started parsing ${standard} message`,
      durationMs: 0,
    });

    // Parse raw content into segments
    // For EDIFACT: split by "'" delimiter; otherwise split by newlines
    const delimiter = standard === "EDIFACT" ? "'" : "\n";
    const rawSegments = rawContent
      .split(delimiter)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const segmentRecords = rawSegments.map((raw, idx) => {
      const tag = raw.substring(0, 3).toUpperCase();
      return {
        tenantId: user.tenantId,
        messageId: message.id,
        segmentIndex: idx,
        segmentTag: tag,
        rawSegment: raw,
        segmentData: { raw, tag },
        validationStatus: "parsed" as const,
      };
    });

    if (segmentRecords.length > 0) {
      await db.insert(ielEdiMessageSegments).values(segmentRecords);
    }

    // Try to extract sender/receiver from UNB segment (EDIFACT)
    let senderCode = "UNKNOWN";
    let receiverCode = "UNKNOWN";
    if (standard === "EDIFACT") {
      const unbSegment = rawSegments.find((s) => s.startsWith("UNB"));
      if (unbSegment) {
        const parts = unbSegment.split("+");
        if (parts.length > 2) senderCode = parts[2].split(":")[0] || "UNKNOWN";
        if (parts.length > 3) receiverCode = parts[3].split(":")[0] || "UNKNOWN";
      }
    }

    // Update the message with parsed data
    const durationMs = Date.now() - startTime;
    await db.update(ielEdiMessages)
      .set({
        status: "parsed",
        senderCode,
        receiverCode,
        parsedContent: { segmentCount: segmentRecords.length, standard },
        processedAt: new Date(),
      })
      .where(and(eq(ielEdiMessages.id, message.id), eq(ielEdiMessages.tenantId, user.tenantId), isNull(ielEdiMessages.deletedAt)));

    // Log completion
    await db.insert(ielEdiProcessingLogs).values({
      tenantId: user.tenantId,
      messageId: message.id,
      logLevel: "info",
      step: "parse_complete",
      message: `Successfully parsed ${segmentRecords.length} segments`,
      durationMs,
    });

    return NextResponse.json({
      data: {
        messageId: message.id,
        segmentCount: segmentRecords.length,
        status: "parsed",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to parse EDI content:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
