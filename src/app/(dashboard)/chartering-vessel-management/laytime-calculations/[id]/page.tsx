import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmLaytimeCalculations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LaytimeCalculationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const lc = await db
    .select()
    .from(cvmLaytimeCalculations)
    .where(
      and(
        eq(cvmLaytimeCalculations.id, id),
        eq(cvmLaytimeCalculations.tenantId, session.tenantId),
        isNull(cvmLaytimeCalculations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!lc) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/laytime-calculations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {lc.portName}
          </h1>
          <p className="text-sm text-gray-500">
            Laytime Calculation &middot; {lc.operationType}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/laytime-calculations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Charter Party ID</dt>
            <dd className="mt-1 text-gray-900">{lc.charterPartyId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Estimate ID</dt>
            <dd className="mt-1 text-gray-900">{lc.voyageEstimateId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{lc.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Operation Type</dt>
            <dd className="mt-1 text-gray-900">{lc.operationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  lc.status === "settled"
                    ? "success"
                    : lc.status === "calculating"
                      ? "secondary"
                      : "default"
                }
              >
                {lc.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Allowed Hours</dt>
            <dd className="mt-1 text-gray-900">{lc.allowedHours}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Used Hours</dt>
            <dd className="mt-1 text-gray-900">{lc.usedHours}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Excess Hours</dt>
            <dd className="mt-1 text-gray-900">{lc.excessHours || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Demurrage Rate</dt>
            <dd className="mt-1 text-gray-900">
              {lc.demurrageRate !== null
                ? lc.demurrageRate.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Despatch Rate</dt>
            <dd className="mt-1 text-gray-900">
              {lc.despatchRate !== null
                ? lc.despatchRate.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Demurrage Amount</dt>
            <dd className="mt-1 text-gray-900">
              {lc.demurrageAmount !== null
                ? lc.demurrageAmount.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Despatch Amount</dt>
            <dd className="mt-1 text-gray-900">
              {lc.despatchAmount !== null
                ? lc.despatchAmount.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{lc.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commenced At</dt>
            <dd className="mt-1 text-gray-900">
              {lc.commencedAt
                ? new Date(lc.commencedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed At</dt>
            <dd className="mt-1 text-gray-900">
              {lc.completedAt
                ? new Date(lc.completedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          {lc.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {lc.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
