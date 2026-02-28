import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmManifestItems } from "@/db/schema";

export default async function ManifestItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
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

  const canEdit = await hasPermission(session.id, session.tenantId, "operations:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "operations:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/operations-documentation/manifest-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.blNumber ?? "Manifest Item"}
          </h1>
          <p className="text-sm text-gray-500">
            Container: {record.containerNumber ?? "-"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/operations-documentation/manifest-items/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/operations-documentation/manifest-items/${id}`}
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Detail Fields */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "BL Number", value: record.blNumber ?? "-" },
            { label: "Container Number", value: record.containerNumber ?? "-" },
            { label: "Shipper Name", value: record.shipperName ?? "-" },
            { label: "Consignee Name", value: record.consigneeName ?? "-" },
            { label: "Cargo Description", value: record.cargoDescription ?? "-" },
            { label: "HS Code", value: record.hsCode ?? "-" },
            { label: "Package Count", value: record.packageCount != null ? String(record.packageCount) : "-" },
            { label: "Package Type", value: record.packageType ?? "-" },
            { label: "Gross Weight", value: record.grossWeight != null ? String(record.grossWeight) : "-" },
            { label: "Volume (CBM)", value: record.volumeCbm != null ? String(record.volumeCbm) : "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">
                {field.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
