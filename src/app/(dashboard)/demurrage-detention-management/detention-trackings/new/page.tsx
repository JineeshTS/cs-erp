import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewDetentionTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "demurrage:create"))
  )
    redirect("/demurrage-detention-management/detention-trackings");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const DETENTION_TRACKING_FIELDS: FieldConfig[] = [
    { name: "containerNumber", label: "Container Number", type: "text", required: true },
    {
      name: "containerSize",
      label: "Container Size",
      type: "select",
      required: true,
      options: [
        { value: "20", label: "20" },
        { value: "40", label: "40" },
        { value: "40HC", label: "40HC" },
        { value: "45", label: "45" },
      ],
    },
    {
      name: "containerType",
      label: "Container Type",
      type: "select",
      required: true,
      options: [
        { value: "dry", label: "Dry" },
        { value: "reefer", label: "Reefer" },
        { value: "open_top", label: "Open Top" },
        { value: "flat_rack", label: "Flat Rack" },
        { value: "tank", label: "Tank" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "blNumber", label: "BL Number", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "gateOutDate", label: "Gate Out Date", type: "datetime-local", required: true },
    { name: "gateInDate", label: "Gate In Date", type: "datetime-local" },
    { name: "freeTimeDays", label: "Free Time Days", type: "number", required: true },
    { name: "freeTimeExpiry", label: "Free Time Expiry", type: "datetime-local", required: true },
    { name: "detentionDays", label: "Detention Days", type: "number" },
    { name: "dailyRate", label: "Daily Rate", type: "text", required: true },
    { name: "totalAmount", label: "Total Amount", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "depotName", label: "Depot Name", type: "text" },
    { name: "depotLocation", label: "Depot Location", type: "select", options: portOpts },
    {
      name: "containerCondition",
      label: "Container Condition",
      type: "select",
      options: [
        { value: "good", label: "Good" },
        { value: "damaged", label: "Damaged" },
        { value: "needs_repair", label: "Needs Repair" },
        { value: "condemned", label: "Condemned" },
      ],
    },
    { name: "damageNotes", label: "Damage Notes", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/detention-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Detention Tracking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Detention Tracking"
          apiPath="/api/v1/demurrage-detention-management/detention-trackings"
          fields={DETENTION_TRACKING_FIELDS}
          returnPath="/demurrage-detention-management/detention-trackings"
        />
      </div>
    </div>
  );
}
