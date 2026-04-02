import Link from "next/link";
import { ArrowLeft, FileStack } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsDocumentVersions } from "@/db/schema";

function formatTimestamp(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function VersionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const version = await db
    .select()
    .from(dmsDocumentVersions)
    .where(
      and(
        eq(dmsDocumentVersions.id, id),
        eq(dmsDocumentVersions.tenantId, session.tenantId),
        isNull(dmsDocumentVersions.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!version) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/versions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {version.fileName}
          </h1>
          <p className="text-sm text-gray-500">
            Version {version.versionNumber} details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {version.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {version.documentId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Version Number
            </dt>
            <dd className="mt-1 text-gray-900">v{version.versionNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Name</dt>
            <dd className="mt-1 text-gray-900">{version.fileName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Size</dt>
            <dd className="mt-1 text-gray-900">
              {formatFileSize(version.fileSize)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MIME Type</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {version.mimeType}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Storage Path</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {version.storagePath}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Change Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {version.changeNotes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {version.uploadedBy}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Checksum</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {version.checksum || "-"}
            </dd>
          </div>
          {version.metadata != null ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-900">
                {JSON.stringify(version.metadata, null, 2)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Timestamps
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(version.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(version.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
