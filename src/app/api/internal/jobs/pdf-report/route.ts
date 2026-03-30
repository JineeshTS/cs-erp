import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { timingSafeCompare } from "@/lib/tokens";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

const reportJobSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  reportSlug: z.string(),
  parameters: z.record(z.string(), z.string()).default({}),
  format: z.enum(["xlsx", "csv", "pdf"]).default("xlsx"),
  email: z.string().email().nullable().optional(),
});

/** SQL query builders per report slug */
const REPORT_QUERIES: Record<
  string,
  (tenantId: string, p: Record<string, string>) => ReturnType<typeof sql>
> = {
  "vessel-utilization": (tenantId, p) => sql`
    SELECT vessel_name, analysis_date::date::text,
           current_utilization_percent, projected_utilization_percent,
           recommended_action, status
    FROM cvm_utilization_analyses
    WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
      AND (${p.dateFrom || ""} = '' OR analysis_date >= ${p.dateFrom || "1970-01-01"}::timestamptz)
      AND (${p.dateTo || ""} = '' OR analysis_date <= ${p.dateTo || "2099-12-31"}::timestamptz)
    ORDER BY analysis_date DESC LIMIT 5000
  `,
  "booking-summary": (tenantId, p) => sql`
    SELECT booking_ref, customer_name, origin_port, destination_port,
           container_count, cargo_type, status
    FROM csp_portal_bookings
    WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
      AND (${p.dateFrom || ""} = '' OR created_at >= ${p.dateFrom || "1970-01-01"}::timestamptz)
      AND (${p.dateTo || ""} = '' OR created_at <= ${p.dateTo || "2099-12-31"}::timestamptz)
    ORDER BY created_at DESC LIMIT 5000
  `,
  "revenue-by-trade-lane": (tenantId, p) => sql`
    SELECT trade_lane, origin_port, destination_port,
           total_teu, total_revenue, revenue_per_teu, currency, status
    FROM cap_revenue_analytics
    WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
      AND (${p.dateFrom || ""} = '' OR period_from >= ${p.dateFrom || "1970-01-01"}::timestamptz)
      AND (${p.dateTo || ""} = '' OR period_to <= ${p.dateTo || "2099-12-31"}::timestamptz)
    ORDER BY total_revenue DESC NULLS LAST LIMIT 5000
  `,
  "outstanding-ar-aging": (tenantId, p) => sql`
    SELECT report_ref, report_type, report_date::date::text,
           total_receivables, current_amount, days_1_to_30, days_31_to_60,
           days_61_to_90, days_91_to_120, over_120_days, currency
    FROM arcc_aging_reports
    WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
      AND (${p.dateFrom || ""} = '' OR report_date >= ${p.dateFrom || "1970-01-01"}::timestamptz)
      AND (${p.dateTo || ""} = '' OR report_date <= ${p.dateTo || "2099-12-31"}::timestamptz)
    ORDER BY report_date DESC LIMIT 5000
  `,
  "container-turnaround": (tenantId, p) => sql`
    SELECT container_number, movement_reference, movement_type,
           vehicle_plate, gate_code, inspection_result,
           movement_timestamp::text, status
    FROM eqy_gate_movements
    WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
      AND (${p.dateFrom || ""} = '' OR movement_timestamp >= ${p.dateFrom || "1970-01-01"}::timestamptz)
      AND (${p.dateTo || ""} = '' OR movement_timestamp <= ${p.dateTo || "2099-12-31"}::timestamptz)
    ORDER BY movement_timestamp DESC NULLS LAST LIMIT 5000
  `,
};

/**
 * POST /api/internal/jobs/pdf-report
 *
 * ERP-090: Internal handler called by BullMQ worker to generate a report.
 * Auth: INTERNAL_API_KEY header.
 * Queries data based on slug + params, returns row count.
 * XLSX/PDF generation will be handled by a separate export engine.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-internal-api-key");
    if (
      !INTERNAL_API_KEY ||
      !apiKey ||
      !timingSafeCompare(apiKey, INTERNAL_API_KEY)
    ) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid internal API key" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = reportJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid job payload" } },
        { status: 422 }
      );
    }

    const { tenantId, reportSlug, parameters, format } = parsed.data;

    const queryBuilder = REPORT_QUERIES[reportSlug];
    if (!queryBuilder) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Unknown report slug: ${reportSlug}`,
          },
        },
        { status: 404 }
      );
    }

    const querySql = queryBuilder(tenantId, parameters);
    const result = await db.execute(querySql);
    const rows = Array.isArray(result) ? result : [];

    // In a full implementation, this is where we would:
    // 1. Convert rows to XLSX/CSV/PDF using a library
    // 2. Upload to S3/storage
    // 3. Optionally email the file to the user
    // For now, we just confirm the data was successfully queried.

    console.log(
      `[pdf-report] Generated ${reportSlug}: ${rows.length} rows, format=${format}, tenant=${tenantId}`
    );

    return NextResponse.json({
      data: {
        generated: true,
        format,
        rowCount: rows.length,
        reportSlug,
      },
    });
  } catch (error) {
    console.error("[pdf-report] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Report generation failed" } },
      { status: 500 }
    );
  }
}
