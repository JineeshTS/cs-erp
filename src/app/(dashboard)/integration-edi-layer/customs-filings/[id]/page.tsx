import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ielCustomsFilings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function CustomsFilingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/");

  const { id } = await params;

  const record = await db
    .select()
    .from(ielCustomsFilings)
    .where(
      and(
        eq(ielCustomsFilings.id, id),
        eq(ielCustomsFilings.tenantId, session.tenantId),
        isNull(ielCustomsFilings.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit =
    record.status === "draft" &&
    (await hasPermission(session.id, session.tenantId, "integration:edit"));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/customs-filings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.filingRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.filingType.replace(/_/g, " ")} &middot;{" "}
            {record.customsAuthority.replace(/_/g, " ")}
          </p>
        </div>
        <Badge
          variant={
            record.status === "approved" || record.status === "cleared"
              ? "success"
              : record.status === "rejected"
                ? "destructive"
                : record.status === "submitted"
                  ? "default"
                  : "secondary"
          }
        >
          {record.status}
        </Badge>
        {canEdit && (
          <Link
            href={`/integration-edi-layer/customs-filings/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Filing Ref", value: record.filingRef },
            {
              label: "Filing Type",
              value: record.filingType.replace(/_/g, " "),
            },
            {
              label: "Customs Authority",
              value: record.customsAuthority.replace(/_/g, " "),
            },
            { label: "Country Code", value: record.countryCode },
            { label: "Port Code", value: record.portCode ?? "-" },
            {
              label: "Declaration Type",
              value: record.declarationType.replace(/_/g, " "),
            },
            { label: "Status", value: record.status },
            { label: "HS Code", value: record.hsCode ?? "-" },
            {
              label: "Total Value",
              value:
                record.totalValue != null
                  ? `${record.totalValue} ${record.currency ?? "USD"}`
                  : "-",
            },
            { label: "Currency", value: record.currency ?? "USD" },
            {
              label: "Duty Amount",
              value:
                record.dutyAmount != null ? String(record.dutyAmount) : "-",
            },
            {
              label: "Tax Amount",
              value: record.taxAmount != null ? String(record.taxAmount) : "-",
            },
            { label: "Submitted At", value: fmtDate(record.submittedAt) },
            { label: "Approved At", value: fmtDate(record.approvedAt) },
            { label: "Rejected At", value: fmtDate(record.rejectedAt) },
            { label: "Created At", value: fmtDate(record.createdAt) },
            { label: "Updated At", value: fmtDate(record.updatedAt) },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>

        {record.rejectionReason && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">
              Rejection Reason
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">
              {record.rejectionReason}
            </p>
          </div>
        )}

        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}

        {record.declarationData != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">
              Declaration Data
            </p>
            <pre className="mt-1 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(record.declarationData, null, 2)}
            </pre>
          </div>
        )}

        {record.lineItems != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Line Items</p>
            <pre className="mt-1 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(record.lineItems, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
