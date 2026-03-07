import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBunkerStem } from "@/lib/bunker-fuel-management/service";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";
import { getPortOptions, getVesselOptions, getCustomerOptions } from "@/lib/lookups";

export default async function EditBunkerStemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:edit")))
    redirect("/");


  const [portOpts, vesselOpts, customerOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
  ]);
  const { id } = await params;
  const stem = await getBunkerStem(id, session.tenantId);
  if (!stem) notFound();

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

  const initialData: Record<string, unknown> = {
    orderId: stem.orderId,
    vesselName: stem.vesselName,
    vesselImo: stem.vesselImo,
    port: stem.port,
    berth: stem.berth,
    supplierName: stem.supplierName,
    bargeName: stem.bargeName,
    fuelType: stem.fuelType,
    fuelGrade: stem.fuelGrade,
    quantityNominated: stem.quantityNominated,
    unit: stem.unit,
    deliveryWindowStart: stem.deliveryWindowStart
      ? new Date(stem.deliveryWindowStart).toISOString()
      : "",
    deliveryWindowEnd: stem.deliveryWindowEnd
      ? new Date(stem.deliveryWindowEnd).toISOString()
      : "",
    pumpingRate: stem.pumpingRate,
    notes: stem.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/bunker-fuel-management/stems/${stem.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {stem.stemRef}
          </h1>
          <p className="text-sm text-gray-500">Update bunker stem details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Bunker Stem"
          apiPath={`/api/v1/bunker-fuel-management/stems/${stem.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/bunker-fuel-management/stems"
        />
      </div>
    </div>
  );
}
