import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";

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
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "invoiceDate", label: "Invoice Date", type: "datetime-local" },
  { name: "invoiceAmountClaimed", label: "Invoice Amount Claimed", type: "number" },
  { name: "calculatedAmount", label: "Calculated Amount", type: "number" },
  { name: "varianceAmount", label: "Variance Amount", type: "number" },
  { name: "variancePercentage", label: "Variance Percentage", type: "number" },
  { name: "invoiceCurrency", label: "Invoice Currency", type: "text" },
  { name: "disputeReason", label: "Dispute Reason", type: "textarea" },
  { name: "resolutionDate", label: "Resolution Date", type: "datetime-local" },
  { name: "resolvedAmount", label: "Resolved Amount", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewInvoiceValidationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:create")))
    redirect("/");

  return (
    <div className="space-y-6">
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
            New Invoice Validation
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new terminal invoice validation
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Invoice Validation"
          apiPath="/api/v1/port-tariff-terminal-billing/invoice-validations"
          returnPath="/port-tariff-terminal-billing/invoice-validations"
          fields={VALIDATION_FIELDS}
        />
      </div>
    </div>
  );
}
