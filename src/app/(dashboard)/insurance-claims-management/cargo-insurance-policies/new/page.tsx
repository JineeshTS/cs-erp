import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewCargoInsurancePolicyPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:create"))) redirect("/login");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "policyType",
      label: "Policy Type",
      type: "select",
      required: true,
      options: [
        { value: "open_cover", label: "Open Cover" },
        { value: "specific_voyage", label: "Specific Voyage" },
        { value: "annual", label: "Annual" },
        { value: "warehouse_to_warehouse", label: "Warehouse to Warehouse" },
      ],
    },
    { name: "insurerName", label: "Insurer Name", type: "text", required: true },
    { name: "insuredParty", label: "Insured Party", type: "text" },
    {
      name: "coverageType",
      label: "Coverage Type",
      type: "select",
      options: [
        { value: "all_risk", label: "All Risk" },
        { value: "fpa", label: "FPA" },
        { value: "wa", label: "WA" },
        { value: "icc_a", label: "ICC A" },
        { value: "icc_b", label: "ICC B" },
        { value: "icc_c", label: "ICC C" },
      ],
    },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "hsCode", label: "HS Code", type: "text" },
    { name: "cargoValue", label: "Cargo Value", type: "text" },
    { name: "insuredValue", label: "Insured Value", type: "text" },
    { name: "valueCurrency", label: "Value Currency", type: "text" },
    { name: "coverageStart", label: "Coverage Start", type: "datetime-local" },
    { name: "coverageEnd", label: "Coverage End", type: "datetime-local" },
    { name: "premiumAmount", label: "Premium Amount", type: "text" },
    { name: "premiumRate", label: "Premium Rate", type: "text" },
    { name: "premiumCurrency", label: "Premium Currency", type: "text" },
    { name: "deductibleAmount", label: "Deductible Amount", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "blNumber", label: "BL Number", type: "text" },
    { name: "certificateNumber", label: "Certificate Number", type: "text" },
    { name: "brokerName", label: "Broker Name", type: "text" },
    { name: "specialConditions", label: "Special Conditions", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/insurance-claims-management/cargo-insurance-policies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Package className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Cargo Insurance Policy</h1>
          <p className="text-sm text-muted-foreground">
            Create a new cargo insurance policy record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Cargo Insurance Policy"
        apiPath="/api/v1/insurance-claims-management/cargo-insurance-policies"
        fields={fields}
        returnPath="/insurance-claims-management/cargo-insurance-policies"
      />
    </div>
  );
}
