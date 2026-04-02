import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyYardSlots } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function YardSlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const [ys] = await db
    .select()
    .from(eqyYardSlots)
    .where(
      and(
        eq(eqyYardSlots.id, id),
        eq(eqyYardSlots.tenantId, session.tenantId),
        isNull(eqyYardSlots.deletedAt)
      )
    )
    .limit(1);

  if (!ys) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/yard-slots"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Yard Slot</h1>
          <p className="text-sm text-gray-500">
            {ys.yardCode} &middot; {ys.yardName}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/yard-slots/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Yard Code</dt>
            <dd className="mt-1 text-gray-900">{ys.yardCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Yard Name</dt>
            <dd className="mt-1 text-gray-900">{ys.yardName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Terminal Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {ys.terminalCode ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Block Code</dt>
            <dd className="mt-1 text-gray-900">{ys.blockCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bay Code</dt>
            <dd className="mt-1 text-gray-900">{ys.bayCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Row Code</dt>
            <dd className="mt-1 text-gray-900">{ys.rowCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tier Code</dt>
            <dd className="mt-1 text-gray-900">{ys.tierCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Slot Capacity
            </dt>
            <dd className="mt-1 text-gray-900">{ys.slotCapacity ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Occupancy
            </dt>
            <dd className="mt-1 text-gray-900">
              {ys.currentOccupancy ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slot Type</dt>
            <dd className="mt-1 text-gray-900">
              {ys.slotType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Assigned Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {ys.assignedContainerNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reserved For
            </dt>
            <dd className="mt-1 text-gray-900">
              {ys.reservedFor ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reserved Until
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(ys.reservedUntil)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  ys.status === "available"
                    ? "success"
                    : ys.status === "blocked" || ys.status === "maintenance"
                      ? "destructive"
                      : "secondary"
                }
              >
                {ys.status}
              </Badge>
            </dd>
          </div>
          {ys.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ys.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
