import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmDocumentAmendments } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function DocumentAmendmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/operations-documentation");

  const { id } = await params;

  const record = await db
    .select()
    .from(odmDocumentAmendments)
    .where(
      and(
        eq(odmDocumentAmendments.id, id),
        eq(odmDocumentAmendments.tenantId, session.tenantId),
        isNull(odmDocumentAmendments.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "operations:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "operations:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/operations-documentation/document-amendments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.amendmentNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {record.amendmentType} &middot; {record.fieldChanged}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/operations-documentation/document-amendments/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/operations-documentation/document-amendments/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Amendment Number
            </dt>
            <dd className="mt-1 text-gray-900">{record.amendmentNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Amendment Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.amendmentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Field Changed
            </dt>
            <dd className="mt-1 text-gray-900">{record.fieldChanged}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Old Value</dt>
            <dd className="mt-1 text-gray-900">{record.oldValue ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">New Value</dt>
            <dd className="mt-1 text-gray-900">{record.newValue ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-gray-900">{record.reason ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fee</dt>
            <dd className="mt-1 text-gray-900">
              {record.fee != null ? record.fee : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency ?? "-"}</dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
