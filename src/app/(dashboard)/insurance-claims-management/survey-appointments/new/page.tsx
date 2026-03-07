import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewSurveyAppointmentPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:create"))) redirect("/login");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "appointmentType",
      label: "Appointment Type",
      type: "select",
      required: true,
      options: [
        { value: "damage_survey", label: "Damage Survey" },
        { value: "condition_survey", label: "Condition Survey" },
        { value: "cargo_survey", label: "Cargo Survey" },
        { value: "pni_survey", label: "P&I Survey" },
        { value: "hull_survey", label: "Hull Survey" },
      ],
    },
    { name: "claimRef", label: "Claim Ref", type: "text" },
    { name: "policyRef", label: "Policy Ref", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "terminalName", label: "Terminal Name", type: "text" },
    { name: "surveyorName", label: "Surveyor Name", type: "text" },
    { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
    { name: "surveyorEmail", label: "Surveyor Email", type: "text" },
    { name: "surveyorPhone", label: "Surveyor Phone", type: "text" },
    { name: "appointedBy", label: "Appointed By", type: "text" },
    { name: "appointedAt", label: "Appointed At", type: "datetime-local" },
    { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
    { name: "completedDate", label: "Completed Date", type: "datetime-local" },
    { name: "surveyScope", label: "Survey Scope", type: "textarea" },
    { name: "surveyFindings", label: "Survey Findings", type: "textarea" },
    { name: "reportUrl", label: "Report URL", type: "text" },
    { name: "reportDate", label: "Report Date", type: "datetime-local" },
    { name: "estimatedCost", label: "Estimated Cost", type: "text" },
    { name: "actualCost", label: "Actual Cost", type: "text" },
    { name: "costCurrency", label: "Cost Currency", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight">New Survey Appointment</h1>
          <p className="text-sm text-muted-foreground">
            Create a new survey appointment record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Survey Appointment"
        apiPath="/api/v1/insurance-claims-management/survey-appointments"
        fields={fields}
        returnPath="/insurance-claims-management/survey-appointments"
      />
    </div>
  );
}
