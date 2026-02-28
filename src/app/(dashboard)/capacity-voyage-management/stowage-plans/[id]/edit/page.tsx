import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capStowagePlans } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "bayPlanId",
    label: "Bay Plan ID",
    type: "text",
  },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  {
    name: "containerType",
    label: "Container Type",
    type: "text",
  },
  {
    name: "containerSize",
    label: "Container Size",
    type: "text",
  },
  {
    name: "isoCode",
    label: "ISO Code",
    type: "text",
  },
  {
    name: "weightKg",
    label: "Weight (kg)",
    type: "number",
  },
  {
    name: "bayNumber",
    label: "Bay Number",
    type: "number",
  },
  {
    name: "rowNumber",
    label: "Row Number",
    type: "number",
  },
  {
    name: "tierNumber",
    label: "Tier Number",
    type: "number",
  },
  {
    name: "isHazmat",
    label: "Is Hazmat",
    type: "checkbox",
  },
  {
    name: "hazmatClass",
    label: "Hazmat Class",
    type: "text",
  },
  {
    name: "isReefer",
    label: "Is Reefer",
    type: "checkbox",
  },
  {
    name: "reeferTemp",
    label: "Reefer Temp",
    type: "number",
  },
  {
    name: "isOog",
    label: "Is OOG",
    type: "checkbox",
  },
  {
    name: "oogHeightCm",
    label: "OOG Height (cm)",
    type: "number",
  },
  {
    name: "oogWidthCm",
    label: "OOG Width (cm)",
    type: "number",
  },
  {
    name: "pol",
    label: "POL",
    type: "text",
  },
  {
    name: "pod",
    label: "POD",
    type: "text",
  },
  {
    name: "stackingOrder",
    label: "Stacking Order",
    type: "number",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "planned", label: "Planned" },
      { value: "loaded", label: "Loaded" },
      { value: "discharged", label: "Discharged" },
      { value: "shifted", label: "Shifted" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function EditStowagePlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const { id } = await params;
  const sp = await db
    .select()
    .from(capStowagePlans)
    .where(
      and(
        eq(capStowagePlans.id, id),
        eq(capStowagePlans.tenantId, session.tenantId),
        isNull(capStowagePlans.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!sp) notFound();

  const initialData: Record<string, unknown> = {
    vesselScheduleId: sp.vesselScheduleId ?? "",
    bayPlanId: sp.bayPlanId ?? "",
    containerNumber: sp.containerNumber,
    containerType: sp.containerType ?? "",
    containerSize: sp.containerSize ?? "",
    isoCode: sp.isoCode ?? "",
    weightKg: sp.weightKg ?? "",
    bayNumber: sp.bayNumber ?? "",
    rowNumber: sp.rowNumber ?? "",
    tierNumber: sp.tierNumber ?? "",
    isHazmat: sp.isHazmat ?? false,
    hazmatClass: sp.hazmatClass ?? "",
    isReefer: sp.isReefer ?? false,
    reeferTemp: sp.reeferTemp != null ? Number(sp.reeferTemp) : "",
    isOog: sp.isOog ?? false,
    oogHeightCm: sp.oogHeightCm ?? "",
    oogWidthCm: sp.oogWidthCm ?? "",
    pol: sp.pol ?? "",
    pod: sp.pod ?? "",
    stackingOrder: sp.stackingOrder ?? "",
    status: sp.status,
    notes: sp.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/stowage-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Stowage Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Stowage Plan"
          apiPath={`/api/v1/capacity-voyage-management/stowage-plans/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/stowage-plans/${id}`}
        />
      </div>
    </div>
  );
}
