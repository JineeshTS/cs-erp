import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsRetentionPolicies } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function RetentionPolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const policy = await db
    .select()
    .from(dmsRetentionPolicies)
    .where(
      and(
        eq(dmsRetentionPolicies.id, id),
        eq(dmsRetentionPolicies.tenantId, session.tenantId),
        isNull(dmsRetentionPolicies.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!policy) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "documents:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/retention-policies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{policy.name}</h1>
          <p className="text-sm text-gray-500">
            {policy.description || "Retention policy details"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/document-management-system/retention-policies/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 text-gray-900">{policy.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{policy.name}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {policy.description ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Document Type
            </dt>
            <dd className="mt-1 text-gray-900">{policy.documentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Retention Days
            </dt>
            <dd className="mt-1 text-gray-900">{policy.retentionDays}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Archive After Days
            </dt>
            <dd className="mt-1 text-gray-900">
              {policy.archiveAfterDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auto Archive</dt>
            <dd className="mt-1">
              <Badge variant={policy.autoArchive ? "success" : "secondary"}>
                {policy.autoArchive ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auto Delete</dt>
            <dd className="mt-1">
              <Badge variant={policy.autoDelete ? "destructive" : "secondary"}>
                {policy.autoDelete ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={policy.isActive ? "success" : "secondary"}>
                {policy.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Executed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {policy.lastExecutedAt
                ? policy.lastExecutedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {policy.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {policy.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
