import Link from "next/link";
import { ArrowLeft, FileStack } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsDocumentVersions } from "@/db/schema";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function VersionsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const data = await db
    .select()
    .from(dmsDocumentVersions)
    .where(
      and(
        eq(dmsDocumentVersions.tenantId, session.tenantId),
        isNull(dmsDocumentVersions.deletedAt)
      )
    )
    .orderBy(desc(dmsDocumentVersions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/document-management-system"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Document Versions
            </h1>
            <p className="text-sm text-gray-500">
              Version history across all documents
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileStack className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No document versions found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Document ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Version Number
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
              {data.map((version) => (
                <tr
                  key={version.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">
                    {version.documentId.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    v{version.versionNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/versions/${version.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {version.fileName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatFileSize(version.fileSize)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {version.changeNotes || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {version.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
