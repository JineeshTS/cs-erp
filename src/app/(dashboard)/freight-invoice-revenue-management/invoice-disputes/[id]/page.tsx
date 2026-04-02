import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getInvoiceDispute } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "open":
      return "warning";
    case "investigating":
      return "default";
    case "escalated":
      return "destructive";
    case "resolved":
      return "success";
    case "closed":
      return "secondary";
    default:
      return "secondary";
  }
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleString();
}

export default async function InvoiceDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;
  const dispute = await getInvoiceDispute(id, session.tenantId);
  if (!dispute) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Dispute Ref", value: dispute.disputeRef },
    { label: "Invoice Number", value: dispute.invoiceNumber },
    { label: "Customer Name", value: dispute.customerName },
    { label: "Dispute Type", value: dispute.disputeType },
    { label: "Disputed Amount", value: dispute.disputedAmount },
    { label: "Currency", value: dispute.currency },
    { label: "Reason", value: dispute.reason },
    { label: "Assigned To", value: dispute.assignedToName },
    { label: "Resolution Type", value: dispute.resolutionType },
    { label: "Resolved Amount", value: dispute.resolvedAmount },
    { label: "Resolution Notes", value: dispute.resolutionNotes },
    {
      label: "Status",
      value: (
        <Badge variant={statusVariant(dispute.status)}>
          {dispute.status}
        </Badge>
      ),
    },
    { label: "Escalated At", value: fmtDate(dispute.escalatedAt) },
    { label: "Resolved At", value: fmtDate(dispute.resolvedAt) },
    { label: "SLA Deadline", value: fmtDate(dispute.slaDeadline) },
    { label: "Notes", value: dispute.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/freight-invoice-revenue-management/invoice-disputes"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dispute.disputeRef}
            </h1>
            <p className="text-sm text-gray-500">Invoice Dispute Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/freight-invoice-revenue-management/invoice-disputes/${dispute.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
