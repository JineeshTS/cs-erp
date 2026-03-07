import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPurchaseRequisition } from "@/lib/procurement-supply-chain/service";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditPurchaseRequisitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:edit")))
    redirect("/procurement-supply-chain/purchase-requisitions");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "justification", label: "Justification", type: "textarea" },
    { name: "approver", label: "Approver", type: "text" },
    { name: "budgetCode", label: "Budget Code", type: "text" },
    { name: "deliveryLocation", label: "Delivery Location", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getPurchaseRequisition(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/procurement-supply-chain/purchase-requisitions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Purchase Requisition
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Purchase Requisition"
          apiPath={`/api/v1/procurement-supply-chain/purchase-requisitions/${id}`}
          fields={REQUISITION_FIELDS}
          initialData={{
            requisitionType: record.requisitionType,
            title: record.title,
            requestedBy: record.requestedBy ?? "",
            department: record.department ?? "",
            costCenter: record.costCenter ?? "",
            requestDate: record.requestDate
              ? new Date(record.requestDate).toISOString()
              : "",
            requiredDate: record.requiredDate
              ? new Date(record.requiredDate).toISOString()
              : "",
            priority: record.priority ?? "",
            totalEstimatedCost: record.totalEstimatedCost ?? "",
            currency: record.currency ?? "",
            justification: record.justification ?? "",
            approver: record.approver ?? "",
            budgetCode: record.budgetCode ?? "",
            deliveryLocation: record.deliveryLocation ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/procurement-supply-chain/purchase-requisitions/${id}`}
        />
      </div>
    </div>
  );
}
