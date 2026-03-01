import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCreditLimit } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CreditLimitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canEdit = await hasPermission(session.id, session.tenantId, "receivable:edit");

  const { id } = await params;
  const creditLimit = await getCreditLimit(id, session.tenantId);
  if (!creditLimit) notFound();

  const riskVariant = (risk: string) => {
    switch (risk) {
      case "low": return "success" as const;
      case "standard": return "secondary" as const;
      case "medium": return "warning" as const;
      case "high": return "destructive" as const;
      case "critical": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/accounts-receivable-credit-control/credit-limits" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credit Limit - {creditLimit.customerName}</h1>
            <p className="text-sm text-gray-500">Account #{creditLimit.accountNumber}</p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/accounts-receivable-credit-control/credit-limits/${id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Credit Limit Details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.accountNumber}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Credit Limit</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{creditLimit.creditLimit?.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Current Exposure</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.currentExposure?.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Available Credit</dt>
            <dd className="mt-1 text-sm font-semibold text-green-600">{creditLimit.availableCredit?.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Risk Category</dt>
            <dd className="mt-1"><Badge variant={riskVariant(creditLimit.riskCategory)}>{creditLimit.riskCategory}</Badge></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1"><Badge variant={creditLimit.status === "active" ? "success" : "secondary"}>{creditLimit.status}</Badge></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Credit Insured</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.creditInsured ? "Yes" : "No"}</dd>
          </div>
          {creditLimit.creditInsured && (
            <>
              <div>
                <dt className="text-xs font-medium text-gray-500">Insurer Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{creditLimit.insurerName ?? "--"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Insured Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">{creditLimit.insuredAmount?.toLocaleString() ?? "--"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Insurance Policy Ref</dt>
                <dd className="mt-1 text-sm text-gray-900">{creditLimit.insurancePolicyRef ?? "--"}</dd>
              </div>
            </>
          )}
          <div>
            <dt className="text-xs font-medium text-gray-500">Next Review Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.nextReviewDate ? new Date(creditLimit.nextReviewDate).toLocaleDateString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.approvedByName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-sm text-gray-900">{creditLimit.approvedAt ? new Date(creditLimit.approvedAt).toLocaleDateString() : "--"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{creditLimit.notes ?? "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
