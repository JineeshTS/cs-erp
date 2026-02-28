import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsOcrResults } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "warning" as const;
    case "processing":
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

export default async function OcrResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const result = await db
    .select()
    .from(dmsOcrResults)
    .where(
      and(
        eq(dmsOcrResults.id, id),
        eq(dmsOcrResults.tenantId, session.tenantId),
        isNull(dmsOcrResults.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!result) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/ocr-results"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">OCR Result Detail</h1>
          <p className="text-sm text-gray-500">
            OCR processing result for document {result.documentId.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">{result.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {result.documentId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Version ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {result.versionId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(result.status)}>
                {result.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence</dt>
            <dd className="mt-1 text-gray-900">
              {result.confidence !== null ? `${result.confidence}%` : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Language</dt>
            <dd className="mt-1 text-gray-900">{result.language || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Page Count</dt>
            <dd className="mt-1 text-gray-900">{result.pageCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Processing Time
            </dt>
            <dd className="mt-1 text-gray-900">
              {result.processingTimeMs !== null
                ? `${result.processingTimeMs} ms`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">OCR Engine</dt>
            <dd className="mt-1 text-gray-900">{result.ocrEngine || "-"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Timestamps</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(result.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(result.updatedAt)}
            </dd>
          </div>
          {result.startedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Started At</dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(result.startedAt)}
              </dd>
            </div>
          )}
          {result.completedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed At</dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(result.completedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {result.extractedText && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Extracted Text
          </h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <code>{result.extractedText}</code>
          </pre>
        </div>
      )}

      {result.extractedData != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Extracted Data
          </h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <code>{JSON.stringify(result.extractedData, null, 2)}</code>
          </pre>
        </div>
      )}

      {result.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Error Message
          </h2>
          <p className="whitespace-pre-wrap text-sm text-red-700">
            {result.errorMessage}
          </p>
        </div>
      )}

      {result.metadata != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Metadata</h2>
          <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <code>{JSON.stringify(result.metadata, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
