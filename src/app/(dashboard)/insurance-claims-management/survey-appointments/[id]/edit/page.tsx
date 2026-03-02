import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSurveyAppointment } from "@/lib/insurance-claims-management/service";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";

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
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
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

export default async function EditSurveyAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getSurveyAppointment(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/survey-appointments/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <ClipboardList className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Survey Appointment</h1>
          <p className="text-sm text-muted-foreground">
            Update survey appointment record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Survey Appointment"
        apiPath={`/api/v1/insurance-claims-management/survey-appointments/${id}`}
        fields={fields}
        initialData={{
          appointmentType: record.appointmentType ?? "",
          claimRef: record.claimRef ?? "",
          policyRef: record.policyRef ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          portName: record.portName ?? "",
          terminalName: record.terminalName ?? "",
          surveyorName: record.surveyorName ?? "",
          surveyorCompany: record.surveyorCompany ?? "",
          surveyorEmail: record.surveyorEmail ?? "",
          surveyorPhone: record.surveyorPhone ?? "",
          appointedBy: record.appointedBy ?? "",
          appointedAt: record.appointedAt?.toISOString() ?? "",
          scheduledDate: record.scheduledDate?.toISOString() ?? "",
          completedDate: record.completedDate?.toISOString() ?? "",
          surveyScope: record.surveyScope ?? "",
          surveyFindings: record.surveyFindings ?? "",
          reportUrl: record.reportUrl ?? "",
          reportDate: record.reportDate?.toISOString() ?? "",
          estimatedCost: record.estimatedCost ?? "",
          actualCost: record.actualCost ?? "",
          costCurrency: record.costCurrency ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/survey-appointments/${id}`}
      />
    </div>
  );
}
