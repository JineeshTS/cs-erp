import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";

const THC_FIELDS: FieldConfig[] = [
  {
    name: "chargeType",
    label: "Charge Type",
    type: "select",
    required: true,
    options: [
      { value: "origin_thc", label: "Origin THC" },
      { value: "destination_thc", label: "Destination THC" },
      { value: "transshipment_thc", label: "Transshipment THC" },
      { value: "reefer_thc", label: "Reefer THC" },
      { value: "hazardous_thc", label: "Hazardous THC" },
    ],
  },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "terminalCode", label: "Terminal Code", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "cargoCategory", label: "Cargo Category", type: "text" },
  { name: "chargeAmountBase", label: "Charge Amount (Base)", type: "number" },
  { name: "chargeCurrency", label: "Charge Currency", type: "text" },
  { name: "chargePerUnit", label: "Charge Per Unit", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  {
    name: "surchargePercentage",
    label: "Surcharge Percentage",
    type: "number",
  },
  {
    name: "peakSeasonMultiplier",
    label: "Peak Season Multiplier",
    type: "number",
  },
  {
    name: "exemptionApplicable",
    label: "Exemption Applicable",
    type: "checkbox",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewTerminalHandlingChargePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/port-tariff-terminal-billing/terminal-handling-charges"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Terminal Handling Charge
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new THC rate record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Terminal Handling Charge"
          apiPath="/api/v1/port-tariff-terminal-billing/terminal-handling-charges"
          returnPath="/port-tariff-terminal-billing/terminal-handling-charges"
          fields={THC_FIELDS}
        />
      </div>
    </div>
  );
}
