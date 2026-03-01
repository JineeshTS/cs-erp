import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FirmForm } from "@/components/freight-invoice-revenue-management/firm-form";
import type { FieldConfig } from "@/components/freight-invoice-revenue-management/firm-form";

const NOTE_FIELDS: FieldConfig[] = [
  {
    name: "noteType",
    label: "Note Type",
    type: "select",
    required: true,
    options: [
      { value: "debit", label: "Debit" },
      { value: "credit", label: "Credit" },
    ],
  },
  { name: "invoiceNumber", label: "Invoice Number", type: "text" },
  {
    name: "customerName",
    label: "Customer Name",
    type: "text",
    required: true,
  },
  { name: "customerCode", label: "Customer Code", type: "text" },
  { name: "reason", label: "Reason", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "taxAmount", label: "Tax Amount", type: "number" },
  {
    name: "totalAmount",
    label: "Total Amount",
    type: "number",
    required: true,
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDebitCreditNotePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "invoice:create"))
  )
    redirect("/freight-invoice-revenue-management/debit-credit-notes");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/debit-credit-notes"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Debit/Credit Note
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Note"
          apiPath="/api/v1/freight-invoice-revenue-management/debit-credit-notes"
          fields={NOTE_FIELDS}
          returnPath="/freight-invoice-revenue-management/debit-credit-notes"
        />
      </div>
    </div>
  );
}
