import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDryPort } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function DryPortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const { id } = await params;
  const record = await getDryPort(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "intermodal:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/dry-ports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.portName}
          </h1>
          <p className="text-sm text-gray-500">{record.portRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/intermodal-icd-operations/dry-ports/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Port Ref</dt>
            <dd className="mt-1 text-gray-900">{record.portRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{record.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">{record.portCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Type</dt>
            <dd className="mt-1 text-gray-900">{record.portType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-gray-900">{record.country || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1 text-gray-900">{record.city || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-gray-900">{record.address || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Latitude</dt>
            <dd className="mt-1 text-gray-900">{record.latitude || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Longitude</dt>
            <dd className="mt-1 text-gray-900">{record.longitude || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Operator Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.operatorName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Operator Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.operatorCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customs Zone Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.customsZoneType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Storage Capacity (TEU)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.storageCapacityTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Occupancy (TEU)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.currentOccupancyTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rail Connected
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.railConnected ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gate Hours Start
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.gateHoursStart || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gate Hours End
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.gateHoursEnd || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.contactName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
            <dd className="mt-1 text-gray-900">
              {record.contactPhone || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
            <dd className="mt-1 text-gray-900">
              {record.contactEmail || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "inactive"
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
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
