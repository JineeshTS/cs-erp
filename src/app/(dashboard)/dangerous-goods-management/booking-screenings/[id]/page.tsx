import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBookingScreening } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BookingScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const record = await getBookingScreening(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/booking-screenings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.screeningRef}</h1>
          <p className="text-sm text-gray-500">
            Booking {record.bookingRef} &middot; {record.customerName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/dangerous-goods-management/booking-screenings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Screening Ref</dt>
            <dd className="mt-1 text-gray-900">{record.screeningRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bookingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{record.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">UN Number</dt>
            <dd className="mt-1 text-gray-900">{record.unNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Proper Shipping Name</dt>
            <dd className="mt-1 text-gray-900">{record.properShippingName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Class</dt>
            <dd className="mt-1 text-gray-900">{record.imdgClass}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Packing Group</dt>
            <dd className="mt-1 text-gray-900">{record.packingGroup || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Weight</dt>
            <dd className="mt-1 text-gray-900">{record.grossWeight || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Weight</dt>
            <dd className="mt-1 text-gray-900">{record.netWeight || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weight Unit</dt>
            <dd className="mt-1 text-gray-900">{record.weightUnit || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Number of Packages</dt>
            <dd className="mt-1 text-gray-900">{record.numberOfPackages ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Package Type</dt>
            <dd className="mt-1 text-gray-900">{record.packageType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Marine Pollutant</dt>
            <dd className="mt-1">
              <Badge variant={record.marinePollutant ? "destructive" : "secondary"}>
                {record.marinePollutant ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Limited Quantity</dt>
            <dd className="mt-1">
              <Badge variant={record.limitedQuantity ? "success" : "secondary"}>
                {record.limitedQuantity ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{record.originPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">{record.destinationPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{record.voyageNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Screening Result</dt>
            <dd className="mt-1">
              {record.screeningResult ? (
                <Badge
                  variant={
                    record.screeningResult === "approved"
                      ? "success"
                      : record.screeningResult === "rejected"
                        ? "destructive"
                        : record.screeningResult === "conditional"
                          ? "warning"
                          : "secondary"
                  }
                >
                  {record.screeningResult}
                </Badge>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
            <dd className="mt-1 text-gray-900">{record.riskScore || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Screened By</dt>
            <dd className="mt-1 text-gray-900">{record.screenedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Screened At</dt>
            <dd className="mt-1 text-gray-900">
              {record.screenedAt
                ? new Date(record.screenedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">{record.approvedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : record.status === "conditional"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Screening Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.screeningNotes || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
