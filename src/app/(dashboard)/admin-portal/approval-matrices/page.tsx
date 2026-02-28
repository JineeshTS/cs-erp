import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminApprovalMatrices } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const OPERATOR_LABELS: Record<string, string> = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  ne: "!=",
};

export default async function ApprovalMatricesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminApprovalMatrices)
    .where(
      and(
        eq(adminApprovalMatrices.tenantId, session.tenantId),
        isNull(adminApprovalMatrices.deletedAt)
      )
    )
    .orderBy(desc(adminApprovalMatrices.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Approval Matrices
          </h1>
          <p className="text-sm text-gray-500">
            Configure approval workflows, thresholds, and escalation rules
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/approval-matrices/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Approval Matrix
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No approval matrices found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/approval-matrices/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first approval matrix
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Condition
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Threshold
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Required Approvals
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Sort Order
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((matrix) => (
                <tr
                  key={matrix.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/approval-matrices/${matrix.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {matrix.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {matrix.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {matrix.conditionField}{" "}
                    {OPERATOR_LABELS[matrix.conditionOperator] ??
                      matrix.conditionOperator}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(matrix.thresholdAmount / 100).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {matrix.currency}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {matrix.requiredApprovals}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={matrix.isActive ? "success" : "secondary"}
                    >
                      {matrix.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {matrix.sortOrder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
