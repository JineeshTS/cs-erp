import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOverbookingRollover } from "@/lib/liner-operations-control/service";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";

const ROLLOVER_FIELDS: FieldConfig[] = [
  {
    name: "rolloverType",
    label: "Rollover Type",
    type: "select",
    required: true,
    options: [
      { value: "overbooking", label: "Overbooking" },
      { value: "rollover", label: "Rollover" },
      { value: "short_shipment", label: "Short Shipment" },
      { value: "shut_out", label: "Shut Out" },
      { value: "cargo_bump", label: "Cargo Bump" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "containerCount", label: "Container Count", type: "number" },
  { name: "teuCount", label: "TEU Count", type: "number" },
  { name: "originalVessel", label: "Original Vessel", type: "text" },
  { name: "nextVessel", label: "Next Vessel", type: "text" },
  { name: "nextVoyage", label: "Next Voyage", type: "text" },
  { name: "rolloverReason", label: "Rollover Reason", type: "textarea" },
  { name: "revenueImpact", label: "Revenue Impact", type: "number" },
  { name: "impactCurrency", label: "Impact Currency", type: "text" },
  {
    name: "customerNotified",
    label: "Customer Notified",
    type: "checkbox",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditOverbookingRolloverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getOverbookingRollover(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    rolloverType: record.rolloverType ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    portCode: record.portCode ?? "",
    portName: record.portName ?? "",
    bookingRef: record.bookingRef ?? "",
    containerCount: record.containerCount != null ? String(record.containerCount) : "",
    teuCount: record.teuCount ?? "",
    originalVessel: record.originalVessel ?? "",
    nextVessel: record.nextVessel ?? "",
    nextVoyage: record.nextVoyage ?? "",
    rolloverReason: record.rolloverReason ?? "",
    revenueImpact: record.revenueImpact ?? "",
    impactCurrency: record.impactCurrency ?? "",
    customerNotified: record.customerNotified ? "true" : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/overbooking-rollovers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.rolloverRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update overbooking rollover details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Overbooking Rollover"
          apiPath={`/api/v1/liner-operations-control/overbooking-rollovers/${id}`}
          returnPath="/liner-operations-control/overbooking-rollovers"
          fields={ROLLOVER_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
