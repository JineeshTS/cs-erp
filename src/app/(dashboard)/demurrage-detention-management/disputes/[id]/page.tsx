import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmDispute } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "resolved":
      return "success" as const;
    case "under_review":
      return "secondary" as const;
    case "escalated":
      return "warning" as const;
    case "rejected":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(currency: string | null | undefined, amount: string | number | null | undefined) {
  if (amount == null) return "-";
  return `${currency ?? "USD"} ${Number(amount).toLocaleString()}`;
}

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/");

  const { id } = await params;
  const dispute = await getDdmDispute(id, session.tenantId);
  if (!dispute) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/demurrage-detention-management/disputes"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dispute.disputeRef}
            </h1>
            <p className="text-sm text-gray-500">Dispute Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/demurrage-detention-management/disputes/${dispute.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Dispute Information
          </h2>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Dispute Ref</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.disputeRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Invoice Ref</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.invoiceRef ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Customer</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.customerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Container Number</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.containerNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Dispute Type</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.disputeType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(dispute.status)}>
                {dispute.status}
              </Badge>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Dispute Reason</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{dispute.disputeReason}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Disputed Amount</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAmount(dispute.currency, dispute.disputedAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Original Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(dispute.currency, dispute.originalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Currency</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.currency ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Filed Date</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(dispute.filedDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Filed By</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.filedByName ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Assigned To</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.assignedToName ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Escalation Level</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.escalationLevel ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">SLA Deadline</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(dispute.slaDeadline)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Resolved Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(dispute.currency, dispute.resolvedAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Resolved Date</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(dispute.resolvedDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Resolved By</p>
            <p className="mt-1 text-sm text-gray-900">{dispute.resolvedByName ?? "-"}</p>
          </div>
        </div>
        {dispute.resolutionNotes && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Resolution Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {dispute.resolutionNotes}
            </p>
          </div>
        )}
        {dispute.notes && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {dispute.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
