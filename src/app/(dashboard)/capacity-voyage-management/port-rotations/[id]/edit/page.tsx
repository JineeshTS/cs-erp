import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capPortRotations } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditPortRotationPage({
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
    {
      name: "vesselScheduleId",
      label: "Vessel Schedule ID",
      type: "text",
    },
    {
      name: "portCode",
      label: "Port Code",
      type: "select", options: portOpts,
      required: true,
    },
    {
      name: "portName",
      label: "Port Name",
      type: "select", options: portOpts,
      required: true,
    },
    {
      name: "sequenceNumber",
      label: "Sequence Number",
      type: "number",
      required: true,
    },
    {
      name: "arrivalEta",
      label: "Arrival ETA",
      type: "datetime-local",
    },
    {
      name: "departureEtd",
      label: "Departure ETD",
      type: "datetime-local",
    },
    {
      name: "actualArrival",
      label: "Actual Arrival",
      type: "datetime-local",
    },
    {
      name: "actualDeparture",
      label: "Actual Departure",
      type: "datetime-local",
    },
    {
      name: "terminalName",
      label: "Terminal Name",
      type: "text",
    },
    {
      name: "berthName",
      label: "Berth Name",
      type: "text",
    },
    {
      name: "callPurpose",
      label: "Call Purpose",
      type: "select",
      options: [
        { value: "loading", label: "Loading" },
        { value: "discharging", label: "Discharging" },
        { value: "both", label: "Both" },
        { value: "bunker", label: "Bunker" },
        { value: "transit", label: "Transit" },
      ],
    },
    {
      name: "timeZone",
      label: "Time Zone",
      type: "text",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "arrived", label: "Arrived" },
        { value: "berthed", label: "Berthed" },
        { value: "departed", label: "Departed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "skipped", label: "Skipped" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  const { id } = await params;
  const pr = await db
    .select()
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.id, id),
        eq(capPortRotations.tenantId, session.tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!pr) notFound();

  const initialData: Record<string, unknown> = {
    vesselScheduleId: pr.vesselScheduleId ?? "",
    portCode: pr.portCode,
    portName: pr.portName,
    sequenceNumber: Number(pr.sequenceNumber),
    arrivalEta: pr.arrivalEta?.toISOString() ?? "",
    departureEtd: pr.departureEtd?.toISOString() ?? "",
    actualArrival: pr.actualArrival?.toISOString() ?? "",
    actualDeparture: pr.actualDeparture?.toISOString() ?? "",
    terminalName: pr.terminalName ?? "",
    berthName: pr.berthName ?? "",
    callPurpose: pr.callPurpose,
    timeZone: pr.timeZone ?? "",
    status: pr.status,
    notes: pr.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/port-rotations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Port Rotation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Port Rotation"
          apiPath={`/api/v1/capacity-voyage-management/port-rotations/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/port-rotations/${id}`}
        />
      </div>
    </div>
  );
}
