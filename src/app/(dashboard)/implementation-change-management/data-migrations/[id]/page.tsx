import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDataMigration } from "@/lib/implementation-change-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = { draft: "secondary", in_progress: "warning", completed: "success", verified: "success", rejected: "destructive" } as const;

export default async function DataMigrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:read")))
    redirect("/implementation-change-management");

  const { id } = await params;
  const record = await getDataMigration(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "icm:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/implementation-change-management/data-migrations" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.migrationRef}</h1>
          <p className="text-sm text-gray-500">{record.migrationType?.replace(/_/g, " ")} &middot; {record.title || "Untitled"}</p>
        </div>
        {canEdit && (
          <Link href={`/implementation-change-management/data-migrations/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm font-medium text-gray-500">Migration Ref</dt><dd className="mt-1 text-gray-900">{record.migrationRef}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Migration Type</dt><dd className="mt-1 text-gray-900 capitalize">{record.migrationType?.replace(/_/g, " ")}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Title</dt><dd className="mt-1 text-gray-900">{record.title || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Source System</dt><dd className="mt-1 text-gray-900">{record.sourceSystem || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Target System</dt><dd className="mt-1 text-gray-900">{record.targetSystem || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Data Volume</dt><dd className="mt-1 text-gray-900">{record.dataVolume || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Record Count</dt><dd className="mt-1 text-gray-900">{record.recordCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Migrated Count</dt><dd className="mt-1 text-gray-900">{record.migratedCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Error Count</dt><dd className="mt-1 text-gray-900">{record.errorCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Scheduled Date</dt><dd className="mt-1 text-gray-900">{record.scheduledDate ? record.scheduledDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Completed Date</dt><dd className="mt-1 text-gray-900">{record.completedDate ? record.completedDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Validation Passed</dt><dd className="mt-1 text-gray-900">{record.validationPassed ? "Yes" : "No"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Status</dt><dd className="mt-1"><Badge variant={statusVariant[record.status as keyof typeof statusVariant] ?? "secondary"}>{record.status}</Badge></dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-sm font-medium text-gray-500">Notes</dt><dd className="mt-1 text-gray-900">{record.notes || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Created At</dt><dd className="mt-1 text-gray-900">{record.createdAt.toLocaleDateString()}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Updated At</dt><dd className="mt-1 text-gray-900">{record.updatedAt.toLocaleDateString()}</dd></div>
        </dl>
      </div>
    </div>
  );
}
