import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const BOOKING_SCREENING_FIELDS: FieldConfig[] = [
  { name: "bookingRef", label: "Booking Ref", type: "text", required: true },
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "unNumber", label: "UN Number", type: "text", required: true, placeholder: "e.g. UN1234" },
  { name: "properShippingName", label: "Proper Shipping Name", type: "text", required: true },
  { name: "imdgClass", label: "IMDG Class", type: "text", required: true, placeholder: "e.g. 3" },
  { name: "packingGroup", label: "Packing Group", type: "text", placeholder: "e.g. I, II, III" },
  { name: "grossWeight", label: "Gross Weight", type: "text" },
  { name: "netWeight", label: "Net Weight", type: "text" },
  { name: "weightUnit", label: "Weight Unit", type: "text", placeholder: "e.g. KG, LBS" },
  { name: "numberOfPackages", label: "Number of Packages", type: "number" },
  { name: "packageType", label: "Package Type", type: "text" },
  { name: "marinePollutant", label: "Marine Pollutant", type: "checkbox" },
  { name: "limitedQuantity", label: "Limited Quantity", type: "checkbox" },
  { name: "innerPackagingDetails", label: "Inner Packaging Details", type: "textarea" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  {
    name: "screeningResult",
    label: "Screening Result",
    type: "select",
    options: [
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "conditional", label: "Conditional" },
      { value: "pending", label: "Pending" },
    ],
  },
  { name: "screeningNotes", label: "Screening Notes", type: "textarea" },
  { name: "riskScore", label: "Risk Score", type: "text" },
  { name: "screenedByName", label: "Screened By", type: "text" },
  { name: "screenedAt", label: "Screened At", type: "datetime-local" },
  { name: "approvedByName", label: "Approved By", type: "text" },
  { name: "approvedAt", label: "Approved At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewBookingScreeningPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "dangerous_goods:create"))
  )
    redirect("/dangerous-goods-management/booking-screenings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/booking-screenings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Booking Screening</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Booking Screening"
          apiPath="/api/v1/dangerous-goods-management/booking-screenings"
          fields={BOOKING_SCREENING_FIELDS}
          returnPath="/dangerous-goods-management/booking-screenings"
        />
      </div>
    </div>
  );
}
