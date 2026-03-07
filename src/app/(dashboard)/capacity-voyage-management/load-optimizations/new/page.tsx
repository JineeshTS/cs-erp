import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewLoadOptimizationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    {
      name: "vesselScheduleId",
      label: "Vessel Schedule ID",
      type: "text",
    },
    {
      name: "optimizationRunId",
      label: "Optimization Run ID",
      type: "text",
    },
    {
      name: "algorithm",
      label: "Algorithm",
      type: "text",
    },
    {
      name: "objective",
      label: "Objective",
      type: "select",
      options: [
        { value: "maximize_teu", label: "Maximize TEU" },
        { value: "maximize_revenue", label: "Maximize Revenue" },
        { value: "minimize_shifts", label: "Minimize Shifts" },
        { value: "balance_weight", label: "Balance Weight" },
      ],
    },
    {
      name: "totalTeuBefore",
      label: "Total TEU Before",
      type: "number",
    },
    {
      name: "totalTeuAfter",
      label: "Total TEU After",
      type: "number",
    },
    {
      name: "improvementPercent",
      label: "Improvement %",
      type: "number",
    },
    {
      name: "revenueImpact",
      label: "Revenue Impact",
      type: "number",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "aiModel",
      label: "AI Model",
      type: "text",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "running", label: "Running" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/load-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Load Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Load Optimization"
          apiPath="/api/v1/capacity-voyage-management/load-optimizations"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/load-optimizations"
        />
      </div>
    </div>
  );
}
