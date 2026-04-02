import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortStayAnalysis } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  completed: "success",
  in_progress: "warning",
  cancelled: "destructive",
} as const;

export default async function PortStayAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const { id } = await params;

  const analysis = await getPortStayAnalysis(id, session.tenantId);
  if (!analysis) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "liner:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/port-stay-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {analysis.vesselName} - {analysis.portName}
          </h1>
          <p className="text-sm text-gray-500">{analysis.analysisRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-trade-route-management/port-stay-analyses/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{analysis.analysisRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{analysis.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{analysis.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Country</dt>
            <dd className="mt-1 text-gray-900">
              {analysis.portCountry ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Terminal Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.terminalName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Arrival Date</dt>
            <dd className="mt-1 text-gray-900">
              {analysis.arrivalDate
                ? new Date(analysis.arrivalDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Departure Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.departureDate
                ? new Date(analysis.departureDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Port Stay Hours
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.totalPortStayHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Waiting Time Hours
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.waitingTimeHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Berthing Time Hours
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.berthingTimeHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cargo Ops Hours
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.cargoOpsHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Containers Moved
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.containersMoved ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Moves Per Hour
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.movesPerHour ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Delay Hours
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.totalDelayHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bunker Consumed
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.bunkerConsumed ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Cost Estimate
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.portCostEstimate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {analysis.currency ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Productivity Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.productivityScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Benchmark Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {analysis.benchmarkScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    analysis.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {analysis.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {analysis.notes ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
