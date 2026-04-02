import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, DoorOpen } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getHatchInspection } from "@/lib/survey-inspection-management/service";
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

export default async function HatchInspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read"))) redirect("/login");

  const { id } = await params;
  const record = await getHatchInspection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/survey-inspection-management/hatch-inspections"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <DoorOpen className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.inspectionRef}</h1>
            <p className="text-sm text-muted-foreground">Hatch Inspection Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "survey:edit")) && (
          <Link
            href={`/survey-inspection-management/hatch-inspections/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Inspection Ref</dt>
          <dd className="mt-1 text-sm">{record.inspectionRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Inspection Type</dt>
          <dd className="mt-1 text-sm">{record.inspectionType}</dd>
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
          <dt className="text-sm font-medium text-muted-foreground">Voyage Number</dt>
          <dd className="mt-1 text-sm">{record.voyageNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Port Name</dt>
          <dd className="mt-1 text-sm">{record.portName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Hold Number</dt>
          <dd className="mt-1 text-sm">{record.holdNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Hatch Cover Type</dt>
          <dd className="mt-1 text-sm">{record.hatchCoverType ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Cleanliness</dt>
          <dd className="mt-1 text-sm">{record.cleanliness ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Dryness</dt>
          <dd className="mt-1 text-sm">{record.dryness ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Odor Free</dt>
          <dd className="mt-1 text-sm">{record.odorFree ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Previous Cargo</dt>
          <dd className="mt-1 text-sm">{record.previousCargo ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Residue Found</dt>
          <dd className="mt-1 text-sm">{record.residueFound ? "Yes" : "No"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Residue Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.residueDescription ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Hatch Cover Seal</dt>
          <dd className="mt-1 text-sm">{record.hatchCoverSeal ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Water Tightness</dt>
          <dd className="mt-1 text-sm">{record.waterTightness ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Ventilation Ok</dt>
          <dd className="mt-1 text-sm">{record.ventilationOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Bilges Clean</dt>
          <dd className="mt-1 text-sm">{record.bilgesClean ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Ladder Condition</dt>
          <dd className="mt-1 text-sm">{record.ladderCondition ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Lighting Ok</dt>
          <dd className="mt-1 text-sm">{record.lightingOk ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Cargo Fitness</dt>
          <dd className="mt-1 text-sm">{record.cargoFitness ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Inspector Name</dt>
          <dd className="mt-1 text-sm">{record.inspectorName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Inspector Company</dt>
          <dd className="mt-1 text-sm">{record.inspectorCompany ?? "-"}</dd>
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
