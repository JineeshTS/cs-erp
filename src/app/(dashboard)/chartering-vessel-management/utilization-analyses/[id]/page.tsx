import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmUtilizationAnalyses } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function UtilizationAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const ua = await db
    .select()
    .from(cvmUtilizationAnalyses)
    .where(
      and(
        eq(cvmUtilizationAnalyses.id, id),
        eq(cvmUtilizationAnalyses.tenantId, session.tenantId),
        isNull(cvmUtilizationAnalyses.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ua) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/utilization-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{ua.vesselName}</h1>
          <p className="text-sm text-gray-500">
            Analysis: {new Date(ua.analysisDate).toLocaleDateString()}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/utilization-analyses/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel</dt>
            <dd className="mt-1 text-gray-900">{ua.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analysis Date</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(ua.analysisDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(ua.periodFrom)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(ua.periodTo)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Utilization %
            </dt>
            <dd className="mt-1 text-gray-900">
              {ua.currentUtilizationPercent
                ? `${ua.currentUtilizationPercent}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Projected Utilization %
            </dt>
            <dd className="mt-1 text-gray-900">
              {ua.projectedUtilizationPercent
                ? `${ua.projectedUtilizationPercent}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Recommended Route
            </dt>
            <dd className="mt-1 text-gray-900">
              {ua.recommendedRoute || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Projected Revenue Impact
            </dt>
            <dd className="mt-1 text-gray-900">
              {ua.projectedRevenueImpact !== null
                ? `${ua.currency} ${ua.projectedRevenueImpact.toLocaleString()}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{ua.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Model</dt>
            <dd className="mt-1 text-gray-900">{ua.aiModel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  ua.status === "completed"
                    ? "success"
                    : ua.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {ua.status}
              </Badge>
            </dd>
          </div>
          {ua.recommendedAction && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Recommended Action
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ua.recommendedAction}
              </dd>
            </div>
          )}
          {ua.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ua.notes}
              </dd>
            </div>
          )}
          {ua.parameters != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Parameters (JSON)
              </dt>
              <dd className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 font-mono text-xs text-gray-900">
                <pre>{JSON.stringify(ua.parameters as Record<string, unknown>, null, 2)}</pre>
              </dd>
            </div>
          )}
          {ua.results != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Results (JSON)
              </dt>
              <dd className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 font-mono text-xs text-gray-900">
                <pre>{JSON.stringify(ua.results as Record<string, unknown>, null, 2)}</pre>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
