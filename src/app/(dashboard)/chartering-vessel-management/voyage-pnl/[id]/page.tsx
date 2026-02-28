import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmVoyagePnl } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

function fmtAmt(v: number | null): string {
  return v !== null ? v.toLocaleString() : "-";
}

export default async function VoyagePnlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const row = await db
    .select()
    .from(cvmVoyagePnl)
    .where(
      and(
        eq(cvmVoyagePnl.id, id),
        eq(cvmVoyagePnl.tenantId, session.tenantId),
        isNull(cvmVoyagePnl.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!row) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/voyage-pnl"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {row.voyageNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Voyage P&amp;L &middot; {row.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/voyage-pnl/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      {/* Detail */}
      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Estimate ID</dt>
            <dd className="mt-1 text-gray-900">{row.voyageEstimateId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{row.voyageNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{row.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Revenue</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.revenue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Cost</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.hireCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker Cost</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.bunkerCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Cost</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.portCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Canal Cost</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.canalCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agency Cost</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.agencyCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Insurance Cost</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.insuranceCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Other Costs</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.otherCosts)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Costs</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.totalCosts)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Result</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.netResult)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">TCE Rate</dt>
            <dd className="mt-1 text-gray-900">{fmtAmt(row.tceRate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{row.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(row.periodFrom)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(row.periodTo)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  row.status === "final"
                    ? "success"
                    : row.status === "closed"
                      ? "default"
                      : "secondary"
                }
              >
                {row.status}
              </Badge>
            </dd>
          </div>
          {row.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {row.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
