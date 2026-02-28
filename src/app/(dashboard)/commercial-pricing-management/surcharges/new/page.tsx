import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "surchargeCode", label: "Surcharge Code", type: "text", required: true },
  { name: "surchargeName", label: "Surcharge Name", type: "text", required: true },
  {
    name: "surchargeType",
    label: "Surcharge Type",
    type: "select",
    options: [
      { label: "BAF", value: "baf" },
      { label: "CAF", value: "caf" },
      { label: "PSS", value: "pss" },
      { label: "EFS", value: "efs" },
      { label: "War Risk", value: "war_risk" },
      { label: "Piracy", value: "piracy" },
      { label: "Congestion", value: "congestion" },
      { label: "Low Sulphur", value: "low_sulphur" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "calculationBasis",
    label: "Calculation Basis",
    type: "select",
    options: [
      { label: "Fixed", value: "fixed" },
      { label: "Percentage", value: "percentage" },
      { label: "Per TEU", value: "per_teu" },
      { label: "Per Container", value: "per_container" },
      { label: "Per B/L", value: "per_bl" },
    ],
  },
  { name: "amount", label: "Amount", type: "number" },
  { name: "percentage", label: "Percentage", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "e.g. USD" },
  {
    name: "applicableTo",
    label: "Applicable To",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Import", value: "import" },
      { label: "Export", value: "export" },
      { label: "Transhipment", value: "transhipment" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "isMandatory", label: "Mandatory", type: "checkbox" },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSurchargePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/surcharges"
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">New Surcharge</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Surcharge"
          fields={fields}
          apiPath="/api/v1/commercial-pricing-management/surcharges"
          returnPath="/commercial-pricing-management/surcharges"
        />
      </div>
    </div>
  );
}
