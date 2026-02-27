import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { containerTypes } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const CONTAINER_TYPE_FIELDS = [
  { name: "isoCode", label: "ISO Code", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "text" as const, required: true },
  { name: "sizeType", label: "Size Type", type: "text" as const, required: true, placeholder: "e.g. 20GP, 40HC" },
  { name: "lengthFt", label: "Length (ft)", type: "number" as const },
  { name: "widthFt", label: "Width (ft)", type: "number" as const },
  { name: "heightFt", label: "Height (ft)", type: "number" as const },
  { name: "tareWeightKg", label: "Tare Weight (kg)", type: "number" as const },
  { name: "maxPayloadKg", label: "Max Payload (kg)", type: "number" as const },
  { name: "cubicCapacityCbm", label: "Cubic Capacity (cbm)", type: "number" as const },
  { name: "isReefer", label: "Reefer", type: "checkbox" as const },
  { name: "isOpenTop", label: "Open Top", type: "checkbox" as const },
  { name: "isFlatRack", label: "Flat Rack", type: "checkbox" as const },
  { name: "isTank", label: "Tank", type: "checkbox" as const },
];

export default async function EditContainerTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "containers:edit")))
    redirect("/master-data-management/container-types");

  const [containerType] = await db
    .select()
    .from(containerTypes)
    .where(
      and(
        eq(containerTypes.id, id),
        eq(containerTypes.tenantId, session.tenantId),
        isNull(containerTypes.deletedAt)
      )
    )
    .limit(1);

  if (!containerType) notFound();

  const initialData: Record<string, unknown> = {
    isoCode: containerType.isoCode,
    description: containerType.description,
    sizeType: containerType.sizeType,
    lengthFt: containerType.lengthFt ? Number(containerType.lengthFt) : "",
    widthFt: containerType.widthFt ? Number(containerType.widthFt) : "",
    heightFt: containerType.heightFt ? Number(containerType.heightFt) : "",
    tareWeightKg: containerType.tareWeightKg ? Number(containerType.tareWeightKg) : "",
    maxPayloadKg: containerType.maxPayloadKg ? Number(containerType.maxPayloadKg) : "",
    cubicCapacityCbm: containerType.cubicCapacityCbm ? Number(containerType.cubicCapacityCbm) : "",
    isReefer: containerType.isReefer,
    isOpenTop: containerType.isOpenTop,
    isFlatRack: containerType.isFlatRack,
    isTank: containerType.isTank,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/container-types/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Container Type
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Container Type"
          apiPath={`/api/v1/master-data-management/container-types/${id}`}
          fields={CONTAINER_TYPE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/master-data-management/container-types/${id}`}
        />
      </div>
    </div>
  );
}
