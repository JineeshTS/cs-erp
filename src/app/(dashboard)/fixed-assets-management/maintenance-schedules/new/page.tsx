import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";

const SCHEDULE_FIELDS: FieldConfig[] = [
  {
    name: "maintenanceType",
    label: "Maintenance Type",
    type: "select",
    required: true,
    options: [
      { value: "preventive", label: "Preventive" },
      { value: "corrective", label: "Corrective" },
      { value: "predictive", label: "Predictive" },
      { value: "condition_based", label: "Condition Based" },
      { value: "overhaul", label: "Overhaul" },
    ],
  },
  { name: "assetRef", label: "Asset Ref", type: "text" },
  { name: "assetName", label: "Asset Name", type: "text" },
  { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
  { name: "completedDate", label: "Completed Date", type: "datetime-local" },
  {
    name: "frequency",
    label: "Frequency",
    type: "select",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annually", label: "Annually" },
      { value: "ad_hoc", label: "Ad Hoc" },
    ],
  },
  { name: "assignedTo", label: "Assigned To", type: "text" },
  { name: "vendor", label: "Vendor", type: "text" },
  { name: "estimatedCost", label: "Estimated Cost", type: "text" },
  { name: "actualCost", label: "Actual Cost", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "workDescription", label: "Work Description", type: "textarea" },
  { name: "downtime", label: "Downtime", type: "text" },
  { name: "nextScheduledDate", label: "Next Scheduled Date", type: "datetime-local" },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewMaintenanceSchedulePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "asset:create"))
  )
    redirect("/fixed-assets-management/maintenance-schedules");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/maintenance-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Maintenance Schedule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Maintenance Schedule"
          apiPath="/api/v1/fixed-assets-management/maintenance-schedules"
          fields={SCHEDULE_FIELDS}
          returnPath="/fixed-assets-management/maintenance-schedules"
        />
      </div>
    </div>
  );
}
