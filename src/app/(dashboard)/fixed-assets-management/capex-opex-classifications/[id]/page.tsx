import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCapexOpexClassification } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  pending_review: "warning",
  approved: "success",
  rejected: "destructive",
} as const;

export default async function CapexOpexClassificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getCapexOpexClassification(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "asset:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/capex-opex-classifications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.classificationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.title}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fixed-assets-management/capex-opex-classifications/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Classification Ref</dt>
            <dd className="mt-1 text-gray-900">{record.classificationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Classification Type</dt>
            <dd className="mt-1 text-gray-900">{record.classificationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expenditure Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.expenditureDate
                ? new Date(record.expenditureDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-gray-900">
              {record.amount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assetRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-gray-900">{record.assetName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost Center</dt>
            <dd className="mt-1 text-gray-900">{record.costCenter || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">GL Account Code</dt>
            <dd className="mt-1 text-gray-900">{record.glAccountCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Capitalization Threshold</dt>
            <dd className="mt-1 text-gray-900">
              {record.capitalizationThreshold ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Useful Life Extension</dt>
            <dd className="mt-1 text-gray-900">
              {record.usefulLifeExtension ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Improvement Value</dt>
            <dd className="mt-1 text-gray-900">
              {record.improvementValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Classified By</dt>
            <dd className="mt-1 text-gray-900">{record.classifiedBy || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">{record.approvedBy || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approval Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvalDate
                ? new Date(record.approvalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Journal Entry Ref</dt>
            <dd className="mt-1 text-gray-900">{record.journalEntryRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Justification</dt>
            <dd className="mt-1 text-gray-900">
              {record.justification || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
