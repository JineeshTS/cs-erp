import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDebitCreditNote } from "@/lib/freight-invoice-revenue-management/service";
import { FirmForm } from "@/components/freight-invoice-revenue-management/firm-form";
import type { FieldConfig } from "@/components/freight-invoice-revenue-management/firm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditDebitCreditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:edit")))
    redirect("/freight-invoice-revenue-management/debit-credit-notes");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
      type: "select", options: customerOpts,
      required: true,
    },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "reason", label: "Reason", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
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

  const { id } = await params;
  const note = await getDebitCreditNote(id, session.tenantId);
  if (!note) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/freight-invoice-revenue-management/debit-credit-notes/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Debit/Credit Note
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Note"
          apiPath={`/api/v1/freight-invoice-revenue-management/debit-credit-notes/${id}`}
          fields={NOTE_FIELDS}
          initialData={{
            noteType: note.noteType,
            invoiceNumber: note.invoiceNumber ?? "",
            customerName: note.customerName,
            customerCode: note.customerCode ?? "",
            reason: note.reason,
            description: note.description ?? "",
            currency: note.currency,
            amount: note.amount,
            taxAmount: note.taxAmount,
            totalAmount: note.totalAmount,
            notes: note.notes ?? "",
          }}
          isEdit
          returnPath={`/freight-invoice-revenue-management/debit-credit-notes/${id}`}
        />
      </div>
    </div>
  );
}
