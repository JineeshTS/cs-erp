import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const IMPORT_EXPORT_JOB_FIELDS: FieldConfig[] = [
  {
    name: "jobType",
    label: "Job Type",
    type: "select",
    required: true,
    options: [
      { value: "import", label: "Import" },
      { value: "export", label: "Export" },
    ],
  },
  {
    name: "entityType",
    label: "Entity Type",
    type: "text",
    required: true,
    placeholder: "e.g. customers",
  },
  { name: "fileName", label: "File Name", type: "text" },
  { name: "fileSize", label: "File Size (bytes)", type: "number" },
  {
    name: "fileFormat",
    label: "File Format",
    type: "select",
    options: [
      { value: "csv", label: "CSV" },
      { value: "xlsx", label: "XLSX" },
      { value: "json", label: "JSON" },
    ],
  },
];

export default async function NewImportExportJobPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "admin:create"))
  )
    redirect("/admin-portal/import-export-jobs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/import-export-jobs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Import / Export Job
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Import/Export Job"
          apiPath="/api/v1/admin-portal/import-export-jobs"
          fields={IMPORT_EXPORT_JOB_FIELDS}
          returnPath="/admin-portal/import-export-jobs"
        />
      </div>
    </div>
  );
}
