import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Thermometer } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getReeferPtiSurvey } from "@/lib/survey-inspection-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "destructive";
    case "in_progress":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function ReeferPtiSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read"))) redirect("/login");

  const { id } = await params;
  const record = await getReeferPtiSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/survey-inspection-management/reefer-pti-surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Thermometer className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.surveyRef}</h1>
            <p className="text-sm text-muted-foreground">Reefer PTI Survey Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "survey:edit")) && (
          <Link
            href={`/survey-inspection-management/reefer-pti-surveys/${record.id}/edit`}
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
          <dt className="text-sm font-medium text-muted-foreground">Unit Manufacturer</dt>
          <dd className="mt-1 text-sm">{record.unitManufacturer ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Unit Model</dt>
          <dd className="mt-1 text-sm">{record.unitModel ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Unit Serial Number</dt>
          <dd className="mt-1 text-sm">{record.unitSerialNumber ?? "-"}</dd>
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
          <dt className="text-sm font-medium text-muted-foreground">Set Point Temp</dt>
          <dd className="mt-1 text-sm">{record.setPointTemp ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Supply Air Temp</dt>
          <dd className="mt-1 text-sm">{record.supplyAirTemp ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Return Air Temp</dt>
          <dd className="mt-1 text-sm">{record.returnAirTemp ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Ambient Temp</dt>
          <dd className="mt-1 text-sm">{record.ambientTemp ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Humidity Percent</dt>
          <dd className="mt-1 text-sm">{record.humidityPercent ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vent Setting</dt>
          <dd className="mt-1 text-sm">{record.ventSetting ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Defrost Ok</dt>
          <dd className="mt-1 text-sm">{record.defrostOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Compressor Ok</dt>
          <dd className="mt-1 text-sm">{record.compressorOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Condenser Ok</dt>
          <dd className="mt-1 text-sm">{record.condenserOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Evaporator Ok</dt>
          <dd className="mt-1 text-sm">{record.evaporatorOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Controller Ok</dt>
          <dd className="mt-1 text-sm">{record.controllerOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Gasket Ok</dt>
          <dd className="mt-1 text-sm">{record.gasketOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Power Supply Ok</dt>
          <dd className="mt-1 text-sm">{record.powerSupplyOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Data Logger Downloaded</dt>
          <dd className="mt-1 text-sm">{record.dataLoggerDownloaded ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Overall Result</dt>
          <dd className="mt-1 text-sm">{record.overallResult ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Technician Name</dt>
          <dd className="mt-1 text-sm">{record.technicianName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Technician Company</dt>
          <dd className="mt-1 text-sm">{record.technicianCompany ?? "-"}</dd>
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
          <dt className="text-sm font-medium text-muted-foreground">Next PTI Due</dt>
          <dd className="mt-1 text-sm">{record.nextPtiDue?.toLocaleDateString() ?? "-"}</dd>
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
