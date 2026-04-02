import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmContractLineItems } from "@/db/schema";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function ContractLineItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:read")))
    redirect("/sales-crm");

  const { id } = await params;

  const record = await db
    .select()
    .from(scmContractLineItems)
    .where(
      and(
        eq(scmContractLineItems.id, id),
        eq(scmContractLineItems.tenantId, session.tenantId),
        isNull(scmContractLineItems.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "sales:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "sales:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/contract-line-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.chargeCode}
          </h1>
          <p className="text-sm text-gray-500">
            {record.chargeName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/sales-crm/contract-line-items/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/sales-crm/contract-line-items/${id}`} />
          )}
        </div>
      </div>

      {/* Detail Fields */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Contract ID", value: record.contractId },
            { label: "Charge Code", value: record.chargeCode },
            { label: "Charge Name", value: record.chargeName },
            { label: "Charge Type", value: record.chargeType.replace(/_/g, " ") },
            { label: "Basis", value: record.basis.replace(/_/g, " ") },
            { label: "Unit Price", value: record.unitPrice.toLocaleString() },
            { label: "Currency", value: record.currency ?? "USD" },
            { label: "Container Type", value: record.containerType ?? "-" },
            { label: "Container Size", value: record.containerSize ?? "-" },
            { label: "Origin Port", value: record.originPort ?? "-" },
            { label: "Destination Port", value: record.destinationPort ?? "-" },
            { label: "Valid From", value: record.validFrom ? new Date(record.validFrom).toLocaleString() : "-" },
            { label: "Valid To", value: record.validTo ? new Date(record.validTo).toLocaleString() : "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">
                {field.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
