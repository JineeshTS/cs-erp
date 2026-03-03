import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const REQUISITION_FIELDS: FieldConfig[] = [
  {
    name: "requisitionType",
    label: "Requisition Type",
    type: "select",
    required: true,
    options: [
      { value: "standard", label: "Standard" },
      { value: "urgent", label: "Urgent" },
      { value: "blanket", label: "Blanket" },
      { value: "planned", label: "Planned" },
      { value: "emergency", label: "Emergency" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "requestedBy", label: "Requested By", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "costCenter", label: "Cost Center", type: "text" },
  { name: "requestDate", label: "Request Date", type: "datetime-local" },
  { name: "requiredDate", label: "Required Date", type: "datetime-local" },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "totalEstimatedCost", label: "Total Estimated Cost", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "justification", label: "Justification", type: "textarea" },
  { name: "approver", label: "Approver", type: "text" },
  { name: "budgetCode", label: "Budget Code", type: "text" },
  { name: "deliveryLocation", label: "Delivery Location", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPurchaseRequisitionPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "procurement:create"))
  )
    redirect("/procurement-supply-chain/purchase-requisitions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/purchase-requisitions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Purchase Requisition
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Purchase Requisition"
          apiPath="/api/v1/procurement-supply-chain/purchase-requisitions"
          fields={REQUISITION_FIELDS}
          returnPath="/procurement-supply-chain/purchase-requisitions"
        />
      </div>
    </div>
  );
}
