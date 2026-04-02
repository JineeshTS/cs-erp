import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMultiModalLogistic } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "delivered":
      return "success" as const;
    case "cancelled":
      return "destructive" as const;
    case "in_transit":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function formatDate(val: Date | string | null | undefined): string {
  if (!val) return "-";
  const d = typeof val === "string" ? new Date(val) : val;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function MultiModalLogisticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/");

  const record = await getMultiModalLogistic(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "oog_special:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/oog-special-cargo-management/multi-modal-logistics"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{record.logisticsRef}</h1>
            <p className="text-sm text-gray-500">Multi-Modal Logistic Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          {canEdit && (
            <Link
              href={`/oog-special-cargo-management/multi-modal-logistics/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.logisticsRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Acceptance Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.acceptanceRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Cargo Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.cargoDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Transport Mode</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.transportMode || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Carrier Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.carrierName || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Vehicle ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.vehicleId || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Origin Location</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.originLocation || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Destination Location</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.destinationLocation || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Permit Required</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.permitRequired ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Permit Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.permitNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Escort Required</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.escortRequired ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Est. Departure</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(record.estimatedDepartureAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Est. Arrival</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(record.estimatedArrivalAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Actual Departure</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(record.actualDepartureAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Actual Arrival</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(record.actualArrivalAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Transport Cost</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.transportCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
