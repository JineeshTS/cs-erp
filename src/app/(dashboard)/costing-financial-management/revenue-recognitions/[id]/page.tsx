import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRevenueRecognition } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "recognized":
      return "success";
    case "deferred":
      return "warning";
    case "reversed":
      return "destructive";
    default:
      return "secondary";
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || "--"}</dd>
    </div>
  );
}

export default async function RevenueRecognitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const record = await getRevenueRecognition(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:create"
  );

  const basePath = "/costing-financial-management/revenue-recognitions";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={basePath}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.recognitionRef}
            </h1>
            <p className="text-sm text-gray-500">Revenue Recognition Detail</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>
            {record.status}
          </Badge>
          {canEdit && (
            <Link
              href={`${basePath}/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          General Information
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Recognition Ref" value={record.recognitionRef} />
          <DetailRow label="Voyage Ref" value={record.voyageRef} />
          <DetailRow label="Booking Ref" value={record.bookingRef} />
          <DetailRow label="BL Number" value={record.blNumber} />
          <DetailRow label="Customer Name" value={record.customerName} />
          <DetailRow label="Revenue Type" value={record.revenueType} />
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Financial Details
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Currency" value={record.currency} />
          <DetailRow
            label="Gross Revenue"
            value={record.grossRevenue?.toLocaleString()}
          />
          <DetailRow
            label="Deductions"
            value={record.deductions?.toLocaleString()}
          />
          <DetailRow
            label="Net Revenue"
            value={record.netRevenue?.toLocaleString()}
          />
          <DetailRow
            label="Recognized Amount"
            value={record.recognizedAmount?.toLocaleString()}
          />
          <DetailRow
            label="Deferred Amount"
            value={record.deferredAmount?.toLocaleString()}
          />
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recognition Details
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow
            label="Recognition Method"
            value={record.recognitionMethod?.replace(/_/g, " ")}
          />
          <DetailRow
            label="Performance Obligation"
            value={record.performanceObligation}
          />
          <DetailRow
            label="Completion %"
            value={
              record.completionPercent != null
                ? `${record.completionPercent}%`
                : null
            }
          />
          <DetailRow
            label="Recognition Period"
            value={record.recognitionPeriod}
          />
          <DetailRow
            label="Journal Entry Ref"
            value={record.journalEntryRef}
          />
          <DetailRow label="Status" value={record.status} />
          <DetailRow
            label="Recognized At"
            value={
              record.recognizedAt
                ? new Date(record.recognizedAt).toLocaleString()
                : null
            }
          />
        </dl>
      </div>

      {record.notes && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {record.notes}
          </p>
        </div>
      )}
    </div>
  );
}
