import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capTransshipmentPlans } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditTransshipmentPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const portOpts = await getPortOptions(session.tenantId);

  const FIELDS: FieldConfig[] = [
    { name: "bookingReference", label: "Booking Reference", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    {
      name: "originPort",
      label: "Origin Port",
      type: "select", options: portOpts,
      required: true,
    },
    {
      name: "transshipmentPort",
      label: "Transshipment Port",
      type: "text",
      required: true,
    },
    {
      name: "destinationPort",
      label: "Destination Port",
      type: "select", options: portOpts,
      required: true,
    },
    {
      name: "firstVesselScheduleId",
      label: "First Vessel Schedule ID",
      type: "text",
    },
    {
      name: "secondVesselScheduleId",
      label: "Second Vessel Schedule ID",
      type: "text",
    },
    {
      name: "expectedArrival",
      label: "Expected Arrival",
      type: "datetime-local",
    },
    {
      name: "expectedConnection",
      label: "Expected Connection",
      type: "datetime-local",
    },
    { name: "dwellDays", label: "Dwell Days", type: "number" },
    {
      name: "connectionType",
      label: "Connection Type",
      type: "select",
      options: [
        { value: "direct", label: "Direct" },
        { value: "indirect", label: "Indirect" },
        { value: "relay", label: "Relay" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "planned", label: "Planned" },
        { value: "in_transit", label: "In Transit" },
        { value: "at_hub", label: "At Hub" },
        { value: "connected", label: "Connected" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      name: "coordinationNotes",
      label: "Coordination Notes",
      type: "textarea",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await db
    .select()
    .from(capTransshipmentPlans)
    .where(
      and(
        eq(capTransshipmentPlans.id, id),
        eq(capTransshipmentPlans.tenantId, session.tenantId),
        isNull(capTransshipmentPlans.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    bookingReference: record.bookingReference ?? "",
    containerNumber: record.containerNumber ?? "",
    originPort: record.originPort,
    transshipmentPort: record.transshipmentPort,
    destinationPort: record.destinationPort,
    firstVesselScheduleId: record.firstVesselScheduleId ?? "",
    secondVesselScheduleId: record.secondVesselScheduleId ?? "",
    expectedArrival: record.expectedArrival?.toISOString() ?? "",
    expectedConnection: record.expectedConnection?.toISOString() ?? "",
    dwellDays: record.dwellDays ?? "",
    connectionType: record.connectionType ?? "",
    status: record.status,
    coordinationNotes: record.coordinationNotes ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/transshipment-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Transshipment Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Transshipment Plan"
          apiPath={`/api/v1/capacity-voyage-management/transshipment-plans/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/transshipment-plans/${id}`}
        />
      </div>
    </div>
  );
}
