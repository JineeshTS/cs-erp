import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmRevenueLeakages } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "leakageReference", label: "Leakage Reference", type: "text", required: true },
  {
    name: "leakageType",
    label: "Leakage Type",
    type: "select",
    options: [
      { label: "Rate Deviation", value: "rate_deviation" },
      { label: "Missing Surcharge", value: "missing_surcharge" },
      { label: "Incorrect Billing", value: "incorrect_billing" },
      { label: "Unapplied Charge", value: "unapplied_charge" },
      { label: "Weight Discrepancy", value: "weight_discrepancy" },
      { label: "Other", value: "other" },
    ],
  },
  { name: "detectedDate", label: "Detected Date", type: "date", required: true },
  { name: "bookingReference", label: "Booking Reference", type: "text" },
  { name: "invoiceReference", label: "Invoice Reference", type: "text" },
  { name: "customerId", label: "Customer ID", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "expectedAmount", label: "Expected Amount", type: "number", required: true },
  { name: "actualAmount", label: "Actual Amount", type: "number", required: true },
  { name: "leakageAmount", label: "Leakage Amount", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text" },
  { name: "rootCause", label: "Root Cause", type: "text" },
  { name: "correctionAction", label: "Correction Action", type: "textarea" },
  { name: "recoveredAmount", label: "Recovered Amount", type: "number" },
  { name: "assignedTo", label: "Assigned To", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Detected", value: "detected" },
      { label: "Investigating", value: "investigating" },
      { label: "Confirmed", value: "confirmed" },
      { label: "Recovered", value: "recovered" },
      { label: "Written Off", value: "written_off" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRevenueLeakagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(cpmRevenueLeakages)
    .where(
      and(
        eq(cpmRevenueLeakages.id, id),
        eq(cpmRevenueLeakages.tenantId, session.tenantId),
        isNull(cpmRevenueLeakages.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/revenue-leakages/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Revenue Leakage</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Revenue Leakage"
          fields={fields}
          apiPath={`/api/v1/commercial-pricing-management/revenue-leakages/${id}`}
          returnPath="/commercial-pricing-management/revenue-leakages"
          initialData={{
            leakageReference: record.leakageReference ?? "",
            leakageType: record.leakageType ?? "",
            detectedDate: record.detectedDate
              ? new Date(record.detectedDate).toISOString().split("T")[0]
              : "",
            bookingReference: record.bookingReference ?? "",
            invoiceReference: record.invoiceReference ?? "",
            customerId: record.customerId ?? "",
            tradeLane: record.tradeLane ?? "",
            expectedAmount: record.expectedAmount ?? "",
            actualAmount: record.actualAmount ?? "",
            leakageAmount: record.leakageAmount ?? "",
            currency: record.currency ?? "",
            rootCause: record.rootCause ?? "",
            correctionAction: record.correctionAction ?? "",
            recoveredAmount: record.recoveredAmount ?? "",
            assignedTo: record.assignedTo ?? "",
            status: record.status ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
