import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewAssetRegistryPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:create")))
    redirect("/fixed-assets-management/asset-registries");

  const currencyOpts = await getCurrencyOptions();

  const ASSET_REGISTRY_FIELDS: FieldConfig[] = [
    {
      name: "assetType",
      label: "Asset Type",
      type: "select",
      required: true,
      options: [
        { value: "vessel", label: "Vessel" },
        { value: "container", label: "Container" },
        { value: "equipment", label: "Equipment" },
        { value: "vehicle", label: "Vehicle" },
        { value: "building", label: "Building" },
        { value: "land", label: "Land" },
        { value: "furniture", label: "Furniture" },
        { value: "it_equipment", label: "IT Equipment" },
      ],
    },
    { name: "assetName", label: "Asset Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "serialNumber", label: "Serial Number", type: "text" },
    { name: "barcode", label: "Barcode", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "subCategory", label: "Sub Category", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "department", label: "Department", type: "text" },
    { name: "custodian", label: "Custodian", type: "text" },
    {
      name: "acquisitionDate",
      label: "Acquisition Date",
      type: "datetime-local",
    },
    { name: "acquisitionCost", label: "Acquisition Cost", type: "text" },
    { name: "residualValue", label: "Residual Value", type: "text" },
    {
      name: "usefulLifeMonths",
      label: "Useful Life (Months)",
      type: "number",
    },
    { name: "currentBookValue", label: "Current Book Value", type: "text" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "depreciationMethod",
      label: "Depreciation Method",
      type: "select",
      options: [
        { value: "straight_line", label: "Straight Line" },
        { value: "declining_balance", label: "Declining Balance" },
        { value: "units_of_production", label: "Units of Production" },
        { value: "sum_of_years", label: "Sum of Years" },
      ],
    },
    {
      name: "warrantyExpiry",
      label: "Warranty Expiry",
      type: "datetime-local",
    },
    {
      name: "condition",
      label: "Condition",
      type: "select",
      options: [
        { value: "new", label: "New" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
        { value: "decommissioned", label: "Decommissioned" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/asset-registries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Asset Registry
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Asset Registry"
          apiPath="/api/v1/fixed-assets-management/asset-registries"
          fields={ASSET_REGISTRY_FIELDS}
          returnPath="/fixed-assets-management/asset-registries"
        />
      </div>
    </div>
  );
}
