import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  dmsDocuments,
  dmsDocumentVersions,
  dmsDocumentSignatures,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  pending_review: "warning",
  approved: "success",
  rejected: "destructive",
  expired: "destructive",
} as const;

const classificationVariant = {
  public: "outline",
  internal: "secondary",
  confidential: "warning",
  restricted: "destructive",
} as const;

const signatureStatusVariant = {
  pending: "warning",
  signed: "success",
  rejected: "destructive",
  expired: "destructive",
} as const;

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const [document, versions, signatures] = await Promise.all([
    db
      .select()
      .from(dmsDocuments)
      .where(
        and(
          eq(dmsDocuments.id, id),
          eq(dmsDocuments.tenantId, session.tenantId),
          isNull(dmsDocuments.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(dmsDocumentVersions)
      .where(
        and(
          eq(dmsDocumentVersions.documentId, id),
          eq(dmsDocumentVersions.tenantId, session.tenantId),
          isNull(dmsDocumentVersions.deletedAt)
        )
      )
      .orderBy(desc(dmsDocumentVersions.versionNumber)),
    db
      .select()
      .from(dmsDocumentSignatures)
      .where(
        and(
          eq(dmsDocumentSignatures.documentId, id),
          eq(dmsDocumentSignatures.tenantId, session.tenantId),
          isNull(dmsDocumentSignatures.deletedAt)
        )
      )
      .orderBy(desc(dmsDocumentSignatures.createdAt)),
  ]);

  if (!document) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "documents:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/documents"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {document.title}
          </h1>
          <p className="text-sm text-gray-500">
            {document.documentNumber || "No document number"} &middot;{" "}
            {document.documentType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/document-management-system/documents/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{document.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Document Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {document.documentNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Document Type
            </dt>
            <dd className="mt-1 text-gray-900">{document.documentType}</dd>
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
              Classification
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  classificationVariant[
                    document.classification as keyof typeof classificationVariant
                  ] ?? "secondary"
                }
              >
                {document.classification}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">
              {document.entityType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
            <dd className="mt-1 text-gray-900">{document.entityId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Name</dt>
            <dd className="mt-1 text-gray-900">{document.fileName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Size</dt>
            <dd className="mt-1 text-gray-900">
              {(document.fileSize / 1024).toFixed(1)} KB
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MIME Type</dt>
            <dd className="mt-1 text-gray-900">{document.mimeType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Storage Path</dt>
            <dd className="mt-1 text-gray-900">{document.storagePath}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Storage Provider
            </dt>
            <dd className="mt-1 text-gray-900">{document.storageProvider}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Archived</dt>
            <dd className="mt-1 text-gray-900">
              {document.isArchived ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Archived At</dt>
            <dd className="mt-1 text-gray-900">
              {document.archivedAt
                ? document.archivedAt.toLocaleDateString()
                : "-"}
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
            <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
            <dd className="mt-1 text-gray-900">{document.uploadedBy}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {document.description || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Versions ({versions.length})
        </h2>
        {versions.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No versions found for this document.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Version #
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    File Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    File Size
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Change Notes
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr
                    key={version.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-600">
                      v{version.versionNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {version.fileName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(version.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {version.changeNotes || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {version.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Signatures ({signatures.length})
        </h2>
        {signatures.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No signatures found for this document.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Signer Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Signed At
                  </th>
                </tr>
              </thead>
              <tbody>
                {signatures.map((sig) => (
                  <tr
                    key={sig.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {sig.signerName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sig.signatureType}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          signatureStatusVariant[
                            sig.status as keyof typeof signatureStatusVariant
                          ] ?? "secondary"
                        }
                      >
                        {sig.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sig.signedAt
                        ? sig.signedAt.toLocaleDateString()
                        : "-"}
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
