import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getProformaInvoice } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary" as const;
    case "issued":
      return "default" as const;
    case "converted":
      return "success" as const;
    case "expired":
      return "warning" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default async function ProformaInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/");

  const { id } = await params;
  const record = await getProformaInvoice(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Proforma Number", value: record.proformaNumber },
    { label: "Voyage Ref", value: record.voyageRef },
    { label: "Booking Ref", value: record.bookingRef },
    { label: "Customer Name", value: record.customerName },
    { label: "Customer Code", value: record.customerCode },
    { label: "Currency", value: record.currency },
    { label: "Subtotal", value: record.subtotal },
    { label: "Tax Amount", value: record.taxAmount },
    { label: "Total Amount", value: record.totalAmount },
    {
      label: "Valid Until",
      value: record.validUntil
        ? new Date(record.validUntil).toLocaleString()
        : null,
    },
    {
      label: "Converted At",
      value: record.convertedAt
        ? new Date(record.convertedAt).toLocaleString()
        : null,
    },
    {
      label: "Status",
      value: (
        <Badge variant={statusVariant(record.status)}>
          {record.status}
        </Badge>
      ),
    },
    {
      label: "Issued At",
      value: record.issuedAt
        ? new Date(record.issuedAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: record.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/freight-invoice-revenue-management/proforma-invoices"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.proformaNumber}
            </h1>
            <p className="text-sm text-gray-500">Proforma Invoice Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/freight-invoice-revenue-management/proforma-invoices/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
