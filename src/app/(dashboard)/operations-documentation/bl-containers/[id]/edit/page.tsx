import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmBlContainers } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const CONTAINER_FIELDS: FieldConfig[] = [
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "sealNumber", label: "Seal Number", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "grossWeight", label: "Gross Weight", type: "number" },
  { name: "tareWeight", label: "Tare Weight", type: "number" },
  { name: "netWeight", label: "Net Weight", type: "number" },
  { name: "volumeCbm", label: "Volume (CBM)", type: "number" },
  { name: "packageCount", label: "Package Count", type: "number" },
  { name: "packageType", label: "Package Type", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "hsCode", label: "HS Code", type: "text" },
];

export default async function EditBlContainerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation/bl-containers");

  const { id } = await params;
  const record = await db
    .select()
    .from(odmBlContainers)
    .where(
      and(
        eq(odmBlContainers.id, id),
        eq(odmBlContainers.tenantId, session.tenantId),
        isNull(odmBlContainers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    containerNumber: record.containerNumber,
    sealNumber: record.sealNumber ?? "",
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    grossWeight: record.grossWeight ?? "",
    tareWeight: record.tareWeight ?? "",
    netWeight: record.netWeight ?? "",
    volumeCbm: record.volumeCbm ?? "",
    packageCount: record.packageCount ?? "",
    packageType: record.packageType ?? "",
    cargoDescription: record.cargoDescription ?? "",
    hsCode: record.hsCode ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/operations-documentation/bl-containers/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit BL Container</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="BL Container"
          apiPath={`/api/v1/operations-documentation/bl-containers/${id}`}
          fields={CONTAINER_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/bl-containers/${id}`}
        />
      </div>
    </div>
  );
}
