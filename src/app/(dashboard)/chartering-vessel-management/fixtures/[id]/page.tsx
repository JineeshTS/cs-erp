import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmFixtures } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const fx = await db
    .select()
    .from(cvmFixtures)
    .where(
      and(
        eq(cvmFixtures.id, id),
        eq(cvmFixtures.tenantId, session.tenantId),
        isNull(cvmFixtures.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!fx) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/fixtures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {fx.fixtureReference}
          </h1>
          <p className="text-sm text-gray-500">
            {fx.fixtureType.replace(/_/g, " ")} &middot; {fx.counterpartyName}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/fixtures/${id}/edit`}
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
              Fixture Reference
            </dt>
            <dd className="mt-1 text-gray-900">{fx.fixtureReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel</dt>
            <dd className="mt-1 text-gray-900">{fx.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fixture Type</dt>
            <dd className="mt-1 text-gray-900">
              {fx.fixtureType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Counterparty</dt>
            <dd className="mt-1 text-gray-900">{fx.counterpartyName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Broker</dt>
            <dd className="mt-1 text-gray-900">{fx.brokerName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cargo Type</dt>
            <dd className="mt-1 text-gray-900">{fx.cargoType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cargo Quantity
            </dt>
            <dd className="mt-1 text-gray-900">
              {fx.cargoQuantity !== null ? fx.cargoQuantity.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Laycan From</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(fx.laycanFrom)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Laycan To</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(fx.laycanTo)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{fx.originPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Port
            </dt>
            <dd className="mt-1 text-gray-900">{fx.destinationPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Freight Rate</dt>
            <dd className="mt-1 text-gray-900">
              {fx.freightRate !== null
                ? `${fx.currency} ${fx.freightRate.toLocaleString()}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{fx.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commission %</dt>
            <dd className="mt-1 text-gray-900">
              {fx.commissionPercent ? `${fx.commissionPercent}%` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  fx.status === "fixed"
                    ? "success"
                    : fx.status === "failed" || fx.status === "withdrawn"
                      ? "destructive"
                      : "secondary"
                }
              >
                {fx.status}
              </Badge>
            </dd>
          </div>
          {fx.subjectDetails && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Subject Details
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {fx.subjectDetails}
              </dd>
            </div>
          )}
          {fx.terms && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Terms</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {fx.terms}
              </dd>
            </div>
          )}
          {fx.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {fx.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
