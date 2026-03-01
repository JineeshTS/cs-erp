import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { BfmForm, FieldConfig } from "@/components/bunker-fuel-management/bfm-form";

const QUALITY_CLAIM_FIELDS: FieldConfig[] = [
  {
    name: "testId",
    label: "Test ID",
    type: "text",
    placeholder: "Test UUID",
  },
  {
    name: "orderId",
    label: "Order ID",
    type: "text",
    placeholder: "Order UUID",
  },
  {
    name: "supplierName",
    label: "Supplier Name",
    type: "text",
    required: true,
  },
  {
    name: "vesselName",
    label: "Vessel Name",
    type: "text",
    required: true,
  },
  {
    name: "claimType",
    label: "Claim Type",
    type: "select",
    required: true,
    options: [
      { value: "off_spec", label: "Off Spec" },
      { value: "quantity_short", label: "Quantity Short" },
      { value: "contamination", label: "Contamination" },
      { value: "water_content", label: "Water Content" },
      { value: "viscosity", label: "Viscosity" },
      { value: "sulphur", label: "Sulphur" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "claimDescription",
    label: "Claim Description",
    type: "textarea",
    required: true,
  },
  { name: "claimAmount", label: "Claim Amount", type: "number" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  {
    name: "quantityDisputed",
    label: "Quantity Disputed",
    type: "number",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewQualityClaimPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/quality-claims");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/quality-claims"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Quality Claim
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Quality Claim"
          apiPath="/api/v1/bunker-fuel-management/quality-claims"
          fields={QUALITY_CLAIM_FIELDS}
          returnPath="/bunker-fuel-management/quality-claims"
        />
      </div>
    </div>
  );
}
