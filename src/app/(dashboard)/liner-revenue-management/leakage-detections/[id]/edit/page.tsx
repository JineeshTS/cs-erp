import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLeakageDetection } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditLeakageDetectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/leakage-detections");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const LEAKAGE_DETECTION_FIELDS: FieldConfig[] = [
    {
      name: "leakageType",
      label: "Leakage Type",
      type: "select",
      required: true,
      options: [
        { value: "unbilled_charge", label: "Unbilled Charge" },
        { value: "rate_deviation", label: "Rate Deviation" },
        { value: "weight_discrepancy", label: "Weight Discrepancy" },
        { value: "surcharge_miss", label: "Surcharge Miss" },
        { value: "free_time_abuse", label: "Free Time Abuse" },
      ],
    },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts },
    { name: "expectedAmount", label: "Expected Amount", type: "text" },
    { name: "actualAmount", label: "Actual Amount", type: "text" },
    { name: "leakageAmount", label: "Leakage Amount", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "detectedAt", label: "Detected At", type: "datetime-local" },
    { name: "resolvedAt", label: "Resolved At", type: "datetime-local" },
    { name: "rootCause", label: "Root Cause", type: "textarea" },
    { name: "recoveryAction", label: "Recovery Action", type: "text" },
    { name: "recovered", label: "Recovered", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getLeakageDetection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/leakage-detections/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Leakage Detection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Leakage Detection"
          apiPath={`/api/v1/liner-revenue-management/leakage-detections/${id}`}
          fields={LEAKAGE_DETECTION_FIELDS}
          initialData={{
            leakageType: record.leakageType,
            bookingRef: record.bookingRef ?? "",
            customerName: record.customerName ?? "",
            expectedAmount: record.expectedAmount ?? "",
            actualAmount: record.actualAmount ?? "",
            leakageAmount: record.leakageAmount ?? "",
            currency: record.currency ?? "",
            detectedAt: record.detectedAt ? record.detectedAt.toISOString().slice(0, 16) : "",
            resolvedAt: record.resolvedAt ? record.resolvedAt.toISOString().slice(0, 16) : "",
            rootCause: record.rootCause ?? "",
            recoveryAction: record.recoveryAction ?? "",
            recovered: record.recovered ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/leakage-detections/${id}`}
        />
      </div>
    </div>
  );
}
