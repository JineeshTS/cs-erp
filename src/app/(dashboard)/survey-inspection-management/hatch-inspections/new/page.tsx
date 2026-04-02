import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewHatchInspectionPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:create"))) redirect("/login");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "inspectionType",
      label: "Inspection Type",
      type: "select",
      required: true,
      options: [
        { value: "pre_loading", label: "Pre-Loading" },
        { value: "intermediate", label: "Intermediate" },
        { value: "final", label: "Final" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "holdNumber", label: "Hold Number", type: "text" },
    { name: "hatchCoverType", label: "Hatch Cover Type", type: "text" },
    {
      name: "cleanliness",
      label: "Cleanliness",
      type: "select",
      options: [
        { value: "clean", label: "Clean" },
        { value: "acceptable", label: "Acceptable" },
        { value: "dirty", label: "Dirty" },
        { value: "contaminated", label: "Contaminated" },
      ],
    },
    {
      name: "dryness",
      label: "Dryness",
      type: "select",
      options: [
        { value: "dry", label: "Dry" },
        { value: "damp", label: "Damp" },
        { value: "wet", label: "Wet" },
      ],
    },
    { name: "odorFree", label: "Odor Free", type: "checkbox" },
    { name: "previousCargo", label: "Previous Cargo", type: "text" },
    { name: "residueFound", label: "Residue Found", type: "checkbox" },
    { name: "residueDescription", label: "Residue Description", type: "textarea" },
    {
      name: "hatchCoverSeal",
      label: "Hatch Cover Seal",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      name: "waterTightness",
      label: "Water Tightness",
      type: "select",
      options: [
        { value: "pass", label: "Pass" },
        { value: "fail", label: "Fail" },
      ],
    },
    { name: "ventilationOk", label: "Ventilation Ok", type: "checkbox" },
    { name: "bilgesClean", label: "Bilges Clean", type: "checkbox" },
    {
      name: "ladderCondition",
      label: "Ladder Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    { name: "lightingOk", label: "Lighting Ok", type: "checkbox" },
    {
      name: "cargoFitness",
      label: "Cargo Fitness",
      type: "select",
      options: [
        { value: "fit", label: "Fit" },
        { value: "conditional", label: "Conditional" },
        { value: "unfit", label: "Unfit" },
      ],
    },
    { name: "inspectorName", label: "Inspector Name", type: "text" },
    { name: "inspectorCompany", label: "Inspector Company", type: "text" },
    { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
    { name: "completedAt", label: "Completed At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight">New Hatch Inspection</h1>
          <p className="text-sm text-muted-foreground">
            Create a new hatch and hold inspection record
          </p>
        </div>
      </div>

      <SimForm
        entityType="Hatch Inspection"
        apiPath="/api/v1/survey-inspection-management/hatch-inspections"
        fields={fields}
        returnPath="/survey-inspection-management/hatch-inspections"
      />
    </div>
  );
}
