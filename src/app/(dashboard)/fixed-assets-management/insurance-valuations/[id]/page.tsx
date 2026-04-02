import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInsuranceValuation } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

export default async function InsuranceValuationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getInsuranceValuation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "asset:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/fixed-assets-management/insurance-valuations"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.recordRef}
            </h1>
            <p className="text-sm text-gray-500">{record.assetName}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/fixed-assets-management/insurance-valuations/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Record Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.recordRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Record Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.recordType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.assetRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.assetName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Insurer</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.insurer || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Policy Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.policyNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Coverage Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.coverageType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Coverage Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.coverageAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Premium Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.premiumAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Deductible</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.deductible ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Policy Start Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.policyStartDate
                ? new Date(record.policyStartDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Policy End Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.policyEndDate
                ? new Date(record.policyEndDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Valuation Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.valuationDate
                ? new Date(record.valuationDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Valuation Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.valuationAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valued By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.valuedBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Valuation Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.valuationMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Next Review Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.nextReviewDate
                ? new Date(record.nextReviewDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "expired"
                      ? "destructive"
                      : record.status === "pending_renewal"
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
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
