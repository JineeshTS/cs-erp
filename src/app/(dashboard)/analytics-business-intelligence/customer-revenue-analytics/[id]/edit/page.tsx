import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCustomerRevenueAnalytic } from "@/lib/analytics-business-intelligence/service";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const CUSTOMER_REVENUE_ANALYTICS_FIELDS: FieldConfig[] = [
  {
    name: "analyticsType",
    label: "Analytics Type",
    type: "select",
    required: true,
    options: [
      { value: "revenue_breakdown", label: "Revenue Breakdown" },
      { value: "profitability", label: "Profitability" },
      { value: "segmentation", label: "Segmentation" },
      { value: "lifetime_value", label: "Lifetime Value" },
    ],
  },
  {
    name: "customerName",
    label: "Customer Name",
    type: "text",
    required: true,
  },
  { name: "customerCode", label: "Customer Code", type: "text" },
  { name: "customerSegment", label: "Customer Segment", type: "text" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "totalRevenue", label: "Total Revenue", type: "number" },
  { name: "totalCosts", label: "Total Costs", type: "number" },
  { name: "grossProfit", label: "Gross Profit", type: "number" },
  { name: "grossMarginPct", label: "Gross Margin %", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "totalTeu", label: "Total TEU", type: "number" },
  { name: "totalShipments", label: "Total Shipments", type: "number" },
  {
    name: "avgRevenuePerShipment",
    label: "Avg Revenue Per Shipment",
    type: "number",
  },
  {
    name: "paymentTermsDays",
    label: "Payment Terms (Days)",
    type: "number",
  },
  {
    name: "avgDaysToPayment",
    label: "Avg Days to Payment",
    type: "number",
  },
  {
    name: "outstandingBalance",
    label: "Outstanding Balance",
    type: "number",
  },
  { name: "lifetimeValue", label: "Lifetime Value", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCustomerRevenueAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:edit")))
    redirect("/analytics-business-intelligence/customer-revenue-analytics");

  const { id } = await params;

  const record = await getCustomerRevenueAnalytic(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics-business-intelligence/customer-revenue-analytics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Customer Revenue Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Customer Revenue Analytics"
          apiPath={`/api/v1/analytics-business-intelligence/customer-revenue-analytics/${id}`}
          fields={CUSTOMER_REVENUE_ANALYTICS_FIELDS}
          initialData={{
            analyticsType: record.analyticsType,
            customerName: record.customerName,
            customerCode: record.customerCode ?? "",
            customerSegment: record.customerSegment ?? "",
            periodStart: record.periodStart
              ? record.periodStart.toISOString()
              : "",
            periodEnd: record.periodEnd
              ? record.periodEnd.toISOString()
              : "",
            totalRevenue: record.totalRevenue
              ? Number(record.totalRevenue)
              : "",
            totalCosts: record.totalCosts ? Number(record.totalCosts) : "",
            grossProfit: record.grossProfit
              ? Number(record.grossProfit)
              : "",
            grossMarginPct: record.grossMarginPct
              ? Number(record.grossMarginPct)
              : "",
            currency: record.currency ?? "",
            totalTeu: record.totalTeu ? Number(record.totalTeu) : "",
            totalShipments: record.totalShipments ?? "",
            avgRevenuePerShipment: record.avgRevenuePerShipment
              ? Number(record.avgRevenuePerShipment)
              : "",
            paymentTermsDays: record.paymentTermsDays ?? "",
            avgDaysToPayment: record.avgDaysToPayment
              ? Number(record.avgDaysToPayment)
              : "",
            outstandingBalance: record.outstandingBalance
              ? Number(record.outstandingBalance)
              : "",
            lifetimeValue: record.lifetimeValue
              ? Number(record.lifetimeValue)
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/analytics-business-intelligence/customer-revenue-analytics/${id}`}
        />
      </div>
    </div>
  );
}
