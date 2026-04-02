import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getExecutiveKpiDashboard } from "@/lib/analytics-business-intelligence/service";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const DASHBOARD_FIELDS: FieldConfig[] = [
  {
    name: "dashboardType",
    label: "Dashboard Type",
    type: "select",
    required: true,
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
    ],
  },
  {
    name: "periodStart",
    label: "Period Start",
    type: "datetime-local",
    required: true,
  },
  {
    name: "periodEnd",
    label: "Period End",
    type: "datetime-local",
    required: true,
  },
  { name: "totalTeu", label: "Total TEU", type: "number" },
  { name: "totalRevenue", label: "Total Revenue", type: "number" },
  {
    name: "revenueCurrency",
    label: "Revenue Currency",
    type: "text",
    placeholder: "e.g. USD, QAR, AED",
  },
  { name: "grossProfit", label: "Gross Profit", type: "number" },
  { name: "grossMarginPct", label: "Gross Margin %", type: "number" },
  {
    name: "vesselUtilizationPct",
    label: "Vessel Utilization %",
    type: "number",
  },
  {
    name: "slotUtilizationPct",
    label: "Slot Utilization %",
    type: "number",
  },
  {
    name: "onTimePerformancePct",
    label: "On-Time Performance %",
    type: "number",
  },
  {
    name: "bookingConversionPct",
    label: "Booking Conversion %",
    type: "number",
  },
  {
    name: "averageRevenuePerTeu",
    label: "Avg Revenue / TEU",
    type: "number",
  },
  { name: "operatingCosts", label: "Operating Costs", type: "number" },
  { name: "ebitda", label: "EBITDA", type: "number" },
  { name: "activeVessels", label: "Active Vessels", type: "number" },
  { name: "activeRoutes", label: "Active Routes", type: "number" },
  { name: "totalBookings", label: "Total Bookings", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditExecutiveKpiDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:edit")))
    redirect("/analytics-business-intelligence/executive-kpi-dashboards");

  const { id } = await params;

  const dashboard = await getExecutiveKpiDashboard(id, session.tenantId);
  if (!dashboard) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics-business-intelligence/executive-kpi-dashboards/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Executive KPI Dashboard
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Executive KPI Dashboard"
          apiPath={`/api/v1/analytics-business-intelligence/executive-kpi-dashboards/${id}`}
          fields={DASHBOARD_FIELDS}
          initialData={{
            dashboardType: dashboard.dashboardType,
            periodStart: dashboard.periodStart
              ? dashboard.periodStart.toISOString()
              : "",
            periodEnd: dashboard.periodEnd
              ? dashboard.periodEnd.toISOString()
              : "",
            totalTeu: dashboard.totalTeu ? Number(dashboard.totalTeu) : "",
            totalRevenue: dashboard.totalRevenue
              ? Number(dashboard.totalRevenue)
              : "",
            revenueCurrency: dashboard.revenueCurrency ?? "",
            grossProfit: dashboard.grossProfit
              ? Number(dashboard.grossProfit)
              : "",
            grossMarginPct: dashboard.grossMarginPct
              ? Number(dashboard.grossMarginPct)
              : "",
            vesselUtilizationPct: dashboard.vesselUtilizationPct
              ? Number(dashboard.vesselUtilizationPct)
              : "",
            slotUtilizationPct: dashboard.slotUtilizationPct
              ? Number(dashboard.slotUtilizationPct)
              : "",
            onTimePerformancePct: dashboard.onTimePerformancePct
              ? Number(dashboard.onTimePerformancePct)
              : "",
            bookingConversionPct: dashboard.bookingConversionPct
              ? Number(dashboard.bookingConversionPct)
              : "",
            averageRevenuePerTeu: dashboard.averageRevenuePerTeu
              ? Number(dashboard.averageRevenuePerTeu)
              : "",
            operatingCosts: dashboard.operatingCosts
              ? Number(dashboard.operatingCosts)
              : "",
            ebitda: dashboard.ebitda ? Number(dashboard.ebitda) : "",
            activeVessels: dashboard.activeVessels ?? "",
            activeRoutes: dashboard.activeRoutes ?? "",
            totalBookings: dashboard.totalBookings ?? "",
            notes: dashboard.notes ?? "",
          }}
          isEdit
          returnPath={`/analytics-business-intelligence/executive-kpi-dashboards/${id}`}
        />
      </div>
    </div>
  );
}
