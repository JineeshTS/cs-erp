import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capSpaceControls } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDateTime(d: Date | null): string {
  return d ? new Date(d).toLocaleString() : "-";
}

export default async function SpaceControlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const sc = await db
    .select()
    .from(capSpaceControls)
    .where(
      and(
        eq(capSpaceControls.id, id),
        eq(capSpaceControls.tenantId, session.tenantId),
        isNull(capSpaceControls.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!sc) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/space-controls"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {sc.bookingReference}
          </h1>
          <p className="text-sm text-gray-500">
            {sc.containerType} &middot; {sc.containerSize} &middot;{" "}
            {sc.quantityTeu} TEU
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/space-controls/${id}/edit`}
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
              {sc.vesselScheduleId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Rotation ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {sc.portRotationId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Booking Reference
            </dt>
            <dd className="mt-1 text-gray-900">{sc.bookingReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type
            </dt>
            <dd className="mt-1 text-gray-900">{sc.containerType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Size
            </dt>
            <dd className="mt-1 text-gray-900">{sc.containerSize}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Quantity (TEU)
            </dt>
            <dd className="mt-1 text-gray-900">{sc.quantityTeu}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Weight (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {sc.weightMt?.toLocaleString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Shipper Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {sc.shipperName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Consignee Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {sc.consigneeName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commodity</dt>
            <dd className="mt-1 text-gray-900">{sc.commodity || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hazmat Class
            </dt>
            <dd className="mt-1 text-gray-900">
              {sc.hazmatClass || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reefer Temp
            </dt>
            <dd className="mt-1 text-gray-900">
              {sc.reeferTemp != null ? `${sc.reeferTemp}` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Booking Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(sc.bookingDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cut-Off Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(sc.cutOffDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  sc.status === "confirmed"
                    ? "success"
                    : sc.status === "rejected" || sc.status === "cancelled"
                      ? "destructive"
                      : sc.status === "waitlisted"
                        ? "warning"
                        : "secondary"
                }
              >
                {sc.status}
              </Badge>
            </dd>
          </div>
          {sc.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {sc.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
