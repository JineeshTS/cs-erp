import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafDocumentProcessingJobs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
  queued: "secondary",
  processing: "warning",
  completed: "success",
  failed: "destructive",
  review_needed: "default",
};

const PRIORITY_VARIANTS: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  low: "secondary",
  normal: "success",
  high: "warning",
  urgent: "destructive",
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function fmtDateTime(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

export default async function DocumentJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const { id } = await params;

  const record = await db
    .select()
    .from(aafDocumentProcessingJobs)
    .where(
      and(
        eq(aafDocumentProcessingJobs.id, id),
        eq(aafDocumentProcessingJobs.tenantId, session.tenantId),
        isNull(aafDocumentProcessingJobs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ai-agent-framework/documents" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.jobReference}</h1>
          <p className="text-sm text-gray-500">{record.documentType} &middot; {record.jobType}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[record.status] ?? "secondary"}>
          {record.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Job Reference</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.jobReference}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Document Reference</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.documentRef ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Document Type</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.documentType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Job Type</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.jobType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Agent ID</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.agentId ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={STATUS_VARIANTS[record.status] ?? "secondary"}>
                {record.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Priority</p>
            <div className="mt-0.5">
              <Badge variant={PRIORITY_VARIANTS[record.priority] ?? "secondary"}>
                {record.priority}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Confidence Score</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.confidenceScore !== null ? `${record.confidenceScore}%` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">OCR Engine</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.ocrEngine ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Processing Time</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.processingTimeMs !== null ? `${record.processingTimeMs}ms` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Retry Count</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.retryCount ?? 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Started At</p>
            <p className="mt-0.5 text-sm text-gray-900">{fmtDateTime(record.startedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Completed At</p>
            <p className="mt-0.5 text-sm text-gray-900">{fmtDateTime(record.completedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reviewed By</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.reviewedBy ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reviewed At</p>
            <p className="mt-0.5 text-sm text-gray-900">{fmtDateTime(record.reviewedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-0.5 text-sm text-gray-900">{fmtDate(record.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Updated At</p>
            <p className="mt-0.5 text-sm text-gray-900">{fmtDate(record.updatedAt)}</p>
          </div>
        </div>

        {record.errorMessage && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Error Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">{record.errorMessage}</p>
          </div>
        )}

        {record.notes && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
          </div>
        )}
      </div>

      {/* Back link */}
      <div>
        <Link
          href="/ai-agent-framework/documents"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Document Processing Jobs
        </Link>
      </div>
    </div>
  );
}
