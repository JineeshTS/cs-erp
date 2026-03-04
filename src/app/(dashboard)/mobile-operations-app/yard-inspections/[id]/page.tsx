import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getYardInspection } from "@/lib/mobile-operations-app/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function YardInspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:read")))
    redirect("/mobile-operations-app");

  const { id } = await params;

  const record = await getYardInspection(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "mob:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/yard-inspections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.inspectionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.inspectionType?.replace(/_/g, " ")} &middot; {record.yardSection || "No section"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/mobile-operations-app/yard-inspections/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Inspection Ref</dt>
            <dd className="mt-1 text-gray-900">{record.inspectionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inspection Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.inspectionType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Yard Section</dt>
            <dd className="mt-1 text-gray-900">{record.yardSection || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inspector Name</dt>
            <dd className="mt-1 text-gray-900">{record.inspectorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Containers Checked</dt>
            <dd className="mt-1 text-gray-900">{record.containersChecked ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issues Found</dt>
            <dd className="mt-1 text-gray-900">{record.issuesFound ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Critical Issues</dt>
            <dd className="mt-1 text-gray-900">{record.criticalIssues ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completion %</dt>
            <dd className="mt-1 text-gray-900">{record.completionPct ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started At</dt>
            <dd className="mt-1 text-gray-900">
              {record.startedAt ? record.startedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.completedAt ? record.completedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weather Condition</dt>
            <dd className="mt-1 text-gray-900">{record.weatherCondition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Photo Count</dt>
            <dd className="mt-1 text-gray-900">{record.photoCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
