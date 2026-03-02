import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHeavyLift } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
    case "approved":
      return "success" as const;
    case "cancelled":
      return "destructive" as const;
    case "in_progress":
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

export default async function HeavyLiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/");

  const record = await getHeavyLift(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "oog_special:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/oog-special-cargo-management/heavy-lifts"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{record.heavyLiftRef}</h1>
            <p className="text-sm text-gray-500">Heavy Lift Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          {canEdit && (
            <Link
              href={`/oog-special-cargo-management/heavy-lifts/${id}/edit`}
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
            <dd className="mt-1 text-sm text-gray-900">{record.heavyLiftRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Project Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.projectName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.customerName}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Cargo Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.cargoDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Number of Pieces</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.numberOfPieces ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Weight (kg)</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.totalWeightKg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Heaviest Piece (kg)</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.heaviestPieceKg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Longest Piece (cm)</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.longestPieceCm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Widest Piece (cm)</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.widestPieceCm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Tallest Piece (cm)</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.tallestPieceCm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Lifting Method</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.liftingMethod || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Crane Capacity (tons)</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.craneCapacityTons ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.originPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.destinationPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.voyageNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Est. Load Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(record.estimatedLoadDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Est. Discharge Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(record.estimatedDischargeDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Coordinator Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.coordinatorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Surveyor Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.surveyorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Survey Report URL</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.surveyReportUrl || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Insurance Coverage</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.insuranceCoverage || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Estimated Cost</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.estimatedCost ?? "-"}</dd>
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
