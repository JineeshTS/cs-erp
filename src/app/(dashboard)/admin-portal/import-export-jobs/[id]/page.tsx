import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminImportExportJobs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function statusVariant(
  status: string
): "warning" | "secondary" | "success" | "destructive" {
  switch (status) {
    case "pending":
      return "warning";
    case "processing":
      return "secondary";
    case "completed":
      return "success";
    case "failed":
      return "destructive";
    case "cancelled":
      return "secondary";
    default:
      return "secondary";
  }
}

export default async function ImportExportJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const job = await db
    .select()
    .from(adminImportExportJobs)
    .where(
      and(
        eq(adminImportExportJobs.id, id),
        eq(adminImportExportJobs.tenantId, session.tenantId),
        isNull(adminImportExportJobs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!job) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/import-export-jobs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {job.entityType} - {job.jobType}
          </h1>
          <p className="text-sm text-gray-500">{job.id}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/import-export-jobs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Job Type</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{job.jobType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{job.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Name</dt>
            <dd className="mt-1 text-gray-900">{job.fileName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Size</dt>
            <dd className="mt-1 text-gray-900">
              {job.fileSize ? `${job.fileSize} bytes` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Format</dt>
            <dd className="mt-1 text-gray-900">{job.fileFormat}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Records
            </dt>
            <dd className="mt-1 text-gray-900">
              {job.totalRecords ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Processed Records
            </dt>
            <dd className="mt-1 text-gray-900">{job.processedRecords}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Failed Records
            </dt>
            <dd className="mt-1 text-gray-900">{job.failedRecords}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Initiated By</dt>
            <dd className="mt-1 text-gray-900">{job.initiatedBy}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Result File Path
            </dt>
            <dd className="mt-1 text-gray-900">
              {job.resultFilePath || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started At</dt>
            <dd className="mt-1 text-gray-900">
              {job.startedAt ? job.startedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed At</dt>
            <dd className="mt-1 text-gray-900">
              {job.completedAt ? job.completedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Column Mapping
            </dt>
            <dd className="mt-1 text-gray-900">
              {job.columnMapping ? JSON.stringify(job.columnMapping) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Filters</dt>
            <dd className="mt-1 text-gray-900">
              {job.filters ? JSON.stringify(job.filters) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {job.metadata ? JSON.stringify(job.metadata) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {job.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {job.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {job.errorLog != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Error Log
          </h2>
          <pre className="overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            {JSON.stringify(job.errorLog, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
