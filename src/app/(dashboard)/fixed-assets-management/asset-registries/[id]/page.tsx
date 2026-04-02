import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAssetRegistry } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

export default async function AssetRegistryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getAssetRegistry(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "asset:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/asset-registries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.assetName}
          </h1>
          <p className="text-sm text-gray-500">{record.assetRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fixed-assets-management/asset-registries/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assetRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-gray-900">{record.assetName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Type</dt>
            <dd className="mt-1 text-gray-900">{record.assetType}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {record.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Serial Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.serialNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Barcode</dt>
            <dd className="mt-1 text-gray-900">{record.barcode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{record.category || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sub Category</dt>
            <dd className="mt-1 text-gray-900">
              {record.subCategory || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-gray-900">{record.location || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-gray-900">{record.department || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Custodian</dt>
            <dd className="mt-1 text-gray-900">{record.custodian || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acquisition Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.acquisitionDate
                ? new Date(record.acquisitionDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acquisition Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.acquisitionCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Residual Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.residualValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Useful Life (Months)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.usefulLifeMonths ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Book Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.currentBookValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Depreciation Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.depreciationMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Warranty Expiry
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.warrantyExpiry
                ? new Date(record.warrantyExpiry).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Condition</dt>
            <dd className="mt-1 text-gray-900">{record.condition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "disposed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
