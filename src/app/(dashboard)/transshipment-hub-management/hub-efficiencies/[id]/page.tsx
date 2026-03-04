import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHubEfficiency } from "@/lib/transshipment-hub-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function HubEfficiencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:read")))
    redirect("/transshipment-hub-management");

  const { id } = await params;

  const record = await getHubEfficiency(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "thm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/hub-efficiencies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.efficiencyRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.efficiencyType?.replace(/_/g, " ")} &middot; {record.hubPort || "No hub port"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/transshipment-hub-management/hub-efficiencies/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Efficiency Ref</dt>
            <dd className="mt-1 text-gray-900">{record.efficiencyRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Efficiency Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.efficiencyType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hub Port</dt>
            <dd className="mt-1 text-gray-900">{record.hubPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodStart ? record.periodStart.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodEnd ? record.periodEnd.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Throughput TEU</dt>
            <dd className="mt-1 text-gray-900">{record.throughputTeu ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Avg Dwell Hours</dt>
            <dd className="mt-1 text-gray-900">{record.avgDwellHours ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Crane Moves/Hour</dt>
            <dd className="mt-1 text-gray-900">{record.craneMovesPerHour ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Berth Utilization %</dt>
            <dd className="mt-1 text-gray-900">{record.berthUtilizationPct ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Yard Occupancy %</dt>
            <dd className="mt-1 text-gray-900">{record.yardOccupancyPct ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
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
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
