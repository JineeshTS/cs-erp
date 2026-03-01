import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCapexItem } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function EditCapexItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");

  const { id } = await params;
  const item = await getCapexItem(id, session.tenantId);
  if (!item) notFound();

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
      type: "text",
      placeholder: "USD",
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

  const initialData: Record<string, unknown> = {
    assetName: item.assetName,
    assetCategory: item.assetCategory,
    costCentre: item.costCentre,
    currency: item.currency,
    acquisitionCost: item.acquisitionCost,
    residualValue: item.residualValue,
    usefulLifeMonths: item.usefulLifeMonths,
    depreciationMethod: item.depreciationMethod,
    acquisitionDate: item.acquisitionDate
      ? new Date(item.acquisitionDate).toISOString()
      : null,
    inServiceDate: item.inServiceDate
      ? new Date(item.inServiceDate).toISOString()
      : null,
    notes: item.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/capex-items/${item.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {item.capexRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update CAPEX item details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="CAPEX Item"
          apiPath={`/api/v1/costing-financial-management/capex-items/${item.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/capex-items"
        />
      </div>
    </div>
  );
}
