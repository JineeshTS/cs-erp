import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewSparePartPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:create")))
    redirect("/vessel-technical-management/spare-parts");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const SPARE_PART_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "partNumber", label: "Part Number", type: "text", required: true },
    { name: "partName", label: "Part Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "engine", label: "Engine" },
        { value: "deck", label: "Deck" },
        { value: "electrical", label: "Electrical" },
        { value: "navigation", label: "Navigation" },
        { value: "safety", label: "Safety" },
        { value: "piping", label: "Piping" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "manufacturer", label: "Manufacturer", type: "text" },
    { name: "modelNumber", label: "Model Number", type: "text" },
    { name: "unitOfMeasure", label: "Unit of Measure", type: "text" },
    { name: "minimumStock", label: "Minimum Stock", type: "number" },
    { name: "currentStock", label: "Current Stock", type: "number" },
    { name: "reorderLevel", label: "Reorder Level", type: "number" },
    { name: "lastUnitPrice", label: "Last Unit Price", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "storageLocation", label: "Storage Location", type: "text" },
    { name: "criticalPart", label: "Critical Part", type: "checkbox" },
    { name: "leadTimeDays", label: "Lead Time (Days)", type: "number" },
    { name: "preferredSupplierName", label: "Preferred Supplier Name", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-technical-management/spare-parts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New Spare Part
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6 dark:bg-gray-900 dark:border-gray-700">
        <VtmForm
          entityType="Spare Part"
          apiPath="/api/v1/vessel-technical-management/spare-parts"
          fields={SPARE_PART_FIELDS}
          returnPath="/vessel-technical-management/spare-parts"
        />
      </div>
    </div>
  );
}
