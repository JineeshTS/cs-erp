import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const MNR_FIELDS: FieldConfig[] = [
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
    placeholder: "ABCU1234567",
  },
  {
    name: "mnrReference",
    label: "MNR Reference",
    type: "text",
    required: true,
    placeholder: "MNR-2026-001",
  },
  {
    name: "repairType",
    label: "Repair Type",
    type: "select",
    options: [
      { value: "structural", label: "Structural" },
      { value: "mechanical", label: "Mechanical" },
      { value: "reefer", label: "Reefer" },
      { value: "cosmetic", label: "Cosmetic" },
      { value: "cleaning", label: "Cleaning" },
    ],
  },
  { name: "damageCode", label: "Damage Code", type: "text" },
  { name: "damageLocation", label: "Damage Location", type: "text" },
  {
    name: "damageDescription",
    label: "Damage Description",
    type: "textarea",
  },
  { name: "estimatedCost", label: "Estimated Cost", type: "number" },
  { name: "actualCost", label: "Actual Cost", type: "number" },
  {
    name: "currency",
    label: "Currency",
    type: "select",
    options: [
      { value: "USD", label: "USD" },
      { value: "QAR", label: "QAR" },
      { value: "AED", label: "AED" },
      { value: "SAR", label: "SAR" },
      { value: "INR", label: "INR" },
    ],
  },
  { name: "repairVendor", label: "Repair Vendor", type: "text" },
  { name: "depotCode", label: "Depot Code", type: "text" },
  { name: "depotName", label: "Depot Name", type: "text" },
  {
    name: "inspectionDate",
    label: "Inspection Date",
    type: "datetime-local",
  },
  {
    name: "repairStartDate",
    label: "Repair Start Date",
    type: "datetime-local",
  },
  {
    name: "repairCompleteDate",
    label: "Repair Complete Date",
    type: "datetime-local",
  },
  {
    name: "approvalStatus",
    label: "Approval Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "reported", label: "Reported" },
      { value: "estimated", label: "Estimated" },
      { value: "approved", label: "Approved" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "billed", label: "Billed" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewMaintenanceRepairPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "equipment:create"))
  )
    redirect("/equipment-control-yard-managem/maintenance-repairs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/maintenance-repairs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Maintenance &amp; Repair
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="MNR Record"
          apiPath="/api/v1/equipment-control-yard-managem/maintenance-repairs"
          fields={MNR_FIELDS}
          returnPath="/equipment-control-yard-managem/maintenance-repairs"
        />
      </div>
    </div>
  );
}
