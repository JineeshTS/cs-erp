import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";
import { getPortOptions, getVesselOptions, getCustomerOptions } from "@/lib/lookups";

export default async function NewBunkerStemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/");


  const [portOpts, vesselOpts, customerOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
  ]);
  const fields: FieldConfig[] = [
    {
      name: "orderId",
      label: "Order ID",
      type: "text",
      placeholder: "Order UUID",
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "port", label: "Port", type: "select", options: portOpts, required: true },
    { name: "berth", label: "Berth", type: "text" },
    { name: "supplierName", label: "Supplier Name", type: "select", options: customerOpts },
    { name: "bargeName", label: "Barge Name", type: "text" },
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
    { name: "fuelGrade", label: "Fuel Grade", type: "text" },
    {
      name: "quantityNominated",
      label: "Quantity Nominated",
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
      name: "deliveryWindowStart",
      label: "Delivery Window Start",
      type: "datetime-local",
    },
    {
      name: "deliveryWindowEnd",
      label: "Delivery Window End",
      type: "datetime-local",
    },
    { name: "pumpingRate", label: "Pumping Rate", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/bunker-fuel-management/stems"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Bunker Stem</h1>
          <p className="text-sm text-gray-500">
            Create a new bunker stem for supply planning
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Bunker Stem"
          apiPath="/api/v1/bunker-fuel-management/stems"
          fields={fields}
          returnPath="/bunker-fuel-management/stems"
        />
      </div>
    </div>
  );
}
