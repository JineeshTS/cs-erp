import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Anchor } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";

const fields: FieldConfig[] = [
  {
    name: "policyType",
    label: "Policy Type",
    type: "select",
    required: true,
    options: [
      { value: "hull_machinery", label: "Hull & Machinery" },
      { value: "increased_value", label: "Increased Value" },
      { value: "loss_of_hire", label: "Loss of Hire" },
      { value: "war_risk", label: "War Risk" },
    ],
  },
  { name: "insurerName", label: "Insurer Name", type: "text", required: true },
  { name: "insurerContactName", label: "Insurer Contact Name", type: "text" },
  { name: "insurerContactEmail", label: "Insurer Contact Email", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "vesselValue", label: "Vessel Value", type: "text" },
  { name: "insuredValue", label: "Insured Value", type: "text" },
  { name: "valueCurrency", label: "Value Currency", type: "text" },
  { name: "coverageStart", label: "Coverage Start", type: "datetime-local" },
  { name: "coverageEnd", label: "Coverage End", type: "datetime-local" },
  { name: "premiumAmount", label: "Premium Amount", type: "text" },
  { name: "premiumCurrency", label: "Premium Currency", type: "text" },
  { name: "deductibleAmount", label: "Deductible Amount", type: "text" },
  { name: "tradingLimits", label: "Trading Limits", type: "textarea" },
  { name: "classificationRequired", label: "Classification Required", type: "checkbox" },
  { name: "conditionSurveyRequired", label: "Condition Survey Required", type: "checkbox" },
  { name: "lastSurveyDate", label: "Last Survey Date", type: "datetime-local" },
  { name: "renewalDate", label: "Renewal Date", type: "datetime-local" },
  { name: "brokerName", label: "Broker Name", type: "text" },
  { name: "brokerRef", label: "Broker Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewHullMachineryInsurancePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:create"))) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/insurance-claims-management/hull-machinery-insurances"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Anchor className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New H&M Insurance</h1>
          <p className="text-sm text-muted-foreground">
            Create a new hull & machinery insurance record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="H&M Insurance"
        apiPath="/api/v1/insurance-claims-management/hull-machinery-insurances"
        fields={fields}
        returnPath="/insurance-claims-management/hull-machinery-insurances"
      />
    </div>
  );
}
