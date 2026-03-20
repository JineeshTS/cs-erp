import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmRateQuotations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function RateQuotationDetailPage({
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
    .from(scmRateQuotations)
    .where(
      and(
        eq(scmRateQuotations.id, id),
        eq(scmRateQuotations.tenantId, session.tenantId),
        isNull(scmRateQuotations.deletedAt)
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
          href="/sales-crm/rate-quotations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.quotationNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Rate Quotation &mdash;{" "}
            <Badge
              variant={
                record.status === "approved" || record.status === "accepted"
                  ? "default"
                  : record.status === "rejected" || record.status === "expired"
                    ? "destructive"
                    : record.status === "submitted"
                      ? "secondary"
                      : "outline"
              }
            >
              {record.status.replace(/_/g, " ")}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/sales-crm/rate-quotations/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/sales-crm/rate-quotations/${id}`} />
          )}
        </div>
      </div>

      {/* Detail Fields */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Quotation Number", value: record.quotationNumber },
            { label: "Customer ID", value: record.customerId },
            { label: "Contact ID", value: record.contactId ?? "-" },
            { label: "Opportunity ID", value: record.opportunityId ?? "-" },
            { label: "Sales Rep ID", value: record.salesRepId },
            { label: "Origin Port", value: record.originPort },
            { label: "Destination Port", value: record.destinationPort },
            { label: "Trade Lane", value: record.tradeLane ?? "-" },
            { label: "Service Type", value: record.serviceType ?? "-" },
            { label: "Container Type", value: record.containerType ?? "-" },
            { label: "Container Size", value: record.containerSize ?? "-" },
            { label: "Estimated TEU", value: record.estimatedTeu?.toString() ?? "-" },
            { label: "Estimated Volume", value: record.estimatedVolume?.toString() ?? "-" },
            { label: "Total Amount", value: record.totalAmount?.toLocaleString() ?? "-" },
            { label: "Currency", value: record.currency ?? "USD" },
            { label: "Valid From", value: new Date(record.validFrom).toLocaleDateString() },
            { label: "Valid To", value: new Date(record.validTo).toLocaleDateString() },
            { label: "Transit Time (Days)", value: record.transitTimeDays?.toString() ?? "-" },
            { label: "Free Time (Days)", value: record.freeTimeDays?.toString() ?? "-" },
            { label: "Incoterm", value: record.incoterm ?? "-" },
            { label: "Status", value: record.status.replace(/_/g, " ") },
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
