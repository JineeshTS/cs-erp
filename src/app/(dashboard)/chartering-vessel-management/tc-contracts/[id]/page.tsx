import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmTcContracts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function TcContractDetailPage({
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
    .from(cvmTcContracts)
    .where(
      and(
        eq(cvmTcContracts.id, id),
        eq(cvmTcContracts.tenantId, session.tenantId),
        isNull(cvmTcContracts.deletedAt)
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
          href="/chartering-vessel-management/tc-contracts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {row.contractReference}
          </h1>
          <p className="text-sm text-gray-500">
            TC Contract &middot; {row.direction.replace(/_/g, " ").toUpperCase()} &middot; {row.counterpartyName}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/tc-contracts/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Direction</dt>
            <dd className="mt-1 text-gray-900">
              {row.direction.replace(/_/g, " ").toUpperCase()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contract Reference</dt>
            <dd className="mt-1 text-gray-900">{row.contractReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{row.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Counterparty Name</dt>
            <dd className="mt-1 text-gray-900">{row.counterpartyName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Broker Name</dt>
            <dd className="mt-1 text-gray-900">{row.brokerName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Rate</dt>
            <dd className="mt-1 text-gray-900">
              {row.hireRate.toLocaleString()} {row.currency}/{row.hirePeriodUnit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{row.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Period Unit</dt>
            <dd className="mt-1 text-gray-900">{row.hirePeriodUnit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Port</dt>
            <dd className="mt-1 text-gray-900">{row.deliveryPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Redelivery Port</dt>
            <dd className="mt-1 text-gray-900">{row.redeliveryPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(row.deliveryDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Redelivery Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(row.redeliveryDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Min Duration</dt>
            <dd className="mt-1 text-gray-900">
              {row.minDuration !== null ? `${row.minDuration} ${row.durationUnit}` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Max Duration</dt>
            <dd className="mt-1 text-gray-900">
              {row.maxDuration !== null ? `${row.maxDuration} ${row.durationUnit}` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commission %</dt>
            <dd className="mt-1 text-gray-900">
              {row.commissionPercent ? `${row.commissionPercent}%` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  row.status === "active"
                    ? "success"
                    : row.status === "negotiating"
                      ? "secondary"
                      : row.status === "terminated"
                        ? "destructive"
                        : "default"
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
