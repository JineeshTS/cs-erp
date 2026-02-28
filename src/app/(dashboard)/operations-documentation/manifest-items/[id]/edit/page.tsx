import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmManifestItems } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const MANIFEST_ITEM_FIELDS: FieldConfig[] = [
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "shipperName", label: "Shipper Name", type: "text" },
  { name: "consigneeName", label: "Consignee Name", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "hsCode", label: "HS Code", type: "text" },
  { name: "packageCount", label: "Package Count", type: "number" },
  { name: "packageType", label: "Package Type", type: "text" },
  { name: "grossWeight", label: "Gross Weight", type: "number" },
  { name: "volumeCbm", label: "Volume (CBM)", type: "number" },
];

export default async function EditManifestItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation");

  const { id } = await params;
  const record = await db
    .select()
    .from(odmManifestItems)
    .where(
      and(
        eq(odmManifestItems.id, id),
        eq(odmManifestItems.tenantId, session.tenantId),
        isNull(odmManifestItems.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    blNumber: record.blNumber ?? "",
    containerNumber: record.containerNumber ?? "",
    shipperName: record.shipperName ?? "",
    consigneeName: record.consigneeName ?? "",
    cargoDescription: record.cargoDescription ?? "",
    hsCode: record.hsCode ?? "",
    packageCount: record.packageCount ?? "",
    packageType: record.packageType ?? "",
    grossWeight: record.grossWeight ?? "",
    volumeCbm: record.volumeCbm ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/operations-documentation/manifest-items/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Manifest Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Manifest Item"
          apiPath={`/api/v1/operations-documentation/manifest-items/${id}`}
          fields={MANIFEST_ITEM_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/manifest-items/${id}`}
        />
      </div>
    </div>
  );
}
