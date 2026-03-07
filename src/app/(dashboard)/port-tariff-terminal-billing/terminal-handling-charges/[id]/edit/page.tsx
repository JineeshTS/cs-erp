import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTerminalHandlingCharge } from "@/lib/port-tariff-terminal-billing/service";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditTerminalHandlingChargePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:edit")))
    redirect("/");

  const portOpts = await getPortOptions(session.tenantId);

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
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
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
  const { id } = await params;
  const record = await getTerminalHandlingCharge(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    chargeType: record.chargeType ?? "",
    portCode: record.portCode ?? "",
    portName: record.portName ?? "",
    terminalName: record.terminalName ?? "",
    terminalCode: record.terminalCode ?? "",
    containerSize: record.containerSize ?? "",
    containerType: record.containerType ?? "",
    cargoCategory: record.cargoCategory ?? "",
    chargeAmountBase: record.chargeAmountBase ?? "",
    chargeCurrency: record.chargeCurrency ?? "",
    chargePerUnit: record.chargePerUnit ?? "",
    effectiveFrom: record.effectiveFrom
      ? new Date(record.effectiveFrom).toISOString().slice(0, 16)
      : "",
    effectiveTo: record.effectiveTo
      ? new Date(record.effectiveTo).toISOString().slice(0, 16)
      : "",
    surchargePercentage: record.surchargePercentage ?? "",
    peakSeasonMultiplier: record.peakSeasonMultiplier ?? "",
    exemptionApplicable: record.exemptionApplicable ? "true" : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/port-tariff-terminal-billing/terminal-handling-charges/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.chargeRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update terminal handling charge details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Terminal Handling Charge"
          apiPath={`/api/v1/port-tariff-terminal-billing/terminal-handling-charges/${id}`}
          returnPath="/port-tariff-terminal-billing/terminal-handling-charges"
          fields={THC_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
