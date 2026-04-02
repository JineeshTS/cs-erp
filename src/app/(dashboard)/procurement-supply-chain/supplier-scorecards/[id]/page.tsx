import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSupplierScorecard } from "@/lib/procurement-supply-chain/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_review: "warning",
  finalized: "success",
  archived: "secondary",
} as const;

export default async function SupplierScorecardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/procurement-supply-chain");

  const { id } = await params;

  const record = await getSupplierScorecard(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "procurement:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/supplier-scorecards"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.scorecardRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.vendorName || "Supplier Scorecard"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/procurement-supply-chain/supplier-scorecards/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Scorecard Ref</dt>
            <dd className="mt-1 text-gray-900">{record.scorecardRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scorecard Type</dt>
            <dd className="mt-1 text-gray-900">{record.scorecardType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
            <dd className="mt-1 text-gray-900">{record.vendorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor ID</dt>
            <dd className="mt-1 text-gray-900">{record.vendorId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Evaluation Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {record.evaluationPeriodStart
                ? new Date(record.evaluationPeriodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Evaluation Period End</dt>
            <dd className="mt-1 text-gray-900">
              {record.evaluationPeriodEnd
                ? new Date(record.evaluationPeriodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Quality Score</dt>
            <dd className="mt-1 text-gray-900">{record.qualityScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Score</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Price Score</dt>
            <dd className="mt-1 text-gray-900">{record.priceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Service Score</dt>
            <dd className="mt-1 text-gray-900">{record.serviceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Compliance Score</dt>
            <dd className="mt-1 text-gray-900">{record.complianceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Overall Score</dt>
            <dd className="mt-1 text-gray-900">{record.overallScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Overall Rating</dt>
            <dd className="mt-1 text-gray-900">{record.overallRating || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Orders Evaluated</dt>
            <dd className="mt-1 text-gray-900">{record.totalOrdersEvaluated ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">On-Time Delivery Rate</dt>
            <dd className="mt-1 text-gray-900">{record.onTimeDeliveryRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Defect Rate</dt>
            <dd className="mt-1 text-gray-900">{record.defectRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Avg Response Time (hrs)</dt>
            <dd className="mt-1 text-gray-900">{record.responseTimeAvg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Evaluated By</dt>
            <dd className="mt-1 text-gray-900">{record.evaluatedBy || "-"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Strengths</dt>
            <dd className="mt-1 text-gray-900">
              {record.strengths || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Weaknesses</dt>
            <dd className="mt-1 text-gray-900">
              {record.weaknesses || "-"}
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
