import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDebitCreditNote } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

export default async function DebitCreditNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;
  const note = await getDebitCreditNote(id, session.tenantId);
  if (!note) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  function statusVariant(s: string) {
    switch (s) {
      case "approved":
        return "success" as const;
      case "cancelled":
        return "destructive" as const;
      case "issued":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/debit-credit-notes"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {note.noteNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {note.noteType === "credit" ? "Credit" : "Debit"} Note &middot;{" "}
            {note.customerName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/freight-invoice-revenue-management/debit-credit-notes/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Note Number</dt>
            <dd className="mt-1 text-gray-900">{note.noteNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Note Type</dt>
            <dd className="mt-1">
              <Badge
                variant={note.noteType === "credit" ? "success" : "default"}
              >
                {note.noteType}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Invoice Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {note.invoiceNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Name
            </dt>
            <dd className="mt-1 text-gray-900">{note.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {note.customerCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-gray-900">{note.reason}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {note.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{note.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-gray-900">
              {note.amount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">
              {note.taxAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">
              {note.totalAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(note.status)}>
                {note.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issued At</dt>
            <dd className="mt-1 text-gray-900">
              {note.issuedAt
                ? new Date(note.issuedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {note.approvedAt
                ? new Date(note.approvedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{note.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
