import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
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
      { value: "pre_load", label: "Pre-Load" },
      { value: "loading", label: "Loading" },
      { value: "discharge", label: "Discharge" },
      { value: "tally", label: "Tally" },
    ],
  },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "hsCode", label: "HS Code", type: "text" },
  { name: "packageType", label: "Package Type", type: "text" },
  { name: "declaredQuantity", label: "Declared Quantity", type: "number" },
  { name: "surveyedQuantity", label: "Surveyed Quantity", type: "number" },
  { name: "declaredWeightKg", label: "Declared Weight (kg)", type: "text", placeholder: "0.00" },
  { name: "surveyedWeightKg", label: "Surveyed Weight (kg)", type: "text", placeholder: "0.00" },
  { name: "weightVarianceKg", label: "Weight Variance (kg)", type: "text", placeholder: "0.00" },
  {
    name: "cargoCondition",
    label: "Cargo Condition",
    type: "select",
    options: [
      { value: "good", label: "Good" },
      { value: "damaged", label: "Damaged" },
      { value: "mixed", label: "Mixed" },
      { value: "wet", label: "Wet" },
    ],
  },
  { name: "damageDescription", label: "Damage Description", type: "textarea" },
  { name: "surveyorName", label: "Surveyor Name", type: "text" },
  { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
  { name: "surveyorLicense", label: "Surveyor License", type: "text" },
  { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
  { name: "completedAt", label: "Completed At", type: "datetime-local" },
  { name: "clientName", label: "Client Name", type: "text" },
  { name: "clientRef", label: "Client Ref", type: "text" },
  { name: "recommendations", label: "Recommendations", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCargoSurveyPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:create"))) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/survey-inspection-management/cargo-surveys"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Package className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Cargo Survey</h1>
          <p className="text-sm text-muted-foreground">
            Create a new cargo survey record
          </p>
        </div>
      </div>

      <SimForm
        entityType="Cargo Survey"
        apiPath="/api/v1/survey-inspection-management/cargo-surveys"
        fields={fields}
        returnPath="/survey-inspection-management/cargo-surveys"
      />
    </div>
  );
}
