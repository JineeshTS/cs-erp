import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capTradeAllocations } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "tradeLane",
    label: "Trade Lane",
    type: "text",
    required: true,
  },
  {
    name: "originRegion",
    label: "Origin Region",
    type: "text",
  },
  {
    name: "destinationRegion",
    label: "Destination Region",
    type: "text",
  },
  {
    name: "allocatedTeu",
    label: "Allocated TEU",
    type: "number",
    required: true,
  },
  {
    name: "allocatedWeightMt",
    label: "Allocated Weight (MT)",
    type: "number",
  },
  {
    name: "utilizedTeu",
    label: "Utilized TEU",
    type: "number",
  },
  {
    name: "utilizedWeightMt",
    label: "Utilized Weight (MT)",
    type: "number",
  },
  {
    name: "allocationType",
    label: "Allocation Type",
    type: "select",
    options: [
      { value: "contract", label: "Contract" },
      { value: "spot", label: "Spot" },
      { value: "reserve", label: "Reserve" },
    ],
  },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "datetime-local",
    required: true,
  },
  {
    name: "effectiveTo",
    label: "Effective To",
    type: "datetime-local",
  },
  {
    name: "priority",
    label: "Priority",
    type: "number",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "expired", label: "Expired" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function EditTradeAllocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const { id } = await params;
  const ta = await db
    .select()
    .from(capTradeAllocations)
    .where(
      and(
        eq(capTradeAllocations.id, id),
        eq(capTradeAllocations.tenantId, session.tenantId),
        isNull(capTradeAllocations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ta) notFound();

  const initialData: Record<string, unknown> = {
    vesselScheduleId: ta.vesselScheduleId ?? "",
    tradeLane: ta.tradeLane,
    originRegion: ta.originRegion ?? "",
    destinationRegion: ta.destinationRegion ?? "",
    allocatedTeu: Number(ta.allocatedTeu),
    allocatedWeightMt: ta.allocatedWeightMt != null ? Number(ta.allocatedWeightMt) : "",
    utilizedTeu: ta.utilizedTeu != null ? Number(ta.utilizedTeu) : "",
    utilizedWeightMt: ta.utilizedWeightMt != null ? Number(ta.utilizedWeightMt) : "",
    allocationType: ta.allocationType,
    effectiveFrom: ta.effectiveFrom?.toISOString() ?? "",
    effectiveTo: ta.effectiveTo?.toISOString() ?? "",
    priority: ta.priority != null ? Number(ta.priority) : "",
    status: ta.status,
    notes: ta.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/trade-allocations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Trade Allocation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Trade Allocation"
          apiPath={`/api/v1/capacity-voyage-management/trade-allocations/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/trade-allocations/${id}`}
        />
      </div>
    </div>
  );
}
