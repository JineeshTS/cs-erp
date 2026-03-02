import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Container } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";

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
  { name: "depotLocation", label: "Depot Location", type: "text" },
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

export default async function NewContainerSurveyPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:create"))) redirect("/login");

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight">New Container Survey</h1>
          <p className="text-sm text-muted-foreground">
            Create a new container condition survey record
          </p>
        </div>
      </div>

      <SimForm
        entityType="Container Survey"
        apiPath="/api/v1/survey-inspection-management/container-surveys"
        fields={fields}
        returnPath="/survey-inspection-management/container-surveys"
      />
    </div>
  );
}
