import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminApprovalMatrices } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const OPERATOR_LABELS: Record<string, string> = {
  eq: "Equal to (=)",
  gt: "Greater than (>)",
  gte: "Greater than or equal (>=)",
  lt: "Less than (<)",
  lte: "Less than or equal (<=)",
  ne: "Not equal (!=)",
};

export default async function ApprovalMatrixDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const matrix = await db
    .select()
    .from(adminApprovalMatrices)
    .where(
      and(
        eq(adminApprovalMatrices.id, id),
        eq(adminApprovalMatrices.tenantId, session.tenantId),
        isNull(adminApprovalMatrices.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!matrix) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  const formattedThreshold = (matrix.thresholdAmount / 100).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/approval-matrices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{matrix.name}</h1>
          <p className="text-sm text-gray-500">{matrix.slug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/approval-matrices/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{matrix.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{matrix.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={matrix.isActive ? "success" : "secondary"}>
                {matrix.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{matrix.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Condition Field
            </dt>
            <dd className="mt-1 text-gray-900">{matrix.conditionField}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Condition Operator
            </dt>
            <dd className="mt-1 text-gray-900">
              {OPERATOR_LABELS[matrix.conditionOperator] ??
                matrix.conditionOperator}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Threshold Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {formattedThreshold} {matrix.currency}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{matrix.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Required Approvals
            </dt>
            <dd className="mt-1 text-gray-900">{matrix.requiredApprovals}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approver Role ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {matrix.approverRoleId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approver User ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {matrix.approverUserId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Escalation Timeout
            </dt>
            <dd className="mt-1 text-gray-900">
              {matrix.escalationTimeoutMinutes
                ? `${matrix.escalationTimeoutMinutes} minutes`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sort Order</dt>
            <dd className="mt-1 text-gray-900">{matrix.sortOrder}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {matrix.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {matrix.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {matrix.description || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {matrix.metadata ? (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-xs">
                  {JSON.stringify(matrix.metadata, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
