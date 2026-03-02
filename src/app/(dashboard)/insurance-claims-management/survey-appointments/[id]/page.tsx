import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, ClipboardList } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSurveyAppointment } from "@/lib/insurance-claims-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    case "in_progress":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function SurveyAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const { id } = await params;
  const record = await getSurveyAppointment(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/insurance-claims-management/survey-appointments"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <ClipboardList className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.appointmentRef}</h1>
            <p className="text-sm text-muted-foreground">Survey Appointment Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:edit")) && (
          <Link
            href={`/insurance-claims-management/survey-appointments/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Appointment Ref</dt>
          <dd className="mt-1 text-sm">{record.appointmentRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Appointment Type</dt>
          <dd className="mt-1 text-sm">{record.appointmentType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claim Ref</dt>
          <dd className="mt-1 text-sm">{record.claimRef ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Policy Ref</dt>
          <dd className="mt-1 text-sm">{record.policyRef ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">IMO Number</dt>
          <dd className="mt-1 text-sm">{record.imoNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Port Name</dt>
          <dd className="mt-1 text-sm">{record.portName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Terminal Name</dt>
          <dd className="mt-1 text-sm">{record.terminalName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Surveyor Name</dt>
          <dd className="mt-1 text-sm">{record.surveyorName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Surveyor Company</dt>
          <dd className="mt-1 text-sm">{record.surveyorCompany ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Surveyor Email</dt>
          <dd className="mt-1 text-sm">{record.surveyorEmail ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Surveyor Phone</dt>
          <dd className="mt-1 text-sm">{record.surveyorPhone ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Appointed By</dt>
          <dd className="mt-1 text-sm">{record.appointedBy ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Appointed At</dt>
          <dd className="mt-1 text-sm">{record.appointedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Scheduled Date</dt>
          <dd className="mt-1 text-sm">{record.scheduledDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Completed Date</dt>
          <dd className="mt-1 text-sm">{record.completedDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Survey Scope</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.surveyScope ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Survey Findings</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.surveyFindings ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Report URL</dt>
          <dd className="mt-1 text-sm">{record.reportUrl ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Report Date</dt>
          <dd className="mt-1 text-sm">{record.reportDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Estimated Cost</dt>
          <dd className="mt-1 text-sm">{record.estimatedCost ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Actual Cost</dt>
          <dd className="mt-1 text-sm">{record.actualCost ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Cost Currency</dt>
          <dd className="mt-1 text-sm">{record.costCurrency ?? "-"}</dd>
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
