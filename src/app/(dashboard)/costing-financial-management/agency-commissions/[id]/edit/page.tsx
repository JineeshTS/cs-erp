import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgencyCommission } from "@/lib/costing-financial-management/service";
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

export default async function EditAgencyCommissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

  const { id } = await params;
  const record = await getAgencyCommission(id, session.tenantId);
  if (!record) notFound();

  const basePath = "/costing-financial-management/agency-commissions";

  const initialData: Record<string, unknown> = {
    agentName: record.agentName,
    agentCode: record.agentCode,
    voyageRef: record.voyageRef,
    port: record.port,
    commissionType: record.commissionType,
    currency: record.currency,
    baseAmount: record.baseAmount,
    commissionRate: record.commissionRate,
    commissionAmount: record.commissionAmount,
    taxAmount: record.taxAmount,
    netPayable: record.netPayable,
    invoiceRef: record.invoiceRef,
    notes: record.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`${basePath}/${id}`}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {record.commissionRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update agency commission details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Agency Commission"
          apiPath={`/api/v1/costing-financial-management/agency-commissions/${id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath={`${basePath}/${id}`}
        />
      </div>
    </div>
  );
}
