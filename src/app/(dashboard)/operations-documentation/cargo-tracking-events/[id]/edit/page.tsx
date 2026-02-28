import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmCargoTrackingEvents } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const FIELDS: FieldConfig[] = [
  { name: "containerNumber", label: "Container Number", type: "text" },
  {
    name: "eventType",
    label: "Event Type",
    type: "text",
    required: true,
    placeholder: "departure",
  },
  {
    name: "eventCode",
    label: "Event Code",
    type: "text",
    required: true,
    placeholder: "DEP",
  },
  { name: "eventDescription", label: "Event Description", type: "text" },
  { name: "eventLocation", label: "Event Location", type: "text" },
  { name: "eventPort", label: "Event Port", type: "text" },
  {
    name: "eventDate",
    label: "Event Date",
    type: "datetime-local",
    required: true,
  },
  { name: "reportedBy", label: "Reported By", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "isActual", label: "Is Actual", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCargoTrackingEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation");

  const { id } = await params;
  const record = await db
    .select()
    .from(odmCargoTrackingEvents)
    .where(
      and(
        eq(odmCargoTrackingEvents.id, id),
        eq(odmCargoTrackingEvents.tenantId, session.tenantId),
        isNull(odmCargoTrackingEvents.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    containerNumber: record.containerNumber ?? "",
    eventType: record.eventType,
    eventCode: record.eventCode,
    eventDescription: record.eventDescription ?? "",
    eventLocation: record.eventLocation ?? "",
    eventPort: record.eventPort ?? "",
    eventDate: record.eventDate?.toISOString() ?? "",
    reportedBy: record.reportedBy ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    isActual: record.isActual,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/operations-documentation/cargo-tracking-events/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cargo Tracking Event
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Cargo Tracking Event"
          apiPath={`/api/v1/operations-documentation/cargo-tracking-events/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/cargo-tracking-events/${id}`}
        />
      </div>
    </div>
  );
}
