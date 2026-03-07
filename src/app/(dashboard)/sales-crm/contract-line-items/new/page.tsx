import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewContractLineItemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const LINE_ITEM_FIELDS: FieldConfig[] = [
    { name: "contractId", label: "Contract ID", type: "text", required: true, placeholder: "UUID of the contract" },
    { name: "chargeCode", label: "Charge Code", type: "text", required: true },
    { name: "chargeName", label: "Charge Name", type: "text", required: true },
    { name: "chargeType", label: "Charge Type", type: "select", required: true, options: [
      { value: "ocean_freight", label: "Ocean Freight" },
      { value: "thc", label: "THC" },
      { value: "documentation", label: "Documentation" },
      { value: "customs", label: "Customs" },
      { value: "inland", label: "Inland" },
      { value: "surcharge", label: "Surcharge" },
      { value: "other", label: "Other" },
    ]},
    { name: "basis", label: "Basis", type: "select", required: true, options: [
      { value: "per_container", label: "Per Container" },
      { value: "per_teu", label: "Per TEU" },
      { value: "per_bl", label: "Per BL" },
      { value: "per_shipment", label: "Per Shipment" },
      { value: "lumpsum", label: "Lumpsum" },
    ]},
    { name: "unitPrice", label: "Unit Price", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "validFrom", label: "Valid From", type: "datetime-local" },
    { name: "validTo", label: "Valid To", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/contract-line-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Contract Line Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Contract Line Item"
          apiPath="/api/v1/sales-crm/contract-line-items"
          fields={LINE_ITEM_FIELDS}
          returnPath="/sales-crm/contract-line-items"
        />
      </div>
    </div>
  );
}
