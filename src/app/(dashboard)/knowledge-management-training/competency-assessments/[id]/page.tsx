import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCompetencyAssessment } from "@/lib/knowledge-management-training/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function CompetencyAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:read")))
    redirect("/knowledge-management-training");

  const { id } = await params;

  const record = await getCompetencyAssessment(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "kmt:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/competency-assessments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.assessmentRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.assessmentType?.replace(/_/g, " ")} &middot; {record.employeeName || "No employee name"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/knowledge-management-training/competency-assessments/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Assessment Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assessmentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assessment Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.assessmentType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee Name</dt>
            <dd className="mt-1 text-gray-900">{record.employeeName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
            <dd className="mt-1 text-gray-900">{record.employeeId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-gray-900">{record.department || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Competency Area</dt>
            <dd className="mt-1 text-gray-900">{record.competencyArea || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Level</dt>
            <dd className="mt-1 text-gray-900">{record.currentLevel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Level</dt>
            <dd className="mt-1 text-gray-900">{record.targetLevel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Score (%)</dt>
            <dd className="mt-1 text-gray-900">{record.scorePct || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assessed Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.assessedDate ? record.assessedDate.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Assessment Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.nextAssessmentDate ? record.nextAssessmentDate.toLocaleDateString() : "-"}
            </dd>
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
