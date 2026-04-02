import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Container } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getContainerSurvey } from "@/lib/survey-inspection-management/service";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditContainerSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:edit"))) redirect("/login");

  const portOpts = await getPortOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "surveyType",
      label: "Survey Type",
      type: "select",
      required: true,
      options: [
        { value: "on_hire", label: "On-Hire" },
        { value: "off_hire", label: "Off-Hire" },
        { value: "periodic", label: "Periodic" },
        { value: "damage", label: "Damage" },
      ],
    },
    { name: "containerNumber", label: "Container Number", type: "text", required: true },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSizeIso", label: "Container Size ISO", type: "text" },
    { name: "ownerOperator", label: "Owner / Operator", type: "text" },
    { name: "depotName", label: "Depot Name", type: "text" },
    { name: "depotLocation", label: "Depot Location", type: "select", options: portOpts },
    {
      name: "overallCondition",
      label: "Overall Condition",
      type: "select",
      options: [
        { value: "a_grade", label: "A Grade" },
        { value: "b_grade", label: "B Grade" },
        { value: "c_grade", label: "C Grade" },
        { value: "damaged", label: "Damaged" },
      ],
    },
    {
      name: "structuralCondition",
      label: "Structural Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    {
      name: "floorCondition",
      label: "Floor Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    {
      name: "roofCondition",
      label: "Roof Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    {
      name: "doorCondition",
      label: "Door Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    {
      name: "paintCondition",
      label: "Paint Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
      ],
    },
    { name: "cscPlateValid", label: "CSC Plate Valid", type: "checkbox" },
    { name: "cscExpiryDate", label: "CSC Expiry Date", type: "datetime-local" },
    { name: "mnrRequired", label: "MNR Required", type: "checkbox" },
    { name: "mnrEstimateCost", label: "MNR Estimate Cost", type: "text", placeholder: "0.00" },
    { name: "mnrCurrency", label: "MNR Currency", type: "text", placeholder: "USD" },
    { name: "mnrApproved", label: "MNR Approved", type: "checkbox" },
    { name: "mnrCompletedAt", label: "MNR Completed At", type: "datetime-local" },
    { name: "surveyorName", label: "Surveyor Name", type: "text" },
    { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
    { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
    { name: "completedAt", label: "Completed At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getContainerSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/survey-inspection-management/container-surveys/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Container className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Container Survey</h1>
          <p className="text-sm text-muted-foreground">
            Update container survey record
          </p>
        </div>
      </div>

      <SimForm
        entityType="Container Survey"
        apiPath={`/api/v1/survey-inspection-management/container-surveys/${id}`}
        fields={fields}
        initialData={{
          surveyType: record.surveyType ?? "",
          containerNumber: record.containerNumber ?? "",
          containerType: record.containerType ?? "",
          containerSizeIso: record.containerSizeIso ?? "",
          ownerOperator: record.ownerOperator ?? "",
          depotName: record.depotName ?? "",
          depotLocation: record.depotLocation ?? "",
          overallCondition: record.overallCondition ?? "",
          structuralCondition: record.structuralCondition ?? "",
          floorCondition: record.floorCondition ?? "",
          roofCondition: record.roofCondition ?? "",
          doorCondition: record.doorCondition ?? "",
          paintCondition: record.paintCondition ?? "",
          cscPlateValid: record.cscPlateValid ?? false,
          cscExpiryDate: record.cscExpiryDate?.toISOString() ?? "",
          mnrRequired: record.mnrRequired ?? false,
          mnrEstimateCost: record.mnrEstimateCost ?? "",
          mnrCurrency: record.mnrCurrency ?? "",
          mnrApproved: record.mnrApproved ?? false,
          mnrCompletedAt: record.mnrCompletedAt?.toISOString() ?? "",
          surveyorName: record.surveyorName ?? "",
          surveyorCompany: record.surveyorCompany ?? "",
          scheduledAt: record.scheduledAt?.toISOString() ?? "",
          completedAt: record.completedAt?.toISOString() ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/survey-inspection-management/container-surveys/${id}`}
      />
    </div>
  );
}
