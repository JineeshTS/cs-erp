import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewTimeBarTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const TIME_BAR_TRACKING_FIELDS: FieldConfig[] = [
    {
      name: "trackingType",
      label: "Tracking Type",
      type: "select",
      required: true,
      options: [
        { value: "suit_time_bar", label: "Suit Time Bar" },
        { value: "arbitration_deadline", label: "Arbitration Deadline" },
        { value: "notice_period", label: "Notice Period" },
        { value: "extension", label: "Extension" },
        { value: "tolling_agreement", label: "Tolling Agreement" },
      ],
    },
    { name: "claimId", label: "Claim ID", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "applicableLaw", label: "Applicable Law", type: "text" },
    { name: "timeBarPeriodMonths", label: "Time Bar Period (Months)", type: "number" },
    { name: "dateOfDelivery", label: "Date of Delivery", type: "datetime-local" },
    { name: "timeBarDeadline", label: "Time Bar Deadline", type: "datetime-local" },
    { name: "daysRemaining", label: "Days Remaining", type: "number" },
    { name: "extensionGranted", label: "Extension Granted", type: "checkbox" },
    { name: "extensionDate", label: "Extension Date", type: "datetime-local" },
    { name: "alertSent30Days", label: "Alert Sent (30 Days)", type: "checkbox" },
    { name: "alertSent60Days", label: "Alert Sent (60 Days)", type: "checkbox" },
    { name: "alertSent90Days", label: "Alert Sent (90 Days)", type: "checkbox" },
    { name: "protectiveAction", label: "Protective Action", type: "text" },
    { name: "protectiveActionDate", label: "Protective Action Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/time-bar-trackings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Time Bar Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new time bar tracking record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Time Bar Tracking"
          apiPath="/api/v1/cargo-claims-management/time-bar-trackings"
          returnPath="/cargo-claims-management/time-bar-trackings"
          fields={TIME_BAR_TRACKING_FIELDS}
        />
      </div>
    </div>
  );
}
