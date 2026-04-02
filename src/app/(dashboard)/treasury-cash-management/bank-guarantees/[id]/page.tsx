import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBankGuarantee } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BankGuaranteeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const { id } = await params;
  const record = await getBankGuarantee(id, session.tenantId);
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
          href="/treasury-cash-management/bank-guarantees"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.beneficiary} - {record.bgType}
          </h1>
          <p className="text-sm text-gray-500">{record.bgRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/treasury-cash-management/bank-guarantees/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">BG Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bgRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BG Type</dt>
            <dd className="mt-1 text-gray-900">{record.bgType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issuing Bank</dt>
            <dd className="mt-1 text-gray-900">
              {record.issuingBank || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applicant</dt>
            <dd className="mt-1 text-gray-900">{record.applicant || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Beneficiary</dt>
            <dd className="mt-1 text-gray-900">
              {record.beneficiary || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Guarantee Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.guaranteeAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.issueDate
                ? new Date(record.issueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Claim Deadline
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.claimDeadline
                ? new Date(record.claimDeadline).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Margin Percentage
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.marginPercentage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Margin Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.marginAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Commission Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.commissionRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Commission Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.commissionAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Linked Contract Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.linkedContractRef || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Purpose</dt>
            <dd className="mt-1 text-gray-900">{record.purpose || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Terms and Conditions
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.termsAndConditions || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auto Renewal</dt>
            <dd className="mt-1 text-gray-900">
              {record.autoRenewal ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Renewal Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.renewalCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "expired" ||
                        record.status === "claimed"
                      ? "destructive"
                      : record.status === "issued"
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
