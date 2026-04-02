import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFuelRobRecord } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function FuelRobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/bunker-fuel-management");

  const { id } = await params;

  const record = await getFuelRobRecord(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  const reportTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "noon":
        return "secondary" as const;
      case "arrival":
        return "success" as const;
      case "departure":
        return "default" as const;
      case "bunkering":
        return "warning" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/fuel-rob"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.vesselName} — ROB Record
          </h1>
          <p className="text-sm text-gray-500">
            {record.fuelType} &middot;{" "}
            {new Date(record.reportDate).toLocaleDateString()}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/bunker-fuel-management/fuel-rob/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel IMO</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselImo || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Date</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.reportDate).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">{record.fuelType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ROB Quantity</dt>
            <dd className="mt-1 text-gray-900">
              {record.robQuantity} {record.unit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-gray-900">{record.unit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Daily Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.consumptionDaily ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Voyage Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.consumptionVoyage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Received Qty
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.receivedQuantity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transferred Qty
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.transferredQuantity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-gray-900">
              {record.location || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.portCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1">
              <Badge variant={reportTypeBadgeVariant(record.reportType)}>
                {record.reportType}
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
