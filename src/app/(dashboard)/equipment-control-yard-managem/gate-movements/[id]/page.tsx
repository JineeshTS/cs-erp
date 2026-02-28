import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyGateMovements } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function GateMovementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const [gm] = await db
    .select()
    .from(eqyGateMovements)
    .where(
      and(
        eq(eqyGateMovements.id, id),
        eq(eqyGateMovements.tenantId, session.tenantId),
        isNull(eqyGateMovements.deletedAt)
      )
    )
    .limit(1);

  if (!gm) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/gate-movements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Gate Movement</h1>
          <p className="text-sm text-gray-500">
            {gm.movementReference} &middot;{" "}
            {gm.movementType.replace(/_/g, " ")}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/gate-movements/${id}/edit`}
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
              Movement Reference
            </dt>
            <dd className="mt-1 text-gray-900">{gm.movementReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Movement Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {gm.movementType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">{gm.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vehicle Plate
            </dt>
            <dd className="mt-1 text-gray-900">
              {gm.vehiclePlate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Driver Name</dt>
            <dd className="mt-1 text-gray-900">{gm.driverName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transport Company
            </dt>
            <dd className="mt-1 text-gray-900">
              {gm.transportCompany ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seal Number</dt>
            <dd className="mt-1 text-gray-900">{gm.sealNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              VGM Weight (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {gm.vgmWeightKg != null ? gm.vgmWeightKg : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gate Code</dt>
            <dd className="mt-1 text-gray-900">{gm.gateCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lane Number</dt>
            <dd className="mt-1 text-gray-900">{gm.laneNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Result
            </dt>
            <dd className="mt-1 text-gray-900">
              {gm.inspectionResult
                ? gm.inspectionResult.replace(/_/g, " ")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              CODECO Message ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {gm.codecoMessageId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              EDI Reference
            </dt>
            <dd className="mt-1 text-gray-900">{gm.ediReference ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Movement Timestamp
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(gm.movementTimestamp)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  gm.status === "completed"
                    ? "success"
                    : gm.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {gm.status}
              </Badge>
            </dd>
          </div>
          {gm.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {gm.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
