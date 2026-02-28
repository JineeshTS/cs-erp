import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminImportExportJobs } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const EDIT_FIELDS: FieldConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { name: "totalRecords", label: "Total Records", type: "number" },
  { name: "processedRecords", label: "Processed Records", type: "number" },
  { name: "failedRecords", label: "Failed Records", type: "number" },
  { name: "resultFilePath", label: "Result File Path", type: "text" },
];

export default async function EditImportExportJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/import-export-jobs");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/import-export-jobs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Import / Export Job
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Import/Export Job"
          apiPath={`/api/v1/admin-portal/import-export-jobs/${id}`}
          fields={EDIT_FIELDS}
          initialData={{
            status: job.status,
            totalRecords: job.totalRecords ?? "",
            processedRecords: job.processedRecords,
            failedRecords: job.failedRecords,
            resultFilePath: job.resultFilePath ?? "",
          }}
          isEdit
          returnPath={`/admin-portal/import-export-jobs/${id}`}
        />
      </div>
    </div>
  );
}
