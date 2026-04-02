import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBadDebtProvision } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function BadDebtProvisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canEdit = await hasPermission(session.id, session.tenantId, "receivable:edit");

  const { id } = await params;
  const provision = await getBadDebtProvision(id, session.tenantId);
  if (!provision) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/accounts-receivable-credit-control/bad-debt-provisions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{provision.provisionRef}</h1>
            <p className="text-sm text-gray-500">{provision.customerName}</p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/accounts-receivable-credit-control/bad-debt-provisions/${id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Provision Details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Provision Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.provisionRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Provision Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.provisionType ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.accountNumber ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Invoice Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.invoiceRef ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.currency ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Original Amount</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{provision.originalAmount?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Provision Amount</dt>
            <dd className="mt-1 text-sm font-semibold text-orange-600">{provision.provisionAmount?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Write-Off Amount</dt>
            <dd className="mt-1 text-sm font-semibold text-red-600">{provision.writeOffAmount?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Recovered Amount</dt>
            <dd className="mt-1 text-sm font-semibold text-green-600">{provision.recoveredAmount?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Net Provision</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{provision.netProvision?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Provision Percent</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.provisionPercent != null ? `${provision.provisionPercent}%` : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Aging Bucket</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.agingBucket ?? "--"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{provision.reason ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Journal Entry Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.journalEntryRef ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">GL Account Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.glAccountCode ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Accounting Period</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.accountingPeriod ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.approvedByName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.approvedAt ? new Date(provision.approvedAt).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Write-Off Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{provision.writeOffDate ? new Date(provision.writeOffDate).toLocaleDateString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1"><Badge variant={provision.status === "approved" ? "success" : provision.status === "written_off" ? "destructive" : "secondary"}>{provision.status}</Badge></dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{provision.notes ?? "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
