import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { wneDoaMatrix } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function DoaMatrixDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  const canRead = await hasPermission(
    session.id,
    session.tenantId,
    "doa:read"
  );
  if (!canRead) redirect("/");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "doa:edit"
  );

  const [entry] = await db
    .select()
    .from(wneDoaMatrix)
    .where(
      and(
        eq(wneDoaMatrix.id, id),
        eq(wneDoaMatrix.tenantId, session.tenantId),
        isNull(wneDoaMatrix.deletedAt)
      )
    )
    .limit(1);

  if (!entry) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/workflow-notification-engine/doa-matrix"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        {canEdit && (
          <Link
            href={`/workflow-notification-engine/doa-matrix/${entry.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
          <ShieldCheck className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{entry.name}</h1>
          <p className="text-sm text-gray-500">DOA Matrix Entry</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{entry.name}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-sm capitalize text-gray-900">
              {entry.entityType}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Action Type</dt>
            <dd className="mt-1 text-sm capitalize text-gray-900">
              {entry.actionType}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entry.currency ?? "USD"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Min Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entry.minAmount != null ? entry.minAmount : "-"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Max Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entry.maxAmount != null ? entry.maxAmount : "-"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Requires Dual Approval
            </dt>
            <dd className="mt-1">
              {entry.requiresDualApproval ? (
                <Badge variant="warning">Yes</Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              {entry.isActive ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
