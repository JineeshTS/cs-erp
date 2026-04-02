import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcmForm, type FieldConfig } from "@/components/implementation-change-management/icm-form";

const MIGRATION_FIELDS: FieldConfig[] = [
  { name: "migrationType", label: "Migration Type", type: "select", required: true, options: [
    { value: "full_migration", label: "Full Migration" },
    { value: "incremental", label: "Incremental" },
    { value: "parallel_run", label: "Parallel Run" },
    { value: "cutover", label: "Cutover" },
    { value: "rollback", label: "Rollback" },
  ]},
  { name: "title", label: "Title", type: "text" },
  { name: "sourceSystem", label: "Source System", type: "text" },
  { name: "targetSystem", label: "Target System", type: "text" },
  { name: "dataVolume", label: "Data Volume", type: "text" },
  { name: "recordCount", label: "Record Count", type: "number" },
  { name: "migratedCount", label: "Migrated Count", type: "number" },
  { name: "errorCount", label: "Error Count", type: "number" },
  { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
  { name: "completedDate", label: "Completed Date", type: "datetime-local" },
  { name: "validationPassed", label: "Validation Passed", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDataMigrationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:create")))
    redirect("/implementation-change-management/data-migrations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/implementation-change-management/data-migrations" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Data Migration</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IcmForm entityType="Data Migration" apiPath="/api/v1/implementation-change-management/data-migrations" fields={MIGRATION_FIELDS} returnPath="/implementation-change-management/data-migrations" />
      </div>
    </div>
  );
}
