import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHaulageRate } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function HaulageRateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const { id } = await params;
  const record = await getHaulageRate(id, session.tenantId);
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
          href="/intermodal-icd-operations/haulage-rates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.rateName}
          </h1>
          <p className="text-sm text-gray-500">{record.rateRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/intermodal-icd-operations/haulage-rates/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Rate Ref</dt>
            <dd className="mt-1 text-gray-900">{record.rateRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate Name</dt>
            <dd className="mt-1 text-gray-900">{record.rateName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transport Mode
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.transportMode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Origin Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.originLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.destinationLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Size
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerSize || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rate Per Unit
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.ratePerUnit ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate Unit</dt>
            <dd className="mt-1 text-gray-900">{record.rateUnit || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fuel Surcharge %
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelSurchargePercent ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tolls</dt>
            <dd className="mt-1 text-gray-900">{record.tolls ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Carrier Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.carrierName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Carrier Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.carrierCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valid From</dt>
            <dd className="mt-1 text-gray-900">
              {record.validFrom
                ? new Date(record.validFrom).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valid To</dt>
            <dd className="mt-1 text-gray-900">
              {record.validTo
                ? new Date(record.validTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Minimum Charge
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.minimumCharge ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transit Time (days)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.transitTimeDays ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Terms & Conditions
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.termsAndConditions || "-"}
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
                    : record.status === "expired"
                      ? "destructive"
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
