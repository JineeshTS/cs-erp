import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
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

export default async function ImportExportJobsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminImportExportJobs)
    .where(
      and(
        eq(adminImportExportJobs.tenantId, session.tenantId),
        isNull(adminImportExportJobs.deletedAt)
      )
    )
    .orderBy(desc(adminImportExportJobs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Import / Export Jobs
          </h1>
          <p className="text-sm text-gray-500">
            Manage bulk data import and export operations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/import-export-jobs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Job
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No import/export jobs found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/import-export-jobs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first import/export job
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Job Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  File Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Format
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Progress
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((job) => (
                <tr
                  key={job.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/import-export-jobs/${job.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {job.entityType}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{job.jobType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {job.fileName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{job.fileFormat}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(job.status)}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {job.totalRecords
                      ? `${job.processedRecords}/${job.totalRecords}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {job.createdAt.toLocaleDateString()}
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
