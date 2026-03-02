import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Anchor } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getHullMachineryInsurance } from "@/lib/insurance-claims-management/service";
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

export default async function EditHullMachineryInsurancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getHullMachineryInsurance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/hull-machinery-insurances/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Anchor className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit H&M Insurance</h1>
          <p className="text-sm text-muted-foreground">
            Update hull & machinery insurance record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="H&M Insurance"
        apiPath={`/api/v1/insurance-claims-management/hull-machinery-insurances/${id}`}
        fields={fields}
        initialData={{
          policyType: record.policyType ?? "",
          insurerName: record.insurerName ?? "",
          insurerContactName: record.insurerContactName ?? "",
          insurerContactEmail: record.insurerContactEmail ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          vesselValue: record.vesselValue ?? "",
          insuredValue: record.insuredValue ?? "",
          valueCurrency: record.valueCurrency ?? "",
          coverageStart: record.coverageStart?.toISOString() ?? "",
          coverageEnd: record.coverageEnd?.toISOString() ?? "",
          premiumAmount: record.premiumAmount ?? "",
          premiumCurrency: record.premiumCurrency ?? "",
          deductibleAmount: record.deductibleAmount ?? "",
          tradingLimits: record.tradingLimits ?? "",
          classificationRequired: record.classificationRequired ?? false,
          conditionSurveyRequired: record.conditionSurveyRequired ?? false,
          lastSurveyDate: record.lastSurveyDate?.toISOString() ?? "",
          renewalDate: record.renewalDate?.toISOString() ?? "",
          brokerName: record.brokerName ?? "",
          brokerRef: record.brokerRef ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/hull-machinery-insurances/${id}`}
      />
    </div>
  );
}
