import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const FIELDS: FieldConfig[] = [
  {
    name: "interchangeReference",
    label: "Interchange Reference",
    type: "text",
    required: true,
  },
  {
    name: "interchangeType",
    label: "Interchange Type",
    type: "select",
    required: true,
    options: [
      { value: "pick_up", label: "Pick Up" },
      { value: "drop_off", label: "Drop Off" },
      { value: "transfer", label: "Transfer" },
    ],
  },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  { name: "partyFrom", label: "Party From", type: "text", required: true },
  { name: "partyTo", label: "Party To", type: "text", required: true },
  { name: "locationCode", label: "Location Code", type: "text" },
  { name: "locationName", label: "Location Name", type: "text" },
  {
    name: "interchangeDate",
    label: "Interchange Date",
    type: "datetime-local",
    required: true,
  },
  { name: "conditionIn", label: "Condition In", type: "text" },
  { name: "conditionOut", label: "Condition Out", type: "text" },
  { name: "damageRemarks", label: "Damage Remarks", type: "textarea" },
  { name: "liabilityParty", label: "Liability Party", type: "text" },
  { name: "receiptNumber", label: "Receipt Number", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "issued", label: "Issued" },
      { value: "accepted", label: "Accepted" },
      { value: "disputed", label: "Disputed" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewEquipmentInterchangePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "equipment:create"))
  )
    redirect("/equipment-control-yard-managem");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/equipment-interchanges"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Equipment Interchange
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Equipment Interchange"
          apiPath="/api/v1/equipment-control-yard-managem/equipment-interchanges"
          fields={FIELDS}
          returnPath="/equipment-control-yard-managem/equipment-interchanges"
        />
      </div>
    </div>
  );
}
