import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";
import { enqueueReport } from "@/lib/jobs/queue";
import { logBusinessAudit } from "@/lib/business-audit";

const VALID_SLUGS = [
  "vessel-utilization",
  "booking-summary",
  "revenue-by-trade-lane",
  "outstanding-ar-aging",
  "container-turnaround",
] as const;

const scheduleReportSchema = z.object({
  reportSlug: z.enum(VALID_SLUGS),
  parameters: z.record(z.string(), z.string()).default({}),
  format: z.enum(["xlsx", "csv", "pdf"]).default("xlsx"),
  schedule: z
    .string()
    .regex(/^[0-9*/,-]+\s+[0-9*/,-]+\s+[0-9*/,-]+\s+[0-9*/,-]+\s+[0-9*/,-]+$/, "Invalid cron expression")
    .optional(),
  email: z.string().email().optional(),
});

/**
 * POST /api/v1/admin-portal/schedule-report
 *
 * ERP-090: Schedule a report for background generation via BullMQ.
 * Accepts report slug, parameters, format, optional cron schedule, and email.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = scheduleReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: formatZodErrors(parsed.error),
          },
        },
        { status: 422 }
      );
    }

    const { reportSlug, parameters, format, schedule, email } = parsed.data;

    const jobType = schedule ? "scheduled-report" : "generate-report";
    const repeatOpts = schedule ? { repeat: { pattern: schedule } } : undefined;

    const job = await enqueueReport(
      jobType,
      {
        tenantId: user.tenantId,
        userId: user.id,
        reportSlug,
        parameters,
        format,
        email: email ?? null,
      },
      repeatOpts
    );

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "schedule-report",
      entityId: job.id,
      module: "admin-portal",
      newData: { reportSlug, parameters, format, schedule, email } as Record<string, unknown>,
      request,
    });

    return NextResponse.json(
      {
        data: {
          jobId: job.id,
          status: "queued",
          reportSlug,
          format,
          scheduled: !!schedule,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[schedule-report] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
