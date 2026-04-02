import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewCapexItemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");


  const currencyOpts = await getCurrencyOptions();
  const fields: FieldConfig[] = [
    { name: "assetName", label: "Asset Name", type: "text", required: true },
    {
      name: "assetCategory",
      label: "Asset Category",
      type: "select",
      required: true,
      options: [
        { value: "vessel", label: "Vessel" },
        { value: "container", label: "Container" },
        { value: "equipment", label: "Equipment" },
        { value: "it_system", label: "IT System" },
        { value: "building", label: "Building" },
        { value: "vehicle", label: "Vehicle" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "costCentre", label: "Cost Centre", type: "text" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "acquisitionCost",
      label: "Acquisition Cost",
      type: "number",
      required: true,
    },
    { name: "residualValue", label: "Residual Value", type: "number" },
    {
      name: "usefulLifeMonths",
      label: "Useful Life (Months)",
      type: "number",
      required: true,
    },
    {
      name: "depreciationMethod",
      label: "Depreciation Method",
      type: "select",
      required: true,
      options: [
        { value: "straight_line", label: "Straight Line" },
        { value: "declining_balance", label: "Declining Balance" },
        { value: "units_of_production", label: "Units of Production" },
        { value: "sum_of_years", label: "Sum of Years" },
      ],
    },
    {
      name: "acquisitionDate",
      label: "Acquisition Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "inServiceDate",
      label: "In-Service Date",
      type: "datetime-local",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/costing-financial-management/capex-items"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New CAPEX Item
          </h1>
          <p className="text-sm text-gray-500">
            Register a new capital expenditure asset
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="CAPEX Item"
          apiPath="/api/v1/costing-financial-management/capex-items"
          fields={fields}
          returnPath="/costing-financial-management/capex-items"
        />
      </div>
    </div>
  );
}
