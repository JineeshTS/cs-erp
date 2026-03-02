import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCargoInsurancePolicy } from "@/lib/insurance-claims-management/service";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";

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
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "brokerName", label: "Broker Name", type: "text" },
  { name: "specialConditions", label: "Special Conditions", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCargoInsurancePolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getCargoInsurancePolicy(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/cargo-insurance-policies/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Package className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Cargo Insurance Policy</h1>
          <p className="text-sm text-muted-foreground">
            Update cargo insurance policy record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Cargo Insurance Policy"
        apiPath={`/api/v1/insurance-claims-management/cargo-insurance-policies/${id}`}
        fields={fields}
        initialData={{
          policyType: record.policyType ?? "",
          insurerName: record.insurerName ?? "",
          insuredParty: record.insuredParty ?? "",
          coverageType: record.coverageType ?? "",
          cargoDescription: record.cargoDescription ?? "",
          hsCode: record.hsCode ?? "",
          cargoValue: record.cargoValue ?? "",
          insuredValue: record.insuredValue ?? "",
          valueCurrency: record.valueCurrency ?? "",
          coverageStart: record.coverageStart?.toISOString() ?? "",
          coverageEnd: record.coverageEnd?.toISOString() ?? "",
          premiumAmount: record.premiumAmount ?? "",
          premiumRate: record.premiumRate ?? "",
          premiumCurrency: record.premiumCurrency ?? "",
          deductibleAmount: record.deductibleAmount ?? "",
          originPort: record.originPort ?? "",
          destinationPort: record.destinationPort ?? "",
          vesselName: record.vesselName ?? "",
          voyageNumber: record.voyageNumber ?? "",
          bookingRef: record.bookingRef ?? "",
          blNumber: record.blNumber ?? "",
          certificateNumber: record.certificateNumber ?? "",
          brokerName: record.brokerName ?? "",
          specialConditions: record.specialConditions ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/cargo-insurance-policies/${id}`}
      />
    </div>
  );
}
