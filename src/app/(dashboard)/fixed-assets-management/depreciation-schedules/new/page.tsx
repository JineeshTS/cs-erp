import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";

const DEPRECIATION_SCHEDULE_FIELDS: FieldConfig[] = [
  {
    name: "scheduleType",
    label: "Schedule Type",
    type: "select",
    required: true,
    options: [
      { value: "straight_line", label: "Straight Line" },
      { value: "declining_balance", label: "Declining Balance" },
      { value: "units_of_production", label: "Units of Production" },
      { value: "sum_of_years", label: "Sum of Years" },
      { value: "custom", label: "Custom" },
    ],
  },
  { name: "assetRef", label: "Asset Ref", type: "text" },
  { name: "assetName", label: "Asset Name", type: "text" },
  { name: "startDate", label: "Start Date", type: "datetime-local" },
  { name: "endDate", label: "End Date", type: "datetime-local" },
  { name: "originalCost", label: "Original Cost", type: "text" },
  { name: "residualValue", label: "Residual Value", type: "text" },
  { name: "depreciableAmount", label: "Depreciable Amount", type: "text" },
  {
    name: "usefulLifeMonths",
    label: "Useful Life (Months)",
    type: "number",
  },
  {
    name: "monthlyDepreciation",
    label: "Monthly Depreciation",
    type: "text",
  },
  {
    name: "annualDepreciation",
    label: "Annual Depreciation",
    type: "text",
  },
  {
    name: "accumulatedDepreciation",
    label: "Accumulated Depreciation",
    type: "text",
  },
  { name: "currentBookValue", label: "Current Book Value", type: "text" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "QAR",
  },
  { name: "depreciationRate", label: "Depreciation Rate", type: "text" },
  {
    name: "lastCalculatedDate",
    label: "Last Calculated Date",
    type: "datetime-local",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDepreciationSchedulePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:create")))
    redirect("/fixed-assets-management/depreciation-schedules");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/depreciation-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Depreciation Schedule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Depreciation Schedule"
          apiPath="/api/v1/fixed-assets-management/depreciation-schedules"
          fields={DEPRECIATION_SCHEDULE_FIELDS}
          returnPath="/fixed-assets-management/depreciation-schedules"
        />
      </div>
    </div>
  );
}
