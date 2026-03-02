import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDetentionTracking } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  active: "warning",
  completed: "success",
  invoiced: "secondary",
  closed: "destructive",
};

export default async function DetentionTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { id } = await params;

  const tracking = await getDetentionTracking(id, session.tenantId);
  if (!tracking) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/detention-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {tracking.trackingRef}
          </h1>
          <p className="text-sm text-gray-500">
            Detention Tracking &middot; {tracking.containerNumber}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/demurrage-detention-management/detention-trackings/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tracking Ref</dt>
            <dd className="mt-1 text-gray-900">{tracking.trackingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{tracking.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Size</dt>
            <dd className="mt-1 text-gray-900">{tracking.containerSize ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Type</dt>
            <dd className="mt-1 text-gray-900">{tracking.containerType ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{tracking.bookingRef ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BL Number</dt>
            <dd className="mt-1 text-gray-900">{tracking.blNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{tracking.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gate Out Date</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.gateOutDate
                ? new Date(tracking.gateOutDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gate In Date</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.gateInDate
                ? new Date(tracking.gateInDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Free Time Days</dt>
            <dd className="mt-1 text-gray-900">{tracking.freeTimeDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Free Time Expiry</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.freeTimeExpiry
                ? new Date(tracking.freeTimeExpiry).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Detention Days</dt>
            <dd className="mt-1 text-gray-900">{tracking.detentionDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Daily Rate</dt>
            <dd className="mt-1 text-gray-900">{tracking.dailyRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.currency} {tracking.totalAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{tracking.currency ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Depot Name</dt>
            <dd className="mt-1 text-gray-900">{tracking.depotName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Depot Location</dt>
            <dd className="mt-1 text-gray-900">{tracking.depotLocation ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Condition</dt>
            <dd className="mt-1 text-gray-900">{tracking.containerCondition ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={STATUS_VARIANT[tracking.status] ?? "secondary"}
              >
                {tracking.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Damage Notes</dt>
            <dd className="mt-1 text-gray-900">
              {tracking.damageNotes ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{tracking.notes ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
