import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSpecialEquipmentRecord } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function SpecialEquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const { id } = await params;

  const record = await getSpecialEquipmentRecord(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "oog_special:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/oog-special-cargo-management/special-equipment"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.equipmentRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.equipmentName} &middot; {record.equipmentType}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/oog-special-cargo-management/special-equipment/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Equipment Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.equipmentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Equipment Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.equipmentType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Equipment Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.equipmentNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Equipment Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.equipmentName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
            <dd className="mt-1 text-gray-900">
              {record.manufacturer || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.modelNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Max Load Capacity (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.maxLoadCapacityKg ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Tare Weight (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.tareWeightKg ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Internal Length (cm)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.internalLengthCm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Internal Width (cm)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.internalWidthCm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Internal Height (cm)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.internalHeightCm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Door Opening Width (cm)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.doorOpeningWidthCm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Door Opening Height (cm)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.doorOpeningHeightCm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certification Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.certificationNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certification Expiry
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.certificationExpiry)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Inspection Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.lastInspectionDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Next Inspection Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.nextInspectionDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.currentLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Ownership Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.ownershipType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Lease Reference
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.leaseReference || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Available From
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(record.availableFrom)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "available"
                    ? "success"
                    : record.status === "retired"
                      ? "destructive"
                      : record.status === "maintenance"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
