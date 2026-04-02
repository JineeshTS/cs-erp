import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";
import { getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewTechnicalProcurementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:create")))
    redirect("/vessel-technical-management/technical-procurements");

  const [vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const PROCUREMENT_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    {
      name: "requestType",
      label: "Request Type",
      type: "select",
      required: true,
      options: [
        { value: "spare_parts", label: "Spare Parts" },
        { value: "services", label: "Services" },
        { value: "equipment", label: "Equipment" },
        { value: "consumables", label: "Consumables" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "requestedByName", label: "Requested By", type: "text" },
    { name: "department", label: "Department", type: "text" },
    {
      name: "urgency",
      label: "Urgency",
      type: "select",
      options: [
        { value: "emergency", label: "Emergency" },
        { value: "urgent", label: "Urgent" },
        { value: "routine", label: "Routine" },
        { value: "planned", label: "Planned" },
      ],
    },
    { name: "estimatedBudget", label: "Estimated Budget", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "supplierName", label: "Supplier Name", type: "select", options: customerOpts },
    { name: "purchaseOrderRef", label: "Purchase Order Ref", type: "text" },
    { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-technical-management/technical-procurements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New Technical Procurement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6 dark:bg-gray-900 dark:border-gray-700">
        <VtmForm
          entityType="Technical Procurement"
          apiPath="/api/v1/vessel-technical-management/technical-procurements"
          fields={PROCUREMENT_FIELDS}
          returnPath="/vessel-technical-management/technical-procurements"
        />
      </div>
    </div>
  );
}
