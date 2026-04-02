import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CfmForm, type FieldConfig } from "@/components/costing-financial-management/cfm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewContainerCostPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "costing:create"))
  )
    redirect("/costing-financial-management/container-costs");

  const currencyOpts = await getCurrencyOptions();

  const CONTAINER_COST_FIELDS: FieldConfig[] = [
    {
      name: "containerNumber",
      label: "Container Number",
      type: "text",
      required: true,
    },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    {
      name: "costCategory",
      label: "Cost Category",
      type: "select",
      required: true,
      options: [
        { value: "lease", label: "Lease" },
        { value: "handling", label: "Handling" },
        { value: "repositioning", label: "Repositioning" },
        { value: "maintenance", label: "Maintenance" },
        { value: "insurance", label: "Insurance" },
        { value: "storage", label: "Storage" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "leaseCost", label: "Lease Cost", type: "number" },
    { name: "handlingCost", label: "Handling Cost", type: "number" },
    {
      name: "repositioningCost",
      label: "Repositioning Cost",
      type: "number",
    },
    { name: "maintenanceCost", label: "Maintenance Cost", type: "number" },
    { name: "insuranceCost", label: "Insurance Cost", type: "number" },
    { name: "otherCost", label: "Other Cost", type: "number" },
    {
      name: "totalCost",
      label: "Total Cost",
      type: "number",
      required: true,
    },
    { name: "allocationMethod", label: "Allocation Method", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/costing-financial-management/container-costs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Container Cost
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Container Cost"
          apiPath="/api/v1/costing-financial-management/container-costs"
          fields={CONTAINER_COST_FIELDS}
          returnPath="/costing-financial-management/container-costs"
        />
      </div>
    </div>
  );
}
