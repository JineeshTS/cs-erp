import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSurveyTracking } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

export default async function SurveyTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const { id } = await params;
  const record = await getSurveyTracking(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "technical:edit"
  );

  function statusVariant(
    s: string
  ): "success" | "destructive" | "secondary" {
    if (s === "completed") return "success";
    if (s === "overdue" || s === "expired") return "destructive";
    return "secondary";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vessel-technical-management/survey-trackings"
            className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.surveyRef}
            </h1>
            <p className="text-sm text-gray-500">Survey Tracking Detail</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>
            {record.status}
          </Badge>
          {canEdit && (
            <Link
              href={`/vessel-technical-management/survey-trackings/${record.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Vessel Name</p>
            <p className="mt-1 text-sm text-gray-900">{record.vesselName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Survey Type</p>
            <p className="mt-1 text-sm text-gray-900">{record.surveyType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Survey Authority
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.surveyAuthority}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Surveyor Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.surveyorName ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Due Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(record.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Survey Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.surveyDate
                ? new Date(record.surveyDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Completed Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.completedDate
                ? new Date(record.completedDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Expiry Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Certificate Name
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.certificateName ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Certificate Number
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.certificateNumber ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Issued By</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.issuedBy ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Remediation Required
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.remediationRequired ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(record.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Updated At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(record.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
