import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPerformanceAppraisal } from "@/lib/hr-payroll-shore-staff/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function ratingBadgeVariant(rating: string | null | undefined) {
  if (!rating) return "secondary" as const;
  if (rating === "exceptional" || rating === "exceeds")
    return "success" as const;
  if (rating === "meets") return "warning" as const;
  if (rating === "needs_improvement" || rating === "unsatisfactory")
    return "destructive" as const;
  return "secondary" as const;
}

function statusBadgeVariant(status: string) {
  if (status === "completed" || status === "approved")
    return "success" as const;
  if (status === "cancelled" || status === "rejected")
    return "destructive" as const;
  if (status === "in_progress" || status === "pending")
    return "warning" as const;
  return "secondary" as const;
}

export default async function PerformanceAppraisalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "hr:edit"
  );

  const { id } = await params;
  const record = await getPerformanceAppraisal(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/hr-payroll-shore-staff/performance-appraisals"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.appraisalRef}
            </h1>
            <p className="text-sm text-gray-500">
              {record.employeeName || "Performance Appraisal"}
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/hr-payroll-shore-staff/performance-appraisals/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Appraisal Ref</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.appraisalRef}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Appraisal Type</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.appraisalType}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Employee Ref</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.employeeRef || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Employee Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.employeeName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Review Period Start
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.reviewPeriodStart)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Review Period End
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.reviewPeriodEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reviewer</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.reviewer || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Reviewer Designation
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.reviewerDesignation || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Overall Score</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.overallScore || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Overall Rating</p>
            <div className="mt-1">
              {record.overallRating ? (
                <Badge variant={ratingBadgeVariant(record.overallRating)}>
                  {record.overallRating}
                </Badge>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Strengths</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.strengths || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">
              Areas for Improvement
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.areasForImprovement || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Promotion Recommendation
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.promotionRecommendation ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Salary Revision
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.salaryRevision || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
