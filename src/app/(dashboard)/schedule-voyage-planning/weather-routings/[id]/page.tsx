import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getWeatherRouting } from "@/lib/schedule-voyage-planning/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function WeatherRoutingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:read")))
    redirect("/schedule-voyage-planning");

  const { id } = await params;

  const record = await getWeatherRouting(id, session.tenantId);
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
          href="/schedule-voyage-planning/weather-routings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.routingRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.routingType?.replace(/_/g, " ")} &middot; {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/schedule-voyage-planning/weather-routings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Routing Ref</dt>
            <dd className="mt-1 text-gray-900">{record.routingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Routing Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.routingType?.replace(/_/g, " ")}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Departure Port</dt>
            <dd className="mt-1 text-gray-900">{record.departurePort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Arrival Port</dt>
            <dd className="mt-1 text-gray-900">{record.arrivalPort || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Recommended Route</dt>
            <dd className="mt-1 text-gray-900">{record.recommendedRoute || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Distance NM</dt>
            <dd className="mt-1 text-gray-900">{record.distanceNm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weather Severity</dt>
            <dd className="mt-1 text-gray-900">{record.weatherSeverity || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Wave Height (m)</dt>
            <dd className="mt-1 text-gray-900">{record.waveHeightM ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Wind Speed (knots)</dt>
            <dd className="mt-1 text-gray-900">{record.windSpeedKnots ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Route Provider</dt>
            <dd className="mt-1 text-gray-900">{record.routeProvider || "-"}</dd>
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
