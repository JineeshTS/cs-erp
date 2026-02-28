import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capBayPlans } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function BayPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const [bp] = await db
    .select()
    .from(capBayPlans)
    .where(
      and(
        eq(capBayPlans.id, id),
        eq(capBayPlans.tenantId, session.tenantId),
        isNull(capBayPlans.deletedAt)
      )
    )
    .limit(1);

  if (!bp) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/bay-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Bay Plan</h1>
          <p className="text-sm text-gray-500">
            {bp.planType.replace(/_/g, " ")} &middot; BAPLIE{" "}
            {bp.baplieVersion ?? "N/A"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/bay-plans/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{bp.vesselScheduleId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Rotation ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {bp.portRotationId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              BAPLIE Version
            </dt>
            <dd className="mt-1 text-gray-900">
              {bp.baplieVersion ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan Type</dt>
            <dd className="mt-1 text-gray-900">
              {bp.planType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Slots</dt>
            <dd className="mt-1 text-gray-900">{bp.totalSlots ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Occupied Slots
            </dt>
            <dd className="mt-1 text-gray-900">{bp.occupiedSlots ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilization Percent
            </dt>
            <dd className="mt-1 text-gray-900">
              {bp.utilizationPercent != null
                ? `${bp.utilizationPercent}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              File Reference
            </dt>
            <dd className="mt-1 text-gray-900">
              {bp.fileReference ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Submitted At
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(bp.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Validated At
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(bp.validatedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  bp.status === "accepted" || bp.status === "validated"
                    ? "success"
                    : bp.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {bp.status}
              </Badge>
            </dd>
          </div>
          {bp.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {bp.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {bp.baplieData != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            BAPLIE Data
          </h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-xs text-gray-800">
            {JSON.stringify(
              bp.baplieData as Record<string, unknown>,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
