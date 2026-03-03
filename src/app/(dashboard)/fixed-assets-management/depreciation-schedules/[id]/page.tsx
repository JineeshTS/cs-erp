import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDepreciationSchedule } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

export default async function DepreciationScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getDepreciationSchedule(id, session.tenantId);
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
          href="/fixed-assets-management/depreciation-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.scheduleRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.assetName || "Depreciation Schedule"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fixed-assets-management/depreciation-schedules/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Schedule Ref</dt>
            <dd className="mt-1 text-gray-900">{record.scheduleRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Schedule Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.scheduleType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assetRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-gray-900">{record.assetName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.startDate
                ? new Date(record.startDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">End Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.endDate
                ? new Date(record.endDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Original Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.originalCost ?? "-"}
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
              Depreciable Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.depreciableAmount ?? "-"}
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
              Monthly Depreciation
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.monthlyDepreciation ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Annual Depreciation
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.annualDepreciation ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Accumulated Depreciation
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.accumulatedDepreciation ?? "-"}
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
              Depreciation Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.depreciationRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Calculated Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastCalculatedDate
                ? new Date(record.lastCalculatedDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "completed"
                      ? "secondary"
                      : "destructive"
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
