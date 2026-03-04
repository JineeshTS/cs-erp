import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getUatManagement } from "@/lib/implementation-change-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = { draft: "secondary", in_progress: "warning", completed: "success", verified: "success", rejected: "destructive" } as const;

export default async function UatManagementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:read")))
    redirect("/implementation-change-management");

  const { id } = await params;
  const record = await getUatManagement(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "icm:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/implementation-change-management/uat-managements" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.uatRef}</h1>
          <p className="text-sm text-gray-500">{record.uatType?.replace(/_/g, " ")} &middot; {record.title || "Untitled"}</p>
        </div>
        {canEdit && (
          <Link href={`/implementation-change-management/uat-managements/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm font-medium text-gray-500">UAT Ref</dt><dd className="mt-1 text-gray-900">{record.uatRef}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">UAT Type</dt><dd className="mt-1 text-gray-900 capitalize">{record.uatType?.replace(/_/g, " ")}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Title</dt><dd className="mt-1 text-gray-900">{record.title || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Module</dt><dd className="mt-1 text-gray-900">{record.module || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Test Case Count</dt><dd className="mt-1 text-gray-900">{record.testCaseCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Passed Count</dt><dd className="mt-1 text-gray-900">{record.passedCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Failed Count</dt><dd className="mt-1 text-gray-900">{record.failedCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Blocked Count</dt><dd className="mt-1 text-gray-900">{record.blockedCount ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Tester Name</dt><dd className="mt-1 text-gray-900">{record.testerName || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Test Start Date</dt><dd className="mt-1 text-gray-900">{record.testStartDate ? record.testStartDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Test End Date</dt><dd className="mt-1 text-gray-900">{record.testEndDate ? record.testEndDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Signoff Date</dt><dd className="mt-1 text-gray-900">{record.signoffDate ? record.signoffDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Status</dt><dd className="mt-1"><Badge variant={statusVariant[record.status as keyof typeof statusVariant] ?? "secondary"}>{record.status}</Badge></dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-sm font-medium text-gray-500">Notes</dt><dd className="mt-1 text-gray-900">{record.notes || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Created At</dt><dd className="mt-1 text-gray-900">{record.createdAt.toLocaleDateString()}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Updated At</dt><dd className="mt-1 text-gray-900">{record.updatedAt.toLocaleDateString()}</dd></div>
        </dl>
      </div>
    </div>
  );
}
