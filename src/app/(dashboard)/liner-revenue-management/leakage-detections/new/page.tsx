import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";

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
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "expectedAmount", label: "Expected Amount", type: "text" },
  { name: "actualAmount", label: "Actual Amount", type: "text" },
  { name: "leakageAmount", label: "Leakage Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "detectedAt", label: "Detected At", type: "datetime-local" },
  { name: "resolvedAt", label: "Resolved At", type: "datetime-local" },
  { name: "rootCause", label: "Root Cause", type: "textarea" },
  { name: "recoveryAction", label: "Recovery Action", type: "text" },
  { name: "recovered", label: "Recovered", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewLeakageDetectionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lrm:create"))
  )
    redirect("/liner-revenue-management/leakage-detections");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-revenue-management/leakage-detections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Leakage Detection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Leakage Detection"
          apiPath="/api/v1/liner-revenue-management/leakage-detections"
          fields={LEAKAGE_DETECTION_FIELDS}
          returnPath="/liner-revenue-management/leakage-detections"
        />
      </div>
    </div>
  );
}
