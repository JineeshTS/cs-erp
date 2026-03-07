import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getQualityClaim } from "@/lib/bunker-fuel-management/service";
import { BfmForm, FieldConfig } from "@/components/bunker-fuel-management/bfm-form";
import { getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditQualityClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:edit")))
    redirect("/bunker-fuel-management/quality-claims");

  const [vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
      type: "select", options: customerOpts,
      required: true,
    },
    {
      name: "vesselName",
      label: "Vessel Name",
      type: "select", options: vesselOpts,
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
      type: "select", options: currencyOpts,
    },
    {
      name: "quantityDisputed",
      label: "Quantity Disputed",
      type: "number",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const claim = await getQualityClaim(id, session.tenantId);
  if (!claim) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/bunker-fuel-management/quality-claims/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Quality Claim
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Quality Claim"
          apiPath={`/api/v1/bunker-fuel-management/quality-claims/${id}`}
          fields={QUALITY_CLAIM_FIELDS}
          initialData={{
            testId: claim.testId ?? "",
            orderId: claim.orderId ?? "",
            supplierName: claim.supplierName,
            vesselName: claim.vesselName,
            claimType: claim.claimType,
            claimDescription: claim.claimDescription ?? "",
            claimAmount: claim.claimAmount
              ? Number(claim.claimAmount)
              : "",
            currency: claim.currency ?? "",
            quantityDisputed: claim.quantityDisputed
              ? Number(claim.quantityDisputed)
              : "",
            notes: claim.notes ?? "",
          }}
          isEdit
          returnPath={`/bunker-fuel-management/quality-claims/${id}`}
        />
      </div>
    </div>
  );
}
