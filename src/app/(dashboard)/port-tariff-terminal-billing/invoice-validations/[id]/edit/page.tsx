import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInvoiceValidation } from "@/lib/port-tariff-terminal-billing/service";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditInvoiceValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:edit")))
    redirect("/");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const VALIDATION_FIELDS: FieldConfig[] = [
    {
      name: "validationType",
      label: "Validation Type",
      type: "select",
      required: true,
      options: [
        { value: "auto_validation", label: "Auto Validation" },
        { value: "manual_review", label: "Manual Review" },
        { value: "dispute_raised", label: "Dispute Raised" },
        { value: "dispute_resolved", label: "Dispute Resolved" },
        { value: "credit_note", label: "Credit Note" },
      ],
    },
    { name: "invoiceNumber", label: "Invoice Number", type: "text" },
    { name: "terminalName", label: "Terminal Name", type: "text" },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "invoiceDate", label: "Invoice Date", type: "datetime-local" },
    { name: "invoiceAmountClaimed", label: "Invoice Amount Claimed", type: "number" },
    { name: "calculatedAmount", label: "Calculated Amount", type: "number" },
    { name: "varianceAmount", label: "Variance Amount", type: "number" },
    { name: "variancePercentage", label: "Variance Percentage", type: "number" },
    { name: "invoiceCurrency", label: "Invoice Currency", type: "select", options: currencyOpts },
    { name: "disputeReason", label: "Dispute Reason", type: "textarea" },
    { name: "resolutionDate", label: "Resolution Date", type: "datetime-local" },
    { name: "resolvedAmount", label: "Resolved Amount", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getInvoiceValidation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/port-tariff-terminal-billing/invoice-validations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Invoice Validation
          </h1>
          <p className="text-sm text-muted-foreground">
            Update invoice validation details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Invoice Validation"
          apiPath={`/api/v1/port-tariff-terminal-billing/invoice-validations/${id}`}
          returnPath={`/port-tariff-terminal-billing/invoice-validations/${id}`}
          fields={VALIDATION_FIELDS}
          initialData={{
            validationType: record.validationType ?? "",
            invoiceNumber: record.invoiceNumber ?? "",
            terminalName: record.terminalName ?? "",
            portCode: record.portCode ?? "",
            invoiceDate: record.invoiceDate
              ? new Date(record.invoiceDate).toISOString()
              : "",
            invoiceAmountClaimed: record.invoiceAmountClaimed ?? "",
            calculatedAmount: record.calculatedAmount ?? "",
            varianceAmount: record.varianceAmount ?? "",
            variancePercentage: record.variancePercentage ?? "",
            invoiceCurrency: record.invoiceCurrency ?? "",
            disputeReason: record.disputeReason ?? "",
            resolutionDate: record.resolutionDate
              ? new Date(record.resolutionDate).toISOString()
              : "",
            resolvedAmount: record.resolvedAmount ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
