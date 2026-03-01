import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDocument } from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  available: "success",
  revoked: "destructive",
  expired: "destructive",
  pending: "secondary",
} as const;

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/");

  const { id } = await params;

  const document = await getDocument(id, session.tenantId);
  if (!document) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "portal:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-portal/documents"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {document.documentName}
          </h1>
          <p className="text-sm text-gray-500">
            {document.documentRef} &middot; {document.documentType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customer-portal/documents/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Document Ref</dt>
            <dd className="mt-1 text-gray-900">{document.documentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Document Type
            </dt>
            <dd className="mt-1 text-gray-900">{document.documentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Document Name
            </dt>
            <dd className="mt-1 text-gray-900">{document.documentName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BL Number</dt>
            <dd className="mt-1 text-gray-900">
              {document.blNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File URL</dt>
            <dd className="mt-1 text-gray-900">
              {document.fileUrl || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Size</dt>
            <dd className="mt-1 text-gray-900">
              {document.fileSize
                ? `${(document.fileSize / 1024).toFixed(1)} KB`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MIME Type</dt>
            <dd className="mt-1 text-gray-900">
              {document.mimeType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    document.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {document.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Visible
            </dt>
            <dd className="mt-1 text-gray-900">
              {document.isCustomerVisible ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expires At</dt>
            <dd className="mt-1 text-gray-900">
              {document.expiresAt
                ? document.expiresAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Download Count
            </dt>
            <dd className="mt-1 text-gray-900">{document.downloadCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Downloaded At
            </dt>
            <dd className="mt-1 text-gray-900">
              {document.lastDownloadedAt
                ? document.lastDownloadedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {document.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {document.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {document.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
