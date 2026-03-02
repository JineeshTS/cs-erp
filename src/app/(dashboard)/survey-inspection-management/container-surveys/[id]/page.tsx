import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Container } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getContainerSurvey } from "@/lib/survey-inspection-management/service";
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

export default async function ContainerSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read"))) redirect("/login");

  const { id } = await params;
  const record = await getContainerSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/survey-inspection-management/container-surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Container className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.surveyRef}</h1>
            <p className="text-sm text-muted-foreground">Container Survey Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "survey:edit")) && (
          <Link
            href={`/survey-inspection-management/container-surveys/${record.id}/edit`}
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
          <dt className="text-sm font-medium text-muted-foreground">Container Number</dt>
          <dd className="mt-1 text-sm">{record.containerNumber}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Container Type</dt>
          <dd className="mt-1 text-sm">{record.containerType ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Container Size ISO</dt>
          <dd className="mt-1 text-sm">{record.containerSizeIso ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Owner / Operator</dt>
          <dd className="mt-1 text-sm">{record.ownerOperator ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Depot Name</dt>
          <dd className="mt-1 text-sm">{record.depotName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Depot Location</dt>
          <dd className="mt-1 text-sm">{record.depotLocation ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Overall Condition</dt>
          <dd className="mt-1 text-sm">{record.overallCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Structural Condition</dt>
          <dd className="mt-1 text-sm">{record.structuralCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Floor Condition</dt>
          <dd className="mt-1 text-sm">{record.floorCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Roof Condition</dt>
          <dd className="mt-1 text-sm">{record.roofCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Door Condition</dt>
          <dd className="mt-1 text-sm">{record.doorCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Paint Condition</dt>
          <dd className="mt-1 text-sm">{record.paintCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">CSC Plate Valid</dt>
          <dd className="mt-1 text-sm">{record.cscPlateValid ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">CSC Expiry Date</dt>
          <dd className="mt-1 text-sm">{record.cscExpiryDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">MNR Required</dt>
          <dd className="mt-1 text-sm">{record.mnrRequired ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">MNR Estimate Cost</dt>
          <dd className="mt-1 text-sm">{record.mnrEstimateCost ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">MNR Currency</dt>
          <dd className="mt-1 text-sm">{record.mnrCurrency ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">MNR Approved</dt>
          <dd className="mt-1 text-sm">{record.mnrApproved ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">MNR Completed At</dt>
          <dd className="mt-1 text-sm">{record.mnrCompletedAt?.toLocaleDateString() ?? "-"}</dd>
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
          <dt className="text-sm font-medium text-muted-foreground">Scheduled At</dt>
          <dd className="mt-1 text-sm">{record.scheduledAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Completed At</dt>
          <dd className="mt-1 text-sm">{record.completedAt?.toLocaleDateString() ?? "-"}</dd>
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
