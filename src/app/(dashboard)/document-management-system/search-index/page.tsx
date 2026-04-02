import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsSearchIndex } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "warning" as const;
    case "indexing":
      return "secondary" as const;
    case "completed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export default async function SearchIndexListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const data = await db
    .select()
    .from(dmsSearchIndex)
    .where(
      and(
        eq(dmsSearchIndex.tenantId, session.tenantId),
        isNull(dmsSearchIndex.deletedAt)
      )
    )
    .orderBy(desc(dmsSearchIndex.createdAt))
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
            <h1 className="text-2xl font-bold text-gray-900">Search Index</h1>
            <p className="text-sm text-gray-500">
              View search index entries for document discovery
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            No search index entries found. Documents will be indexed
            automatically.
          </p>
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
                  Index Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Language
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Last Indexed
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/search-index/${entry.id}`}
                      className="font-medium font-mono text-sm text-gray-900 hover:underline"
                    >
                      {entry.documentId.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(entry.indexStatus)}>
                      {entry.indexStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entry.language || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entry.lastIndexedAt
                      ? entry.lastIndexedAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entry.createdAt.toLocaleDateString("en-US", {
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
