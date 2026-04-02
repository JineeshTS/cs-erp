import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRiskRegister } from "@/lib/loss-prevention-risk-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function RiskRegisterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:read")))
    redirect("/loss-prevention-risk-management");

  const { id } = await params;

  const record = await getRiskRegister(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "lpr:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/risk-registers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.riskRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.riskType?.replace(/_/g, " ")} &middot; {record.title || "No title"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/loss-prevention-risk-management/risk-registers/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Risk Ref</dt>
            <dd className="mt-1 text-gray-900">{record.riskRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.riskType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">{record.description || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Category</dt>
            <dd className="mt-1 text-gray-900">{record.riskCategory || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Likelihood</dt>
            <dd className="mt-1 text-gray-900">{record.likelihood ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Impact</dt>
            <dd className="mt-1 text-gray-900">{record.impact ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
            <dd className="mt-1 text-gray-900">{record.riskScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Owner</dt>
            <dd className="mt-1 text-gray-900">{record.riskOwner || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Mitigation Strategy</dt>
            <dd className="mt-1 text-gray-900">{record.mitigationStrategy || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Residual Likelihood</dt>
            <dd className="mt-1 text-gray-900">{record.residualLikelihood ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Residual Impact</dt>
            <dd className="mt-1 text-gray-900">{record.residualImpact ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Residual Score</dt>
            <dd className="mt-1 text-gray-900">{record.residualScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Review Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.reviewDate ? record.reviewDate.toLocaleDateString() : "-"}
            </dd>
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
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
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
        </dl>
      </div>
    </div>
  );
}
