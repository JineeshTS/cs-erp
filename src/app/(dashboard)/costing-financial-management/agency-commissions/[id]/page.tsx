import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgencyCommission } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "approved":
      return "success";
    case "paid":
      return "default";
    case "cancelled":
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

export default async function AgencyCommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const record = await getAgencyCommission(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:create"
  );

  const basePath = "/costing-financial-management/agency-commissions";

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
              {record.commissionRef}
            </h1>
            <p className="text-sm text-gray-500">Agency Commission Detail</p>
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
          Agent Information
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Commission Ref" value={record.commissionRef} />
          <DetailRow label="Agent Name" value={record.agentName} />
          <DetailRow label="Agent Code" value={record.agentCode} />
          <DetailRow label="Voyage Ref" value={record.voyageRef} />
          <DetailRow label="Port" value={record.port} />
          <DetailRow label="Commission Type" value={record.commissionType} />
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Financial Details
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Currency" value={record.currency} />
          <DetailRow
            label="Base Amount"
            value={record.baseAmount?.toLocaleString()}
          />
          <DetailRow
            label="Commission Rate"
            value={record.commissionRate?.toLocaleString()}
          />
          <DetailRow
            label="Commission Amount"
            value={record.commissionAmount?.toLocaleString()}
          />
          <DetailRow
            label="Tax Amount"
            value={record.taxAmount?.toLocaleString()}
          />
          <DetailRow
            label="Net Payable"
            value={record.netPayable?.toLocaleString()}
          />
          <DetailRow label="Invoice Ref" value={record.invoiceRef} />
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Status & Dates
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Status" value={record.status} />
          <DetailRow
            label="Approved At"
            value={
              record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : null
            }
          />
          <DetailRow
            label="Paid At"
            value={
              record.paidAt
                ? new Date(record.paidAt).toLocaleString()
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
