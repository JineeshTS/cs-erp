import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyagePerformance } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyagePerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getVoyagePerformance(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vpe:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/voyage-performances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.performanceRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.performanceType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/voyage-performances/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Performance Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.performanceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Performance Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.performanceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel ID</dt>
            <dd className="mt-1 text-gray-900">{record.vesselId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage ID</dt>
            <dd className="mt-1 text-gray-900">{record.voyageId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Charter Party ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.charterPartyId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CP Speed</dt>
            <dd className="mt-1 text-gray-900">{record.cpSpeed ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Speed
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualSpeed ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Speed Variance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.speedVariance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              CP Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cpConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Consumption Variance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.consumptionVariance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Good Weather Days
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.goodWeatherDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bad Weather Days
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.badWeatherDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Claim Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.claimAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Claim Currency
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.claimCurrency ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Claim Direction
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.claimDirection ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed"
                    ? "success"
                    : record.status === "in_progress"
                      ? "default"
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
