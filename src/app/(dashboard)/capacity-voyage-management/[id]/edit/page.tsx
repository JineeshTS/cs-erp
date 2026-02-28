import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capVesselSchedules } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const SCHEDULE_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "vesselImo", label: "Vessel IMO", type: "text" },
  { name: "serviceName", label: "Service Name", type: "text", required: true },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "scheduleType", label: "Schedule Type", type: "select", options: [
    { value: "regular", label: "Regular" },
    { value: "ad_hoc", label: "Ad Hoc" },
    { value: "extra_loader", label: "Extra Loader" },
  ]},
  { name: "frequency", label: "Frequency", type: "select", options: [
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Biweekly" },
    { value: "monthly", label: "Monthly" },
    { value: "irregular", label: "Irregular" },
  ]},
  { name: "validityFrom", label: "Validity From", type: "datetime-local", required: true },
  { name: "validityTo", label: "Validity To", type: "datetime-local" },
  { name: "totalCapacityTeu", label: "Total Capacity (TEU)", type: "number" },
  { name: "totalWeightMt", label: "Total Weight (MT)", type: "number" },
  { name: "operatorName", label: "Operator Name", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "completed", label: "Completed" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVesselSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const { id } = await params;
  const vs = await db
    .select()
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, id),
        eq(capVesselSchedules.tenantId, session.tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!vs) notFound();

  const initialData: Record<string, unknown> = {
    vesselName: vs.vesselName,
    vesselImo: vs.vesselImo ?? "",
    serviceName: vs.serviceName,
    tradeLane: vs.tradeLane ?? "",
    scheduleType: vs.scheduleType,
    frequency: vs.frequency ?? "",
    validityFrom: vs.validityFrom?.toISOString() ?? "",
    validityTo: vs.validityTo?.toISOString() ?? "",
    totalCapacityTeu: vs.totalCapacityTeu ?? "",
    totalWeightMt: vs.totalWeightMt ?? "",
    operatorName: vs.operatorName ?? "",
    status: vs.status,
    notes: vs.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Vessel Schedule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Vessel Schedule"
          apiPath={`/api/v1/capacity-voyage-management/vessel-schedules/${id}`}
          fields={SCHEDULE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/${id}`}
        />
      </div>
    </div>
  );
}
