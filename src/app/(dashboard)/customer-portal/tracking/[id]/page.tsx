import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  getTracking,
  listTrackingEvents,
} from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "delivered":
      return "success" as const;
    case "returned":
      return "destructive" as const;
    case "in_transit":
      return "default" as const;
    case "customs_hold":
      return "warning" as const;
    case "at_port":
      return "secondary" as const;
    case "booked":
    default:
      return "secondary" as const;
  }
}

function formatDate(d: Date | null): string {
  if (!d) return "\u2014";
  return d.toLocaleDateString();
}

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/");

  const { id } = await params;

  const [tracking, events] = await Promise.all([
    getTracking(id, session.tenantId),
    listTrackingEvents(session.tenantId, id),
  ]);

  if (!tracking) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-portal/tracking"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {tracking.trackingNumber}
          </h1>
          <p className="text-sm text-gray-500">Shipment Tracking Detail</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Tracking Number
            </dt>
            <dd className="mt-1 text-gray-900">{tracking.trackingNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BL Number</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.blNumber ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {tracking.containerNumber ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.vesselName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Voyage Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {tracking.voyageNumber ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{tracking.originPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Port
            </dt>
            <dd className="mt-1 text-gray-900">{tracking.destinationPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Port</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.currentPort ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Status
            </dt>
            <dd className="mt-1">
              <Badge variant={statusBadgeVariant(tracking.currentStatus)}>
                {tracking.currentStatus.replace(/_/g, " ")}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ETA</dt>
            <dd className="mt-1 text-gray-900">{formatDate(tracking.eta)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ATA</dt>
            <dd className="mt-1 text-gray-900">{formatDate(tracking.ata)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ETD</dt>
            <dd className="mt-1 text-gray-900">{formatDate(tracking.etd)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ATD</dt>
            <dd className="mt-1 text-gray-900">{formatDate(tracking.atd)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is Active</dt>
            <dd className="mt-1">
              <Badge variant={tracking.isActive ? "success" : "secondary"}>
                {tracking.isActive ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.notes ?? "\u2014"}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Tracking Events ({events.length})
        </h2>
        {events.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No tracking events recorded for this shipment.
            </p>
          </div>
        ) : (
          <div className="space-y-0 rounded-lg border bg-white p-6">
            <div className="relative">
              {events.map((event, idx) => (
                <div key={event.id} className="relative flex gap-4 pb-6">
                  {idx < events.length - 1 && (
                    <div className="absolute start-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.eventDescription}
                        </p>
                        <p className="text-xs text-gray-500">
                          Code: {event.eventCode}
                          {event.location && (
                            <span>
                              {" "}
                              &middot; Location: {event.location}
                            </span>
                          )}
                          {event.portCode && (
                            <span>
                              {" "}
                              &middot; Port: {event.portCode}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {event.eventTime.toLocaleDateString()}{" "}
                          {event.eventTime.toLocaleTimeString()}
                        </span>
                        {event.isPublic ? (
                          <Badge variant="success">Public</Badge>
                        ) : (
                          <Badge variant="secondary">Internal</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
