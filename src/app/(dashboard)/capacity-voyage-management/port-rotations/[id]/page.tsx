import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capPortRotations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

function fmtDateTime(d: Date | null): string {
  return d ? new Date(d).toLocaleString() : "-";
}

export default async function PortRotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const pr = await db
    .select()
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.id, id),
        eq(capPortRotations.tenantId, session.tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!pr) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/port-rotations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{pr.portName}</h1>
          <p className="text-sm text-gray-500">
            {pr.portCode} &middot; Sequence #{pr.sequenceNumber}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/port-rotations/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{pr.vesselScheduleId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">{pr.portCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{pr.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sequence Number
            </dt>
            <dd className="mt-1 text-gray-900">{pr.sequenceNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Arrival ETA</dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(pr.arrivalEta)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Departure ETD
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(pr.departureEtd)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Arrival
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(pr.actualArrival)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Departure
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(pr.actualDeparture)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Terminal Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {pr.terminalName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Berth Name</dt>
            <dd className="mt-1 text-gray-900">{pr.berthName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Call Purpose
            </dt>
            <dd className="mt-1 text-gray-900">{pr.callPurpose}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Time Zone</dt>
            <dd className="mt-1 text-gray-900">{pr.timeZone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  pr.status === "arrived" || pr.status === "berthed"
                    ? "success"
                    : pr.status === "departed"
                      ? "default"
                      : pr.status === "cancelled" || pr.status === "skipped"
                        ? "destructive"
                        : "secondary"
                }
              >
                {pr.status}
              </Badge>
            </dd>
          </div>
          {pr.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {pr.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
