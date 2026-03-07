import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBunkerOrder } from "@/lib/bunker-fuel-management/service";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";
import { getPortOptions, getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditBunkerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:edit")))
    redirect("/");


  const [portOpts, vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const { id } = await params;
  const order = await getBunkerOrder(id, session.tenantId);
  if (!order) notFound();

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    {
      name: "supplierName",
      label: "Supplier Name",
      type: "select", options: customerOpts,
      required: true,
    },
    { name: "supplierCode", label: "Supplier Code", type: "text" },
    { name: "port", label: "Port", type: "select", options: portOpts, required: true },
    { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
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
      name: "quantityOrdered",
      label: "Quantity Ordered",
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
    { name: "pricePerUnit", label: "Price Per Unit", type: "number" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    { name: "totalAmount", label: "Total Amount", type: "number" },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    vesselName: order.vesselName,
    vesselImo: order.vesselImo,
    voyageRef: order.voyageRef,
    supplierName: order.supplierName,
    supplierCode: order.supplierCode,
    port: order.port,
    deliveryDate: order.deliveryDate
      ? new Date(order.deliveryDate).toISOString()
      : "",
    fuelType: order.fuelType,
    fuelGrade: order.fuelGrade,
    quantityOrdered: order.quantityOrdered,
    unit: order.unit,
    pricePerUnit: order.pricePerUnit,
    currency: order.currency,
    totalAmount: order.totalAmount,
    paymentTerms: order.paymentTerms,
    notes: order.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/bunker-fuel-management/orders/${order.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {order.orderRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update bunker order details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Bunker Order"
          apiPath={`/api/v1/bunker-fuel-management/orders/${order.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/bunker-fuel-management/orders"
        />
      </div>
    </div>
  );
}
