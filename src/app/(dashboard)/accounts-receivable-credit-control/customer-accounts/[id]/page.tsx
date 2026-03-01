import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCustomerAccount } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CustomerAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canEdit = await hasPermission(session.id, session.tenantId, "receivable:edit");

  const { id } = await params;
  const account = await getCustomerAccount(id, session.tenantId);
  if (!account) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/accounts-receivable-credit-control/customer-accounts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.customerName}</h1>
            <p className="text-sm text-gray-500">Account #{account.accountNumber}</p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/accounts-receivable-credit-control/customer-accounts/${id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-xs font-medium text-gray-500">Account Number</dt><dd className="mt-1 text-sm text-gray-900">{account.accountNumber}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Customer Name</dt><dd className="mt-1 text-sm text-gray-900">{account.customerName}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Customer Code</dt><dd className="mt-1 text-sm text-gray-900">{account.customerCode ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Segment</dt><dd className="mt-1 text-sm text-gray-900">{account.segment ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Currency</dt><dd className="mt-1 text-sm text-gray-900">{account.currency ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Payment Terms</dt><dd className="mt-1 text-sm text-gray-900">{account.paymentTerms ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Billing Email</dt><dd className="mt-1 text-sm text-gray-900">{account.billingEmail ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Billing Phone</dt><dd className="mt-1 text-sm text-gray-900">{account.billingPhone ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Primary Contact</dt><dd className="mt-1 text-sm text-gray-900">{account.primaryContact ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Account Manager</dt><dd className="mt-1 text-sm text-gray-900">{account.accountManagerName ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Total Outstanding</dt><dd className="mt-1 text-sm font-semibold text-gray-900">{account.totalOutstanding?.toLocaleString() ?? "0"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Total Overdue</dt><dd className="mt-1 text-sm font-semibold text-red-600">{account.totalOverdue?.toLocaleString() ?? "0"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Account Status</dt><dd className="mt-1"><Badge variant={account.accountStatus === "active" ? "success" : "secondary"}>{account.accountStatus}</Badge></dd></div>
          <div><dt className="text-xs font-medium text-gray-500">On Hold</dt><dd className="mt-1 text-sm text-gray-900">{account.onHold ? "Yes" : "No"}</dd></div>
          {account.onHold && account.holdReason && (
            <div><dt className="text-xs font-medium text-gray-500">Hold Reason</dt><dd className="mt-1 text-sm text-gray-900">{account.holdReason}</dd></div>
          )}
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-xs font-medium text-gray-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{account.notes ?? "--"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
