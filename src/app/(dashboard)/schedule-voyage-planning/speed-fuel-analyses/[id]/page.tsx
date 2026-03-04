import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSpeedFuelAnalysis } from "@/lib/schedule-voyage-planning/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function SpeedFuelAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:read")))
    redirect("/schedule-voyage-planning");

  const { id } = await params;

  const record = await getSpeedFuelAnalysis(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "svp:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/speed-fuel-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.analysisRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.analysisType?.replace(/_/g, " ")} &middot; {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/schedule-voyage-planning/speed-fuel-analyses/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Analysis Ref</dt>
            <dd className="mt-1 text-gray-900">{record.analysisRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analysis Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.analysisType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{record.voyageRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Speed (Knots)</dt>
            <dd className="mt-1 text-gray-900">{record.speedKnots ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Consumption (MT)</dt>
            <dd className="mt-1 text-gray-900">{record.fuelConsumptionMt ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Cost Per Day</dt>
            <dd className="mt-1 text-gray-900">{record.fuelCostPerDay ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Time Saving (Hours)</dt>
            <dd className="mt-1 text-gray-900">{record.timeSavingHours ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CO2 Emissions (MT)</dt>
            <dd className="mt-1 text-gray-900">{record.co2EmissionsMt ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Optimal Speed</dt>
            <dd className="mt-1 text-gray-900">{record.optimalSpeed ?? "-"}</dd>
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
