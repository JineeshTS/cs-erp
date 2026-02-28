import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmCargoTrackingEvents } from "@/db/schema";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function CargoTrackingEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/operations-documentation");

  const { id } = await params;

  const record = await db
    .select()
    .from(odmCargoTrackingEvents)
    .where(
      and(
        eq(odmCargoTrackingEvents.id, id),
        eq(odmCargoTrackingEvents.tenantId, session.tenantId),
        isNull(odmCargoTrackingEvents.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "operations:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "operations:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/operations-documentation/cargo-tracking-events"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.eventCode}
          </h1>
          <p className="text-sm text-gray-500">
            {record.eventType} &middot; {fmtDate(record.eventDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/operations-documentation/cargo-tracking-events/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/operations-documentation/cargo-tracking-events/${id}`}
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Event Code</dt>
            <dd className="mt-1 text-gray-900">{record.eventCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Event Type</dt>
            <dd className="mt-1 text-gray-900">{record.eventType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Event Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.eventDescription ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Event Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.eventLocation ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Event Port</dt>
            <dd className="mt-1 text-gray-900">{record.eventPort ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Event Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.eventDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reported By</dt>
            <dd className="mt-1 text-gray-900">
              {record.reportedBy ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Voyage Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is Actual</dt>
            <dd className="mt-1 text-gray-900">
              {record.isActual ? "Yes" : "No"}
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
