import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsComplianceFilings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ComplianceFilingDetailPage({
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

  const [filing] = await db
    .select()
    .from(melsComplianceFilings)
    .where(
      and(
        eq(melsComplianceFilings.id, id),
        eq(melsComplianceFilings.tenantId, session.tenantId),
        isNull(melsComplianceFilings.deletedAt)
      )
    )
    .limit(1);

  if (!filing) notFound();

  const statusVariant =
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
                : "secondary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/multi-entity-legal-structure/compliance-filings"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Filing: {filing.filingPeriod}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/multi-entity-legal-structure/compliance-filings/${filing.id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Filing Period
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.filingPeriod}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Compliance Rule ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.complianceRuleId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Legal Entity ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.legalEntityId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant}>{filing.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.dueDate.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Filed At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.filedAt ? filing.filedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Filing Reference
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.filingReference || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Submitted By
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.submittedBy || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Filing Data</dt>
            <dd className="mt-1">
              {filing.filingData != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(filing.filingData, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {filing.metadata != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(filing.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {filing.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
