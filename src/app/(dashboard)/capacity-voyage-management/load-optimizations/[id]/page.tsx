import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capLoadOptimizations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LoadOptimizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const lo = await db
    .select()
    .from(capLoadOptimizations)
    .where(
      and(
        eq(capLoadOptimizations.id, id),
        eq(capLoadOptimizations.tenantId, session.tenantId),
        isNull(capLoadOptimizations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!lo) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/load-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {lo.optimizationRunId ?? "Optimization Run"}
          </h1>
          <p className="text-sm text-gray-500">
            {lo.objective} &middot; {lo.algorithm ?? "No algorithm"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/load-optimizations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Vessel Schedule ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.vesselScheduleId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Optimization Run ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.optimizationRunId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Algorithm</dt>
            <dd className="mt-1 text-gray-900">{lo.algorithm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Objective</dt>
            <dd className="mt-1 text-gray-900">{lo.objective}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total TEU Before
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.totalTeuBefore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total TEU After
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.totalTeuAfter ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Improvement %
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.improvementPercent != null
                ? `${Number(lo.improvementPercent)}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Revenue Impact
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.revenueImpact ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{lo.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Model</dt>
            <dd className="mt-1 text-gray-900">{lo.aiModel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started At</dt>
            <dd className="mt-1 text-gray-900">
              {lo.startedAt
                ? new Date(lo.startedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Completed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {lo.completedAt
                ? new Date(lo.completedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  lo.status === "completed"
                    ? "success"
                    : lo.status === "failed"
                      ? "destructive"
                      : lo.status === "running"
                        ? "default"
                        : "secondary"
                }
              >
                {lo.status}
              </Badge>
            </dd>
          </div>
          {lo.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {lo.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {lo.inputParameters != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-500">
            Input Parameters
          </h2>
          <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(
              lo.inputParameters as Record<string, unknown>,
              null,
              2
            )}
          </pre>
        </div>
      )}

      {lo.results != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Results</h2>
          <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(
              lo.results as Record<string, unknown>,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
