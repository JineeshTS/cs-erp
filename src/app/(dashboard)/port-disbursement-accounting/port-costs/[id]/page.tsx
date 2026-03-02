import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortCost } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function PortCostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const { id } = await params;

  const record = await getPortCost(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/port-costs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.costRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.portName} &middot; {record.costCategory}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-disbursement-accounting/port-costs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Cost Ref</dt>
            <dd className="mt-1 text-gray-900">{record.costRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">{record.portCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{record.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cost Category
            </dt>
            <dd className="mt-1 text-gray-900">{record.costCategory}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost Type</dt>
            <dd className="mt-1 text-gray-900">{record.costType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit Rate</dt>
            <dd className="mt-1 text-gray-900">
              {record.unitRate.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Unit of Measure
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.unitOfMeasure || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Minimum Charge
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.minimumCharge != null
                ? record.minimumCharge.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Maximum Charge
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.maximumCharge != null
                ? record.maximumCharge.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective From
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.effectiveFrom
                ? new Date(record.effectiveFrom).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective To
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.effectiveTo
                ? new Date(record.effectiveTo).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Size From
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselSizeFrom != null
                ? record.vesselSizeFrom.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Size To
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselSizeTo != null
                ? record.vesselSizeTo.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cargo Type Applicable
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cargoTypeApplicable || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Source Document
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.sourceDocument || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Verified Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastVerifiedDate
                ? new Date(record.lastVerifiedDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Verified By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastVerifiedBy || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {record.description || "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
