import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmHireStatements } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function HireStatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const hs = await db
    .select()
    .from(cvmHireStatements)
    .where(
      and(
        eq(cvmHireStatements.id, id),
        eq(cvmHireStatements.tenantId, session.tenantId),
        isNull(cvmHireStatements.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!hs) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/hire-statements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {hs.statementNumber}
          </h1>
          <p className="text-sm text-gray-500">Hire Statement</p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/hire-statements/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Statement Number</dt>
            <dd className="mt-1 text-gray-900">{hs.statementNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charter Party ID</dt>
            <dd className="mt-1 text-gray-900">{hs.charterPartyId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  hs.status === "final"
                    ? "success"
                    : hs.status === "draft"
                      ? "secondary"
                      : "default"
                }
              >
                {hs.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(hs.periodFrom).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(hs.periodTo).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Days</dt>
            <dd className="mt-1 text-gray-900">{hs.hireDays}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Rate</dt>
            <dd className="mt-1 text-gray-900">{hs.hireRate.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Hire</dt>
            <dd className="mt-1 text-gray-900">{hs.grossHire.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Off-Hire Deductions</dt>
            <dd className="mt-1 text-gray-900">
              {hs.offHireDeductions !== null
                ? hs.offHireDeductions.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker Adjustments</dt>
            <dd className="mt-1 text-gray-900">
              {hs.bunkerAdjustments !== null
                ? hs.bunkerAdjustments.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Other Deductions</dt>
            <dd className="mt-1 text-gray-900">
              {hs.otherDeductions !== null
                ? hs.otherDeductions.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Hire</dt>
            <dd className="mt-1 text-gray-900">{hs.netHire.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{hs.currency}</dd>
          </div>
          {hs.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {hs.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
