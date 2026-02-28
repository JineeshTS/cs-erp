import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmOffHireEvents } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OffHireEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const oh = await db
    .select()
    .from(cvmOffHireEvents)
    .where(
      and(
        eq(cvmOffHireEvents.id, id),
        eq(cvmOffHireEvents.tenantId, session.tenantId),
        isNull(cvmOffHireEvents.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!oh) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/off-hire-events"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Off-Hire Event - {oh.eventType}
          </h1>
          <p className="text-sm text-gray-500">
            {oh.vesselName || "Unknown vessel"} &middot;{" "}
            {new Date(oh.startAt).toLocaleDateString()}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/off-hire-events/${id}/edit`}
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
              Charter Party ID
            </dt>
            <dd className="mt-1 text-gray-900">{oh.charterPartyId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{oh.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Event Type</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{oh.eventType}</Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {oh.reason}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Start At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(oh.startAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">End At</dt>
            <dd className="mt-1 text-gray-900">
              {oh.endAt ? new Date(oh.endAt).toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Off-Hire Days
            </dt>
            <dd className="mt-1 text-gray-900">{oh.offHireDays || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Rate</dt>
            <dd className="mt-1 text-gray-900">
              {oh.hireRate !== null ? oh.hireRate.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Off-Hire Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {oh.offHireAmount !== null
                ? oh.offHireAmount.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{oh.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Claim Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  oh.claimStatus === "settled"
                    ? "success"
                    : oh.claimStatus === "disputed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {oh.claimStatus}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Claim Reference
            </dt>
            <dd className="mt-1 text-gray-900">
              {oh.claimReference || "-"}
            </dd>
          </div>
          {oh.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {oh.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
