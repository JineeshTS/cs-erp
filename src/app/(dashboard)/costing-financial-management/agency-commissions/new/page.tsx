import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CfmForm, type FieldConfig } from "@/components/costing-financial-management/cfm-form";

const fields: FieldConfig[] = [
  {
    name: "agentName",
    label: "Agent Name",
    type: "text",
    required: true,
  },
  { name: "agentCode", label: "Agent Code", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "port", label: "Port", type: "text" },
  {
    name: "commissionType",
    label: "Commission Type",
    type: "select",
    required: true,
    options: [
      { value: "booking", label: "Booking" },
      { value: "freight", label: "Freight" },
      { value: "port", label: "Port" },
      { value: "documentation", label: "Documentation" },
      { value: "handling", label: "Handling" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  {
    name: "baseAmount",
    label: "Base Amount",
    type: "number",
    required: true,
  },
  {
    name: "commissionRate",
    label: "Commission Rate",
    type: "number",
    required: true,
  },
  {
    name: "commissionAmount",
    label: "Commission Amount",
    type: "number",
    required: true,
  },
  { name: "taxAmount", label: "Tax Amount", type: "number" },
  {
    name: "netPayable",
    label: "Net Payable",
    type: "number",
    required: true,
  },
  { name: "invoiceRef", label: "Invoice Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewAgencyCommissionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

  const basePath = "/costing-financial-management/agency-commissions";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={basePath}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Agency Commission
          </h1>
          <p className="text-sm text-gray-500">
            Create a new agency commission record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Agency Commission"
          apiPath="/api/v1/costing-financial-management/agency-commissions"
          fields={fields}
          returnPath={basePath}
        />
      </div>
    </div>
  );
}
