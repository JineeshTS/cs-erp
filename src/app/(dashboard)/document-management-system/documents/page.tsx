import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, ilike, isNull, desc } from "drizzle-orm";
import { dmsDocuments } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
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

export default async function DocumentsListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "documents:create"
  );

  const { search } = await searchParams;
  const searchTerm = search || "";

  const conditions = [
    eq(dmsDocuments.tenantId, session.tenantId),
    isNull(dmsDocuments.deletedAt),
  ];

  if (searchTerm) {
    conditions.push(ilike(dmsDocuments.title, `%${escapeIlike(searchTerm)}%`));
  }

  const data = await db
    .select()
    .from(dmsDocuments)
    .where(and(...conditions))
    .orderBy(desc(dmsDocuments.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500">
            Manage documents, classifications, and file storage
          </p>
        </div>
        {canCreate && (
          <Link
            href="/document-management-system/documents/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Document
          </Link>
        )}
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="search"
          type="text"
          defaultValue={searchTerm}
          placeholder="Search by title..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No documents found.</p>
          {canCreate && (
            <Link
              href="/document-management-system/documents/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Upload your first document
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Document Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Classification
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  File Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/documents/${doc.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {doc.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {doc.documentNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {doc.documentType}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          doc.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        classificationVariant[
                          doc.classification as keyof typeof classificationVariant
                        ] ?? "secondary"
                      }
                    >
                      {doc.classification}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.fileName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {doc.createdAt.toLocaleDateString()}
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
