import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { GlfrForm } from "@/components/general-ledger-financial-reporting/glfr-form";
import type { FieldConfig } from "@/components/general-ledger-financial-reporting/glfr-form";

const FIELDS: FieldConfig[] = [
  {
    name: "closureType",
    label: "Closure Type",
    type: "select",
    required: true,
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
      { value: "interim", label: "Interim" },
      { value: "soft_close", label: "Soft Close" },
    ],
  },
  { name: "periodName", label: "Period Name", type: "text" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "fiscalYear", label: "Fiscal Year", type: "number" },
  { name: "fiscalMonth", label: "Fiscal Month", type: "number" },
  { name: "completedSteps", label: "Completed Steps", type: "number" },
  { name: "totalSteps", label: "Total Steps", type: "number" },
  { name: "closedBy", label: "Closed By", type: "text" },
  { name: "closedAt", label: "Closed At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPeriodClosurePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:create")))
    redirect("/general-ledger-financial-reporting/period-closures");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/general-ledger-financial-reporting/period-closures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Period Closure
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <GlfrForm
          entityType="Period Closure"
          apiPath="/api/v1/general-ledger-financial-reporting/period-closures"
          fields={FIELDS}
          returnPath="/general-ledger-financial-reporting/period-closures"
        />
      </div>
    </div>
  );
}
