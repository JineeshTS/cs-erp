import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { WneForm, type FieldConfig } from "@/components/workflow-notification-engine/wne-form";

const fields: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Enter DOA entry name",
  },
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    required: true,
    options: [
      { value: "booking", label: "Booking" },
      { value: "invoice", label: "Invoice" },
      { value: "shipment", label: "Shipment" },
      { value: "payment", label: "Payment" },
    ],
  },
  {
    name: "actionType",
    label: "Action Type",
    type: "select",
    required: true,
    options: [
      { value: "approve", label: "Approve" },
      { value: "reject", label: "Reject" },
      { value: "create", label: "Create" },
      { value: "edit", label: "Edit" },
      { value: "delete", label: "Delete" },
    ],
  },
  {
    name: "minAmount",
    label: "Min Amount",
    type: "number",
    placeholder: "0",
  },
  {
    name: "maxAmount",
    label: "Max Amount",
    type: "number",
    placeholder: "No limit",
  },
  {
    name: "currency",
    label: "Currency",
    type: "select",
    options: [
      { value: "USD", label: "USD" },
      { value: "QAR", label: "QAR" },
      { value: "AED", label: "AED" },
      { value: "SAR", label: "SAR" },
      { value: "INR", label: "INR" },
    ],
  },
  {
    name: "requiresDualApproval",
    label: "Requires Dual Approval",
    type: "checkbox",
  },
  {
    name: "isActive",
    label: "Is Active",
    type: "checkbox",
  },
];

export default async function DoaMatrixNewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "doa:create"
  );
  if (!canCreate) redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/workflow-notification-engine/doa-matrix"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
          <ShieldCheck className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New DOA Entry</h1>
          <p className="text-sm text-gray-500">
            Create a new delegation of authority entry
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="DOA Entry"
          apiPath="/api/v1/workflow-notification-engine/doa-matrix"
          fields={fields}
          initialData={{ currency: "USD", requiresDualApproval: false, isActive: true }}
          returnPath="/workflow-notification-engine/doa-matrix"
        />
      </div>
    </div>
  );
}
