import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyEquipmentInterchanges } from "@/db/schema";
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

export default async function EditEquipmentInterchangePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const ei = await db
    .select()
    .from(eqyEquipmentInterchanges)
    .where(
      and(
        eq(eqyEquipmentInterchanges.id, id),
        eq(eqyEquipmentInterchanges.tenantId, session.tenantId),
        isNull(eqyEquipmentInterchanges.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ei) notFound();

  const initialData: Record<string, unknown> = {
    interchangeReference: ei.interchangeReference,
    interchangeType: ei.interchangeType,
    containerNumber: ei.containerNumber,
    containerFleetId: ei.containerFleetId ?? "",
    partyFrom: ei.partyFrom,
    partyTo: ei.partyTo,
    locationCode: ei.locationCode ?? "",
    locationName: ei.locationName ?? "",
    interchangeDate: ei.interchangeDate
      ? ei.interchangeDate.toISOString()
      : "",
    conditionIn: ei.conditionIn ?? "",
    conditionOut: ei.conditionOut ?? "",
    damageRemarks: ei.damageRemarks ?? "",
    liabilityParty: ei.liabilityParty ?? "",
    receiptNumber: ei.receiptNumber ?? "",
    status: ei.status,
    notes: ei.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/equipment-interchanges/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Equipment Interchange
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Equipment Interchange"
          apiPath={`/api/v1/equipment-control-yard-managem/equipment-interchanges/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/equipment-interchanges/${id}`}
        />
      </div>
    </div>
  );
}
