import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRevenueIntegrityAudit } from "@/lib/liner-operations-control/service";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditRevenueIntegrityAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const AUDIT_FIELDS: FieldConfig[] = [
    {
      name: "auditType",
      label: "Audit Type",
      type: "select",
      required: true,
      options: [
        { value: "rate_compliance", label: "Rate Compliance" },
        { value: "tariff_verification", label: "Tariff Verification" },
        { value: "surcharge_audit", label: "Surcharge Audit" },
        { value: "discount_review", label: "Discount Review" },
        { value: "leakage_detection", label: "Leakage Detection" },
      ],
    },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts },
    { name: "contractedRate", label: "Contracted Rate", type: "number" },
    { name: "appliedRate", label: "Applied Rate", type: "number" },
    { name: "varianceAmount", label: "Variance Amount", type: "number" },
    { name: "rateCurrency", label: "Rate Currency", type: "text" },
    { name: "tradeRoute", label: "Trade Route", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "leakageAmount", label: "Leakage Amount", type: "number" },
    {
      name: "correctionApplied",
      label: "Correction Applied",
      type: "checkbox",
    },
    { name: "correctionDate", label: "Correction Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getRevenueIntegrityAudit(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    auditType: record.auditType ?? "",
    bookingRef: record.bookingRef ?? "",
    customerName: record.customerName ?? "",
    contractedRate: record.contractedRate ?? "",
    appliedRate: record.appliedRate ?? "",
    varianceAmount: record.varianceAmount ?? "",
    rateCurrency: record.rateCurrency ?? "",
    tradeRoute: record.tradeRoute ?? "",
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    leakageAmount: record.leakageAmount ?? "",
    correctionApplied: record.correctionApplied ? "true" : "",
    correctionDate: record.correctionDate
      ? new Date(record.correctionDate).toISOString().slice(0, 16)
      : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/revenue-integrity-audits/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.auditRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update revenue integrity audit details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Revenue Integrity Audit"
          apiPath={`/api/v1/liner-operations-control/revenue-integrity-audits/${id}`}
          returnPath="/liner-operations-control/revenue-integrity-audits"
          fields={AUDIT_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
