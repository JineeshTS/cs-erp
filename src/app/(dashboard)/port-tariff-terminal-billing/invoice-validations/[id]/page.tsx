import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInvoiceValidation } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";

export default async function InvoiceValidationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const { id } = await params;
  const record = await getInvoiceValidation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ptt:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "ptt:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/port-tariff-terminal-billing/invoice-validations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.validationRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Invoice Validation Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/port-tariff-terminal-billing/invoice-validations/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/port-tariff-terminal-billing/invoice-validations/${id}`}
              method="POST"
            >
              <input type="hidden" name="_method" value="DELETE" />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Validation Ref
            </dt>
            <dd className="mt-1 text-sm">{record.validationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge variant="outline">{record.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Validation Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.validationType?.replace(/_/g, " ") ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Invoice Number
            </dt>
            <dd className="mt-1 text-sm">
              {record.invoiceNumber ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Terminal Name
            </dt>
            <dd className="mt-1 text-sm">{record.terminalName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Port Code
            </dt>
            <dd className="mt-1 text-sm">{record.portCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Invoice Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.invoiceDate
                ? new Date(record.invoiceDate).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Invoice Amount Claimed
            </dt>
            <dd className="mt-1 text-sm">
              {record.invoiceAmountClaimed ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Calculated Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.calculatedAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Variance Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.varianceAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Variance Percentage
            </dt>
            <dd className="mt-1 text-sm">
              {record.variancePercentage ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Invoice Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.invoiceCurrency ?? "\u2014"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Dispute Reason
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.disputeReason ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Resolution Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.resolutionDate
                ? new Date(record.resolutionDate).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Resolved Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.resolvedAmount ?? "\u2014"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.notes ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
