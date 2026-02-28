import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
    required: true,
  },
  { name: "portRotationId", label: "Port Rotation ID", type: "text" },
  { name: "baplieVersion", label: "BAPLIE Version", type: "text" },
  {
    name: "planType",
    label: "Plan Type",
    type: "select",
    options: [
      { value: "pre_stow", label: "Pre-Stow" },
      { value: "actual", label: "Actual" },
      { value: "discharge", label: "Discharge" },
    ],
  },
  { name: "totalSlots", label: "Total Slots", type: "number" },
  { name: "occupiedSlots", label: "Occupied Slots", type: "number" },
  {
    name: "utilizationPercent",
    label: "Utilization Percent",
    type: "number",
  },
  { name: "fileReference", label: "File Reference", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "validated", label: "Validated" },
      { value: "submitted", label: "Submitted" },
      { value: "accepted", label: "Accepted" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewBayPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:create")))
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/bay-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Bay Plan</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Bay Plan"
          apiPath="/api/v1/capacity-voyage-management/bay-plans"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/bay-plans"
        />
      </div>
    </div>
  );
}
