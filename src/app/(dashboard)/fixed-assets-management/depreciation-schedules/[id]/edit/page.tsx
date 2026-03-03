import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDepreciationSchedule } from "@/lib/fixed-assets-management/service";
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

export default async function EditDepreciationSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:edit")))
    redirect("/fixed-assets-management/depreciation-schedules");

  const { id } = await params;

  const record = await getDepreciationSchedule(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fixed-assets-management/depreciation-schedules/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Depreciation Schedule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Depreciation Schedule"
          apiPath={`/api/v1/fixed-assets-management/depreciation-schedules/${id}`}
          fields={DEPRECIATION_SCHEDULE_FIELDS}
          initialData={{
            scheduleType: record.scheduleType ?? "",
            assetRef: record.assetRef ?? "",
            assetName: record.assetName ?? "",
            startDate: record.startDate
              ? new Date(record.startDate).toISOString()
              : "",
            endDate: record.endDate
              ? new Date(record.endDate).toISOString()
              : "",
            originalCost: record.originalCost ?? "",
            residualValue: record.residualValue ?? "",
            depreciableAmount: record.depreciableAmount ?? "",
            usefulLifeMonths: record.usefulLifeMonths ?? "",
            monthlyDepreciation: record.monthlyDepreciation ?? "",
            annualDepreciation: record.annualDepreciation ?? "",
            accumulatedDepreciation: record.accumulatedDepreciation ?? "",
            currentBookValue: record.currentBookValue ?? "",
            currency: record.currency ?? "",
            depreciationRate: record.depreciationRate ?? "",
            lastCalculatedDate: record.lastCalculatedDate
              ? new Date(record.lastCalculatedDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/fixed-assets-management/depreciation-schedules/${id}`}
        />
      </div>
    </div>
  );
}
