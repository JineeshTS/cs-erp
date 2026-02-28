import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsComplianceRules, melsComplianceFilings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ComplianceRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  const [rule] = await db
    .select()
    .from(melsComplianceRules)
    .where(
      and(
        eq(melsComplianceRules.id, id),
        eq(melsComplianceRules.tenantId, session.tenantId),
        isNull(melsComplianceRules.deletedAt)
      )
    )
    .limit(1);

  if (!rule) notFound();

  const filings = await db
    .select()
    .from(melsComplianceFilings)
    .where(
      and(
        eq(melsComplianceFilings.complianceRuleId, id),
        eq(melsComplianceFilings.tenantId, session.tenantId),
        isNull(melsComplianceFilings.deletedAt)
      )
    )
    .orderBy(desc(melsComplianceFilings.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/multi-entity-legal-structure/compliance-rules"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{rule.name}</h1>
        </div>
        {canEdit && (
          <Link
            href={`/multi-entity-legal-structure/compliance-rules/${rule.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{rule.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{rule.ruleCode}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rule.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900">{rule.country}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Region</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rule.region || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Regulatory Body
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rule.regulatoryBody || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{rule.ruleType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Frequency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rule.frequency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={rule.isActive ? "success" : "secondary"}>
                {rule.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Conditions</dt>
            <dd className="mt-1">
              {rule.conditions != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(rule.conditions, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {rule.metadata != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(rule.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rule.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rule.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Compliance Filings
        </h2>
        {filings.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No compliance filings for this rule.
            </p>
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
                {filings.map((filing) => (
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
    </div>
  );
}
