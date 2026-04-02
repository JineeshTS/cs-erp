import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSegmentReport } from "@/lib/general-ledger-financial-reporting/service";
import { GlfrForm } from "@/components/general-ledger-financial-reporting/glfr-form";
import type { FieldConfig } from "@/components/general-ledger-financial-reporting/glfr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditSegmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:edit")))
    redirect("/general-ledger-financial-reporting/segment-reports");

  const currencyOpts = await getCurrencyOptions();

  const SEGMENT_REPORT_FIELDS: FieldConfig[] = [
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { value: "entity", label: "Entity" },
        { value: "trade_lane", label: "Trade Lane" },
        { value: "geography", label: "Geography" },
        { value: "business_unit", label: "Business Unit" },
        { value: "product_line", label: "Product Line" },
      ],
    },
    { name: "segmentName", label: "Segment Name", type: "text" },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    { name: "fiscalYear", label: "Fiscal Year", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "revenue", label: "Revenue", type: "text" },
    { name: "costOfRevenue", label: "Cost of Revenue", type: "text" },
    { name: "grossProfit", label: "Gross Profit", type: "text" },
    { name: "operatingExpenses", label: "Operating Expenses", type: "text" },
    { name: "operatingIncome", label: "Operating Income", type: "text" },
    { name: "segmentAssets", label: "Segment Assets", type: "text" },
    { name: "segmentLiabilities", label: "Segment Liabilities", type: "text" },
    {
      name: "interSegmentRevenue",
      label: "Inter-Segment Revenue",
      type: "text",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getSegmentReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/general-ledger-financial-reporting/segment-reports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Segment Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <GlfrForm
          entityType="Segment Report"
          apiPath={`/api/v1/general-ledger-financial-reporting/segment-reports/${id}`}
          fields={SEGMENT_REPORT_FIELDS}
          initialData={{
            reportType: record.reportType,
            segmentName: record.segmentName ?? "",
            periodStart: record.periodStart
              ? record.periodStart.toISOString()
              : "",
            periodEnd: record.periodEnd
              ? record.periodEnd.toISOString()
              : "",
            fiscalYear: record.fiscalYear ?? "",
            currency: record.currency ?? "",
            revenue: record.revenue ?? "",
            costOfRevenue: record.costOfRevenue ?? "",
            grossProfit: record.grossProfit ?? "",
            operatingExpenses: record.operatingExpenses ?? "",
            operatingIncome: record.operatingIncome ?? "",
            segmentAssets: record.segmentAssets ?? "",
            segmentLiabilities: record.segmentLiabilities ?? "",
            interSegmentRevenue: record.interSegmentRevenue ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/general-ledger-financial-reporting/segment-reports/${id}`}
        />
      </div>
    </div>
  );
}
