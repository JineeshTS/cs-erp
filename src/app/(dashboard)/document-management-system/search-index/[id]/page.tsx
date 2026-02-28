import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
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

function formatTimestamp(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SearchIndexDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const entry = await db
    .select()
    .from(dmsSearchIndex)
    .where(
      and(
        eq(dmsSearchIndex.id, id),
        eq(dmsSearchIndex.tenantId, session.tenantId),
        isNull(dmsSearchIndex.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!entry) notFound();

  const keywords = Array.isArray(entry.keywords) ? entry.keywords : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/search-index"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Index Detail
          </h1>
          <p className="text-sm text-gray-500">
            Index entry for document {entry.documentId.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">{entry.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {entry.documentId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Version ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {entry.versionId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Index Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(entry.indexStatus)}>
                {entry.indexStatus}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Language</dt>
            <dd className="mt-1 text-gray-900">{entry.language || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Indexed At</dt>
            <dd className="mt-1 text-gray-900">
              {entry.lastIndexedAt ? formatTimestamp(entry.lastIndexedAt) : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Timestamps</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(entry.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(entry.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {keywords && keywords.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Keywords</h2>
          <p className="text-sm text-gray-800">
            {keywords.join(", ")}
          </p>
        </div>
      )}

      {entry.summary && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Summary</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {entry.summary}
          </p>
        </div>
      )}

      {entry.indexedContent && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Indexed Content
          </h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <code>
              {entry.indexedContent.length > 500
                ? `${entry.indexedContent.slice(0, 500)}...`
                : entry.indexedContent}
            </code>
          </pre>
        </div>
      )}

      {entry.entities != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Entities</h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <code>{JSON.stringify(entry.entities, null, 2)}</code>
          </pre>
        </div>
      )}

      {entry.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Error Message
          </h2>
          <p className="whitespace-pre-wrap text-sm text-red-700">
            {entry.errorMessage}
          </p>
        </div>
      )}

      {entry.metadata != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Metadata</h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <code>{JSON.stringify(entry.metadata, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
