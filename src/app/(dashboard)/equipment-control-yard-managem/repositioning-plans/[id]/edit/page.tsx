import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyRepositioningPlans } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditRepositioningPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem/repositioning-plans");

  const portOpts = await getPortOptions(session.tenantId);

  const REPOSITIONING_FIELDS: FieldConfig[] = [
    {
      name: "planReference",
      label: "Plan Reference",
      type: "text",
      required: true,
    },
    { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "fromPort", label: "From Port", type: "select", options: portOpts, required: true },
    { name: "toPort", label: "To Port", type: "select", options: portOpts, required: true },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "estimatedCost", label: "Estimated Cost", type: "number" },
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
    {
      name: "transportMode",
      label: "Transport Mode",
      type: "select",
      options: [
        { value: "vessel", label: "Vessel" },
        { value: "truck", label: "Truck" },
        { value: "rail", label: "Rail" },
        { value: "barge", label: "Barge" },
      ],
    },
    { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
    { name: "completedDate", label: "Completed Date", type: "datetime-local" },
    {
      name: "reason",
      label: "Reason",
      type: "select",
      options: [
        { value: "surplus", label: "Surplus" },
        { value: "demand", label: "Demand" },
        { value: "repositioning", label: "Repositioning" },
        { value: "repair", label: "Repair" },
      ],
    },
    { name: "containerType", label: "Container Type", type: "text" },
    {
      name: "containerSize",
      label: "Container Size",
      type: "select",
      options: [
        { value: "20", label: "20ft" },
        { value: "40", label: "40ft" },
        { value: "45", label: "45ft" },
      ],
    },
    { name: "quantity", label: "Quantity", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "draft", label: "Draft" },
        { value: "approved", label: "Approved" },
        { value: "in_transit", label: "In Transit" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(eqyRepositioningPlans)
    .where(
      and(
        eq(eqyRepositioningPlans.id, id),
        eq(eqyRepositioningPlans.tenantId, session.tenantId),
        isNull(eqyRepositioningPlans.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    planReference: record.planReference,
    containerFleetId: record.containerFleetId ?? "",
    containerNumber: record.containerNumber ?? "",
    fromPort: record.fromPort,
    toPort: record.toPort,
    tradeLane: record.tradeLane ?? "",
    estimatedCost: record.estimatedCost ?? "",
    currency: record.currency,
    transportMode: record.transportMode,
    scheduledDate: record.scheduledDate?.toISOString() ?? "",
    completedDate: record.completedDate?.toISOString() ?? "",
    reason: record.reason,
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    quantity: record.quantity ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/repositioning-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Repositioning Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Repositioning Plan"
          apiPath={`/api/v1/equipment-control-yard-managem/repositioning-plans/${id}`}
          fields={REPOSITIONING_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/repositioning-plans/${id}`}
        />
      </div>
    </div>
  );
}
