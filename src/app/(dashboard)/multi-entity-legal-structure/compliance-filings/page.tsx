import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsComplianceFilings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ComplianceFilingsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "entities:create"
  );

  const data = await db
    .select()
    .from(melsComplianceFilings)
    .where(
      and(
        eq(melsComplianceFilings.tenantId, session.tenantId),
        isNull(melsComplianceFilings.deletedAt)
      )
    )
    .orderBy(desc(melsComplianceFilings.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compliance Filings
          </h1>
          <p className="text-sm text-gray-500">
            Manage compliance filing submissions and tracking
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/compliance-filings/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Compliance Filing
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No compliance filings found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/compliance-filings/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first compliance filing
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Filing Period
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Compliance Rule ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Legal Entity ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Due Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Filed At
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((filing) => (
                <tr
                  key={filing.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/compliance-filings/${filing.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {filing.filingPeriod}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.complianceRuleId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.legalEntityId}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        filing.status === "pending"
                          ? "warning"
                          : filing.status === "in_progress"
                            ? "secondary"
                            : filing.status === "submitted"
                              ? "success"
                              : filing.status === "accepted"
                                ? "success"
                                : filing.status === "rejected"
                                  ? "destructive"
                                  : filing.status === "overdue"
                                    ? "destructive"
                                    : "secondary"
                      }
                    >
                      {filing.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.filedAt
                      ? filing.filedAt.toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.createdAt.toLocaleDateString()}
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
