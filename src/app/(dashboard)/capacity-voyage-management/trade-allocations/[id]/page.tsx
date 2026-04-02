import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capTradeAllocations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDateTime(d: Date | null): string {
  return d ? new Date(d).toLocaleString() : "-";
}

export default async function TradeAllocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const ta = await db
    .select()
    .from(capTradeAllocations)
    .where(
      and(
        eq(capTradeAllocations.id, id),
        eq(capTradeAllocations.tenantId, session.tenantId),
        isNull(capTradeAllocations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ta) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/trade-allocations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{ta.tradeLane}</h1>
          <p className="text-sm text-gray-500">
            {ta.originRegion || "N/A"} &rarr;{" "}
            {ta.destinationRegion || "N/A"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/trade-allocations/${id}/edit`}
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
              {ta.vesselScheduleId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Lane</dt>
            <dd className="mt-1 text-gray-900">{ta.tradeLane}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Origin Region
            </dt>
            <dd className="mt-1 text-gray-900">
              {ta.originRegion || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Region
            </dt>
            <dd className="mt-1 text-gray-900">
              {ta.destinationRegion || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocated TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {ta.allocatedTeu?.toLocaleString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocated Weight (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {ta.allocatedWeightMt?.toLocaleString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilized TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {ta.utilizedTeu?.toLocaleString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilized Weight (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {ta.utilizedWeightMt?.toLocaleString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocation Type
            </dt>
            <dd className="mt-1 text-gray-900">{ta.allocationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective From
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(ta.effectiveFrom)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective To
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(ta.effectiveTo)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">{ta.priority ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  ta.status === "active"
                    ? "success"
                    : ta.status === "suspended"
                      ? "destructive"
                      : "secondary"
                }
              >
                {ta.status}
              </Badge>
            </dd>
          </div>
          {ta.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ta.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
