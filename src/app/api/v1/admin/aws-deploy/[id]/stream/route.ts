import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { streamStackEvents } from "@/lib/admin-portal/aws-deploy-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) {
      return forbiddenResponse();
    }

    const { id } = await params;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of streamStackEvents(user.tenantId, id)) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          // Send terminal event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: "_done", status: "done", message: "Stream complete", timestamp: new Date().toISOString() })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error("SSE stream error:", err);
          const errorData = `data: ${JSON.stringify({ step: "_error", status: "error", message: "Stream failed", timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("GET /api/v1/admin/aws-deploy/[id]/stream error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
