import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { ReportParameterForm } from "./report-form";

/** Report definitions with their required parameter fields and SQL queries */
const REPORT_DEFS: Record<
  string,
  {
    title: string;
    description: string;
    params: Array<{ key: string; label: string; type: "date" | "text" }>;
    query: (tenantId: string, params: Record<string, string>) => { sql: ReturnType<typeof sql>; columns: string[] };
  }
> = {
  "vessel-utilization": {
    title: "Vessel Utilization",
    description: "Capacity usage and idle time across your fleet.",
    params: [
      { key: "dateFrom", label: "Period From", type: "date" },
      { key: "dateTo", label: "Period To", type: "date" },
      { key: "vesselName", label: "Vessel Name", type: "text" },
    ],
    query: (tenantId, p) => ({
      columns: ["Vessel", "Analysis Date", "Utilization %", "Projected %", "Recommended Action", "Status"],
      sql: sql`
        SELECT vessel_name, analysis_date::date::text,
               current_utilization_percent, projected_utilization_percent,
               recommended_action, status
        FROM cvm_utilization_analyses
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
          AND (${p.dateFrom || ""} = '' OR analysis_date >= ${p.dateFrom || "1970-01-01"}::timestamptz)
          AND (${p.dateTo || ""} = '' OR analysis_date <= ${p.dateTo || "2099-12-31"}::timestamptz)
          AND (${p.vesselName || ""} = '' OR vessel_name ILIKE '%' || ${p.vesselName || ""} || '%')
        ORDER BY analysis_date DESC
        LIMIT 200
      `,
    }),
  },
  "booking-summary": {
    title: "Booking Summary",
    description: "Bookings by status, trade lane, and customer.",
    params: [
      { key: "dateFrom", label: "Date From", type: "date" },
      { key: "dateTo", label: "Date To", type: "date" },
      { key: "customerName", label: "Customer Name", type: "text" },
    ],
    query: (tenantId, p) => ({
      columns: ["Booking Ref", "Customer", "Origin", "Destination", "Containers", "Cargo Type", "Status"],
      sql: sql`
        SELECT booking_ref, customer_name, origin_port, destination_port,
               container_count, cargo_type, status
        FROM csp_portal_bookings
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
          AND (${p.dateFrom || ""} = '' OR created_at >= ${p.dateFrom || "1970-01-01"}::timestamptz)
          AND (${p.dateTo || ""} = '' OR created_at <= ${p.dateTo || "2099-12-31"}::timestamptz)
          AND (${p.customerName || ""} = '' OR customer_name ILIKE '%' || ${p.customerName || ""} || '%')
        ORDER BY created_at DESC
        LIMIT 200
      `,
    }),
  },
  "revenue-by-trade-lane": {
    title: "Revenue by Trade Lane",
    description: "Revenue breakdown by origin-destination trade lanes.",
    params: [
      { key: "dateFrom", label: "Period From", type: "date" },
      { key: "dateTo", label: "Period To", type: "date" },
      { key: "tradeLane", label: "Trade Lane", type: "text" },
    ],
    query: (tenantId, p) => ({
      columns: ["Trade Lane", "Origin", "Destination", "Total TEU", "Total Revenue", "Revenue/TEU", "Currency", "Status"],
      sql: sql`
        SELECT trade_lane, origin_port, destination_port,
               total_teu, total_revenue, revenue_per_teu, currency, status
        FROM cap_revenue_analytics
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
          AND (${p.dateFrom || ""} = '' OR period_from >= ${p.dateFrom || "1970-01-01"}::timestamptz)
          AND (${p.dateTo || ""} = '' OR period_to <= ${p.dateTo || "2099-12-31"}::timestamptz)
          AND (${p.tradeLane || ""} = '' OR trade_lane ILIKE '%' || ${p.tradeLane || ""} || '%')
        ORDER BY total_revenue DESC NULLS LAST
        LIMIT 200
      `,
    }),
  },
  "outstanding-ar-aging": {
    title: "Outstanding AR Aging",
    description: "Accounts receivable aging buckets by customer.",
    params: [
      { key: "dateFrom", label: "Report Date From", type: "date" },
      { key: "dateTo", label: "Report Date To", type: "date" },
    ],
    query: (tenantId, p) => ({
      columns: ["Report Ref", "Type", "Report Date", "Total Receivables", "Current", "1-30d", "31-60d", "61-90d", "91-120d", "120d+", "Currency"],
      sql: sql`
        SELECT report_ref, report_type, report_date::date::text,
               total_receivables, current_amount, days_1_to_30, days_31_to_60,
               days_61_to_90, days_91_to_120, over_120_days, currency
        FROM arcc_aging_reports
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
          AND (${p.dateFrom || ""} = '' OR report_date >= ${p.dateFrom || "1970-01-01"}::timestamptz)
          AND (${p.dateTo || ""} = '' OR report_date <= ${p.dateTo || "2099-12-31"}::timestamptz)
        ORDER BY report_date DESC
        LIMIT 200
      `,
    }),
  },
  "container-turnaround": {
    title: "Container Turnaround",
    description: "Container dwell times at ports, yards, and customer premises.",
    params: [
      { key: "dateFrom", label: "Date From", type: "date" },
      { key: "dateTo", label: "Date To", type: "date" },
    ],
    query: (tenantId, p) => ({
      columns: ["Container No", "Movement Ref", "Movement Type", "Vehicle", "Gate Code", "Inspection", "Timestamp", "Status"],
      sql: sql`
        SELECT container_number, movement_reference, movement_type,
               vehicle_plate, gate_code, inspection_result,
               movement_timestamp::text, status
        FROM eqy_gate_movements
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
          AND (${p.dateFrom || ""} = '' OR movement_timestamp >= ${p.dateFrom || "1970-01-01"}::timestamptz)
          AND (${p.dateTo || ""} = '' OR movement_timestamp <= ${p.dateTo || "2099-12-31"}::timestamptz)
        ORDER BY movement_timestamp DESC NULLS LAST
        LIMIT 200
      `,
    }),
  },
};

export default async function ReportSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const { slug } = await params;
  const sp = await searchParams;
  const def = REPORT_DEFS[slug];
  if (!def) notFound();

  // Build param values from search params
  const paramValues: Record<string, string> = {};
  for (const p of def.params) {
    paramValues[p.key] = sp[p.key] ?? "";
  }

  // Only run query if at least one param is provided (user submitted the form)
  const hasParams = Object.values(paramValues).some((v) => v.length > 0);
  let rows: Record<string, unknown>[] = [];

  if (hasParams) {
    try {
      const { sql: querySql } = def.query(session.tenantId, paramValues);
      const result = await db.execute(querySql);
      rows = Array.isArray(result) ? (result as Record<string, unknown>[]) : [];
    } catch (err) {
      console.error(`[reports/${slug}] Query error:`, err);
      rows = [];
    }
  }

  const { columns } = def.query(session.tenantId, paramValues);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {def.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {def.description}
        </p>
      </div>

      <ReportParameterForm slug={slug} params={def.params} values={paramValues} />

      {hasParams && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {rows.length === 0 ? (
            <div className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
              No data found for the selected parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const vals = Object.values(row);
                    return (
                      <tr
                        key={idx}
                        className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {vals.map((v, ci) => (
                          <td
                            key={ci}
                            className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300"
                          >
                            {v == null ? (
                              <span className="text-gray-300 dark:text-gray-600">&mdash;</span>
                            ) : (
                              String(v)
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {rows.length > 0 && (
            <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {rows.length} row{rows.length !== 1 ? "s" : ""} returned (max 200)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
