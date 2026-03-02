import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";

const DUTY_CALCULATION_FIELDS: FieldConfig[] = [
  { name: "clearanceRef", label: "Clearance Ref", type: "text" },
  { name: "hsCode", label: "HS Code", type: "text", required: true },
  { name: "hsDescription", label: "HS Description", type: "textarea" },
  { name: "originCountry", label: "Origin Country", type: "text" },
  { name: "destinationCountry", label: "Destination Country", type: "text" },
  {
    name: "valuationMethod",
    label: "Valuation Method",
    type: "select",
    options: [
      { value: "transaction_value", label: "Transaction Value" },
      { value: "deductive", label: "Deductive" },
      { value: "computed", label: "Computed" },
      { value: "fallback", label: "Fallback" },
    ],
  },
  { name: "cifValue", label: "CIF Value", type: "text", required: true, placeholder: "0.00" },
  { name: "cifCurrency", label: "CIF Currency", type: "text", required: true, placeholder: "USD" },
  { name: "exchangeRate", label: "Exchange Rate", type: "text", placeholder: "1.000000" },
  { name: "dutyRate", label: "Duty Rate", type: "text", placeholder: "0.0000" },
  { name: "dutyAmount", label: "Duty Amount", type: "text", placeholder: "0.00" },
  { name: "vatRate", label: "VAT Rate", type: "text", placeholder: "0.0000" },
  { name: "vatAmount", label: "VAT Amount", type: "text", placeholder: "0.00" },
  { name: "exciseRate", label: "Excise Rate", type: "text", placeholder: "0.0000" },
  { name: "exciseAmount", label: "Excise Amount", type: "text", placeholder: "0.00" },
  { name: "antidumpingDuty", label: "Anti-dumping Duty", type: "text", placeholder: "0.00" },
  { name: "safeguardDuty", label: "Safeguard Duty", type: "text", placeholder: "0.00" },
  { name: "totalDutyTax", label: "Total Duty/Tax", type: "text", placeholder: "0.00" },
  { name: "preferentialTariff", label: "Preferential Tariff", type: "checkbox" },
  { name: "ftaReference", label: "FTA Reference", type: "text" },
  { name: "exemptionCode", label: "Exemption Code", type: "text" },
  { name: "exemptionReason", label: "Exemption Reason", type: "textarea" },
  { name: "calculatedByName", label: "Calculated By", type: "text" },
  { name: "calculatedAt", label: "Calculated At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDutyCalculationPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/duty-calculations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/duty-calculations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Duty Calculation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="Duty Calculation"
          apiPath="/api/v1/customs-compliance-regulatory/duty-calculations"
          fields={DUTY_CALCULATION_FIELDS}
          returnPath="/customs-compliance-regulatory/duty-calculations"
        />
      </div>
    </div>
  );
}
