import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Award } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getClassificationSurvey } from "@/lib/survey-inspection-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "overdue":
      return "destructive";
    case "in_progress":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function ClassificationSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read"))) redirect("/login");

  const { id } = await params;
  const record = await getClassificationSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/survey-inspection-management/classification-surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Award className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.surveyRef}</h1>
            <p className="text-sm text-muted-foreground">Classification Survey Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "survey:edit")) && (
          <Link
            href={`/survey-inspection-management/classification-surveys/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Survey Ref</dt>
          <dd className="mt-1 text-sm">{record.surveyRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Survey Type</dt>
          <dd className="mt-1 text-sm">{record.surveyType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">IMO Number</dt>
          <dd className="mt-1 text-sm">{record.imoNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Classification Society</dt>
          <dd className="mt-1 text-sm">{record.classificationSociety}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Class Notation</dt>
          <dd className="mt-1 text-sm">{record.classNotation ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Surveyor Name</dt>
          <dd className="mt-1 text-sm">{record.surveyorName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Surveyor ID</dt>
          <dd className="mt-1 text-sm">{record.surveyorId ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Survey Location</dt>
          <dd className="mt-1 text-sm">{record.surveyLocation ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Certificate Type</dt>
          <dd className="mt-1 text-sm">{record.certificateType ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Certificate Number</dt>
          <dd className="mt-1 text-sm">{record.certificateNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Certificate Issued At</dt>
          <dd className="mt-1 text-sm">{record.certificateIssuedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Certificate Expires At</dt>
          <dd className="mt-1 text-sm">{record.certificateExpiresAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Window Start</dt>
          <dd className="mt-1 text-sm">{record.windowStart?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Window End</dt>
          <dd className="mt-1 text-sm">{record.windowEnd?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Findings Count</dt>
          <dd className="mt-1 text-sm">{record.findingsCount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Rectification Deadline</dt>
          <dd className="mt-1 text-sm">{record.rectificationDeadline?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Rectified At</dt>
          <dd className="mt-1 text-sm">{record.rectifiedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Scheduled At</dt>
          <dd className="mt-1 text-sm">{record.scheduledAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Completed At</dt>
          <dd className="mt-1 text-sm">{record.completedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Overall Result</dt>
          <dd className="mt-1 text-sm">{record.overallResult ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
          <dd className="mt-1 text-sm">{record.createdAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
          <dd className="mt-1 text-sm">{record.updatedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
