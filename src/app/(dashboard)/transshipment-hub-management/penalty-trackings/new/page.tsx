import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewPenaltyTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "thm:create"))
  )
    redirect("/transshipment-hub-management/penalty-trackings");

  const currencyOpts = await getCurrencyOptions();

  const PENALTY_TRACKING_FIELDS: FieldConfig[] = [
    {
      name: "penaltyType",
      label: "Penalty Type",
      type: "select",
      required: true,
      options: [
        { value: "dwell_penalty", label: "Dwell Penalty" },
        { value: "late_delivery", label: "Late Delivery" },
        { value: "missed_cutoff", label: "Missed Cutoff" },
        { value: "storage_charge", label: "Storage Charge" },
        { value: "demurrage_charge", label: "Demurrage Charge" },
      ],
    },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "hubPort", label: "Hub Port", type: "text" },
    { name: "dwellDays", label: "Dwell Days", type: "text" },
    { name: "thresholdDays", label: "Threshold Days", type: "text" },
    { name: "penaltyAmount", label: "Penalty Amount", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "chargedTo", label: "Charged To", type: "text" },
    { name: "waived", label: "Waived", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/penalty-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Penalty Tracking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Penalty Tracking"
          apiPath="/api/v1/transshipment-hub-management/penalty-trackings"
          fields={PENALTY_TRACKING_FIELDS}
          returnPath="/transshipment-hub-management/penalty-trackings"
        />
      </div>
    </div>
  );
}
