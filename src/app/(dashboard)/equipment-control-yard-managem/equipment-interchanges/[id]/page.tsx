import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyEquipmentInterchanges } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function EquipmentInterchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const [ei] = await db
    .select()
    .from(eqyEquipmentInterchanges)
    .where(
      and(
        eq(eqyEquipmentInterchanges.id, id),
        eq(eqyEquipmentInterchanges.tenantId, session.tenantId),
        isNull(eqyEquipmentInterchanges.deletedAt)
      )
    )
    .limit(1);

  if (!ei) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/equipment-interchanges"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Equipment Interchange
          </h1>
          <p className="text-sm text-gray-500">
            {ei.interchangeReference} &middot;{" "}
            {ei.interchangeType.replace(/_/g, " ")}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/equipment-interchanges/${id}/edit`}
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
              Interchange Reference
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.interchangeReference}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Interchange Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.interchangeType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">{ei.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Party From</dt>
            <dd className="mt-1 text-gray-900">{ei.partyFrom}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Party To</dt>
            <dd className="mt-1 text-gray-900">{ei.partyTo}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Location Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.locationCode ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Location Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.locationName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Interchange Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(ei.interchangeDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Condition In
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.conditionIn ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Condition Out
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.conditionOut ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Damage Remarks
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {ei.damageRemarks ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Liability Party
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.liabilityParty ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Receipt Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {ei.receiptNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  ei.status === "accepted"
                    ? "success"
                    : ei.status === "disputed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {ei.status}
              </Badge>
            </dd>
          </div>
          {ei.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ei.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
