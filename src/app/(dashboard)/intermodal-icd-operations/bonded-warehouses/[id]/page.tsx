import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBondedWarehouse } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function BondedWarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "intermodal:edit"
  );

  const record = await getBondedWarehouse(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/intermodal-icd-operations/bonded-warehouses"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {record.warehouseRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/intermodal-icd-operations/bonded-warehouses/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Warehouse Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.warehouseRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Warehouse Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.warehouseName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Warehouse Code
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.warehouseCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Warehouse Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.warehouseType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customs License #
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.customsLicenseNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              License Expiry
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.customsLicenseExpiry
                ? new Date(record.customsLicenseExpiry).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.location || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Area (sqm)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.totalAreaSqm != null
                ? String(record.totalAreaSqm)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Usable Area (sqm)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.usableAreaSqm != null
                ? String(record.usableAreaSqm)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Storage Capacity (TEU)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.storageCapacityTeu != null
                ? String(record.storageCapacityTeu)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Occupancy (TEU)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currentOccupancyTeu != null
                ? String(record.currentOccupancyTeu)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Temperature Controlled
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.temperatureControlled ? "success" : "secondary"
                }
              >
                {record.temperatureControlled ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Temp Range Min
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.tempRangeMin != null
                ? String(record.tempRangeMin)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Temp Range Max
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.tempRangeMax != null
                ? String(record.tempRangeMax)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hazmat Certified
            </dt>
            <dd className="mt-1">
              <Badge
                variant={record.hazmatCertified ? "success" : "secondary"}
              >
                {record.hazmatCertified ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Security Level
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.securityLevel || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Operating Hours Start
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.operatingHoursStart || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Operating Hours End
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.operatingHoursEnd || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bond Period (days)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.bondPeriodDays != null
                ? String(record.bondPeriodDays)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Daily Storage Rate
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.dailyStorageRate != null
                ? String(record.dailyStorageRate)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.contactName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Phone
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.contactPhone || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "suspended"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
