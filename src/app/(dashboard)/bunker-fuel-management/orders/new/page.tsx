import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";

export default async function NewBunkerOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/");

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "text", required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    {
      name: "supplierName",
      label: "Supplier Name",
      type: "text",
      required: true,
    },
    { name: "supplierCode", label: "Supplier Code", type: "text" },
    { name: "port", label: "Port", type: "text", required: true },
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
      type: "text",
      placeholder: "USD",
    },
    { name: "totalAmount", label: "Total Amount", type: "number" },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/bunker-fuel-management/orders"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Bunker Order
          </h1>
          <p className="text-sm text-gray-500">
            Create a new bunker fuel procurement order
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Bunker Order"
          apiPath="/api/v1/bunker-fuel-management/orders"
          fields={fields}
          returnPath="/bunker-fuel-management/orders"
        />
      </div>
    </div>
  );
}
