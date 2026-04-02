import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capLoadingLists } from "@/db/schema";
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
  {
    name: "listReference",
    label: "List Reference",
    type: "text",
    required: true,
  },
  {
    name: "listType",
    label: "List Type",
    type: "select",
    options: [
      { value: "preliminary", label: "Preliminary" },
      { value: "final", label: "Final" },
      { value: "amended", label: "Amended" },
    ],
  },
  { name: "totalContainers", label: "Total Containers", type: "number" },
  { name: "totalTeu", label: "Total TEU", type: "number" },
  { name: "totalWeightMt", label: "Total Weight (MT)", type: "number" },
  { name: "hazmatCount", label: "Hazmat Count", type: "number" },
  { name: "reeferCount", label: "Reefer Count", type: "number" },
  { name: "oogCount", label: "OOG Count", type: "number" },
  { name: "cutOffCargo", label: "Cut-Off Cargo", type: "datetime-local" },
  {
    name: "cutOffDocumentation",
    label: "Cut-Off Documentation",
    type: "datetime-local",
  },
  { name: "cutOffVgm", label: "Cut-Off VGM", type: "datetime-local" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "preliminary", label: "Preliminary" },
      { value: "final", label: "Final" },
      { value: "closed", label: "Closed" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLoadingListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const record = await db
    .select()
    .from(capLoadingLists)
    .where(
      and(
        eq(capLoadingLists.id, id),
        eq(capLoadingLists.tenantId, session.tenantId),
        isNull(capLoadingLists.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    vesselScheduleId: record.vesselScheduleId,
    portRotationId: record.portRotationId ?? "",
    listReference: record.listReference,
    listType: record.listType,
    totalContainers: Number(record.totalContainers ?? 0),
    totalTeu: Number(record.totalTeu ?? 0),
    totalWeightMt: Number(record.totalWeightMt ?? 0),
    hazmatCount: Number(record.hazmatCount ?? 0),
    reeferCount: Number(record.reeferCount ?? 0),
    oogCount: Number(record.oogCount ?? 0),
    cutOffCargo: record.cutOffCargo?.toISOString() ?? "",
    cutOffDocumentation: record.cutOffDocumentation?.toISOString() ?? "",
    cutOffVgm: record.cutOffVgm?.toISOString() ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/loading-lists/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Loading List
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Loading List"
          apiPath={`/api/v1/capacity-voyage-management/loading-lists/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/loading-lists/${id}`}
        />
      </div>
    </div>
  );
}
