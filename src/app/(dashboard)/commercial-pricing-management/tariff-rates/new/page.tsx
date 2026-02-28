import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "tariffId", label: "Tariff ID", type: "text", placeholder: "UUID of parent tariff" },
  { name: "chargeCode", label: "Charge Code", type: "text", required: true },
  { name: "chargeName", label: "Charge Name", type: "text", required: true },
  {
    name: "chargeType",
    label: "Charge Type",
    type: "select",
    options: [
      { label: "Ocean Freight", value: "ocean_freight" },
      { label: "THC", value: "thc" },
      { label: "Documentation", value: "documentation" },
      { label: "Customs", value: "customs" },
      { label: "Inland", value: "inland" },
      { label: "Surcharge", value: "surcharge" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "basis",
    label: "Basis",
    type: "select",
    options: [
      { label: "Per Container", value: "per_container" },
      { label: "Per TEU", value: "per_teu" },
      { label: "Per B/L", value: "per_bl" },
      { label: "Per Shipment", value: "per_shipment" },
      { label: "Lumpsum", value: "lumpsum" },
    ],
  },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "unitPrice", label: "Unit Price", type: "number", required: true },
  { name: "minimumCharge", label: "Minimum Charge", type: "number" },
  { name: "maximumCharge", label: "Maximum Charge", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "e.g. USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewTariffRatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/tariff-rates"
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">New Tariff Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Tariff Rate"
          fields={fields}
          apiPath="/api/v1/commercial-pricing-management/tariff-rates"
          returnPath="/commercial-pricing-management/tariff-rates"
        />
      </div>
    </div>
  );
}
