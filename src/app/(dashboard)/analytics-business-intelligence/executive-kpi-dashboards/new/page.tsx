import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewExecutiveKpiDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/executive-kpi-dashboards");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/executive-kpi-dashboards"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Executive KPI Dashboard
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Executive KPI Dashboard"
          apiPath="/api/v1/analytics-business-intelligence/executive-kpi-dashboards"
          fields={DASHBOARD_FIELDS}
          returnPath="/analytics-business-intelligence/executive-kpi-dashboards"
        />
      </div>
    </div>
  );
}
