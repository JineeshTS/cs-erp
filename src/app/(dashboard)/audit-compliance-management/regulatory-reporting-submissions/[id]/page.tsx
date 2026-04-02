import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRegulatoryReportingSubmission } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function statusBadgeVariant(status: string) {
  if (status === "submitted" || status === "accepted") return "success" as const;
  if (status === "rejected" || status === "overdue") return "destructive" as const;
  if (status === "in_review" || status === "pending") return "warning" as const;
  return "secondary" as const;
}

export default async function RegulatoryReportingSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "audit:edit"
  );

  const { id } = await params;
  const record = await getRegulatoryReportingSubmission(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/regulatory-reporting-submissions"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.title}
            </h1>
            <p className="text-sm text-gray-500">{record.submissionRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/regulatory-reporting-submissions/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Submission Ref</p>
            <p className="mt-1 text-sm text-gray-900">{record.submissionRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Submission Type</p>
            <p className="mt-1 text-sm text-gray-900">{record.submissionType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Regulation</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.regulation || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Authority</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.authority || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Jurisdiction</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.jurisdiction || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Reporting Period Start
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.reportingPeriodStart)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Reporting Period End
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.reportingPeriodEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Due Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Submission Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.submissionDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Submission Format
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.submissionFormat || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Submission Channel
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.submissionChannel || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Acknowledgment Ref
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.acknowledgmentRef || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Acknowledgment Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.acknowledgmentDate)}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">
              Rejection Reason
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.rejectionReason || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Prepared By</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.preparedBy || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reviewed By</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.reviewedBy || "-"}
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
