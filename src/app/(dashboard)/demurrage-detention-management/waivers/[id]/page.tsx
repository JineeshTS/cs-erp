import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmWaiver } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "pending":
      return "secondary" as const;
    case "expired":
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

export default async function WaiverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/");

  const { id } = await params;
  const waiver = await getDdmWaiver(id, session.tenantId);
  if (!waiver) notFound();

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
            href="/demurrage-detention-management/waivers"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {waiver.waiverRef}
            </h1>
            <p className="text-sm text-gray-500">Waiver Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/demurrage-detention-management/waivers/${waiver.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Waiver Information
          </h2>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Waiver Ref</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.waiverRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Waiver Type</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.waiverType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Customer</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.customerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Container Number</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.containerNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Invoice Ref</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.invoiceRef ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(waiver.status)}>
                {waiver.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Original Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(waiver.currency, waiver.originalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Waived Amount</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAmount(waiver.currency, waiver.waivedAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Waiver Percent</p>
            <p className="mt-1 text-sm text-gray-900">
              {waiver.waiverPercent != null ? `${waiver.waiverPercent}%` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Remaining Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(waiver.currency, waiver.remainingAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Currency</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.currency ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Approval Level</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.approvalLevel ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Requested By</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.requestedByName ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Requested Date</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(waiver.requestedDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Approved By</p>
            <p className="mt-1 text-sm text-gray-900">{waiver.approvedByName ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Approved Date</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(waiver.approvedDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Expiry Date</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(waiver.expiryDate)}</p>
          </div>
        </div>
        {waiver.reason && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Reason</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {waiver.reason}
            </p>
          </div>
        )}
        {waiver.justification && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Justification</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {waiver.justification}
            </p>
          </div>
        )}
        {waiver.conditions && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Conditions</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {waiver.conditions}
            </p>
          </div>
        )}
        {waiver.notes && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {waiver.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
