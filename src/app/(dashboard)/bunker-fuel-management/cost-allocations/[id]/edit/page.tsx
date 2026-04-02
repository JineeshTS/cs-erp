import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCostAllocation } from "@/lib/bunker-fuel-management/service";
import { BfmForm, FieldConfig } from "@/components/bunker-fuel-management/bfm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditCostAllocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:edit")))
    redirect("/bunker-fuel-management/cost-allocations");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const COST_ALLOCATION_FIELDS: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    {
      name: "orderId",
      label: "Order ID",
      type: "text",
      placeholder: "Order UUID",
    },
    {
      name: "fuelType",
      label: "Fuel Type",
      type: "select",
      required: true,
      options: [
        { value: "VLSFO", label: "VLSFO" },
        { value: "HSFO", label: "HSFO" },
        { value: "LSMGO", label: "LSMGO" },
        { value: "MGO", label: "MGO" },
        { value: "MDO", label: "MDO" },
        { value: "LNG", label: "LNG" },
        { value: "ULSFO", label: "ULSFO" },
        { value: "HFO", label: "HFO" },
        { value: "BIOFUEL", label: "BIOFUEL" },
      ],
    },
    {
      name: "quantityAllocated",
      label: "Quantity Allocated",
      type: "number",
      required: true,
    },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      options: [
        { value: "MT", label: "MT" },
        { value: "CBM", label: "CBM" },
        { value: "LTR", label: "LTR" },
        { value: "GAL", label: "GAL" },
      ],
    },
    {
      name: "costPerUnit",
      label: "Cost Per Unit",
      type: "number",
      required: true,
    },
    { name: "totalCost", label: "Total Cost", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "allocationMethod",
      label: "Allocation Method",
      type: "select",
      required: true,
      options: [
        { value: "pro_rata", label: "Pro Rata" },
        { value: "direct", label: "Direct" },
        { value: "distance_based", label: "Distance Based" },
        { value: "cargo_weight", label: "Cargo Weight" },
        { value: "time_based", label: "Time Based" },
        { value: "manual", label: "Manual" },
      ],
    },
    { name: "legFrom", label: "Leg From", type: "text" },
    { name: "legTo", label: "Leg To", type: "text" },
    {
      name: "percentageOfVoyage",
      label: "Percentage Of Voyage",
      type: "number",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const allocation = await getCostAllocation(id, session.tenantId);
  if (!allocation) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/bunker-fuel-management/cost-allocations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cost Allocation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Cost Allocation"
          apiPath={`/api/v1/bunker-fuel-management/cost-allocations/${id}`}
          fields={COST_ALLOCATION_FIELDS}
          initialData={{
            voyageRef: allocation.voyageRef,
            vesselName: allocation.vesselName,
            vesselImo: allocation.vesselImo ?? "",
            orderId: allocation.orderId ?? "",
            fuelType: allocation.fuelType,
            quantityAllocated: allocation.quantityAllocated,
            unit: allocation.unit,
            costPerUnit: allocation.costPerUnit,
            totalCost: allocation.totalCost,
            currency: allocation.currency,
            allocationMethod: allocation.allocationMethod,
            legFrom: allocation.legFrom ?? "",
            legTo: allocation.legTo ?? "",
            percentageOfVoyage: allocation.percentageOfVoyage ?? "",
            notes: allocation.notes ?? "",
          }}
          isEdit
          returnPath={`/bunker-fuel-management/cost-allocations/${id}`}
        />
      </div>
    </div>
  );
}
