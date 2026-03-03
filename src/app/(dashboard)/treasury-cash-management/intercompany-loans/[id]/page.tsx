import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIntercompanyLoan } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function IntercompanyLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const { id } = await params;
  const record = await getIntercompanyLoan(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "treasury:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/intercompany-loans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.borrowerEntity} - {record.loanType}
          </h1>
          <p className="text-sm text-gray-500">{record.loanRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/treasury-cash-management/intercompany-loans/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Loan Ref</dt>
            <dd className="mt-1 text-gray-900">{record.loanRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
            <dd className="mt-1 text-gray-900">{record.loanType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Lender Entity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lenderEntity || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Borrower Entity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.borrowerEntity || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Principal Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.principalAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Outstanding Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.outstandingBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Interest Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.interestRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Interest Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.interestType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Disbursement Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.disbursementDate
                ? new Date(record.disbursementDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Maturity Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.maturityDate
                ? new Date(record.maturityDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Repayment Frequency
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.repaymentFrequency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Next Payment Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.nextPaymentDate
                ? new Date(record.nextPaymentDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Interest Accrued
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalInterestAccrued ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Repayments
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalRepayments ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transfer Pricing Compliance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.transferPricingCompliance ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Arm&apos;s Length Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.armLengthRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "defaulted"
                      ? "destructive"
                      : record.status === "repaid"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
