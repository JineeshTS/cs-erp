import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewVesselSchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:create")))
    redirect("/capacity-voyage-management");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const SCHEDULE_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text", placeholder: "1234567" },
    { name: "serviceName", label: "Service Name", type: "text", required: true },
    { name: "tradeLane", label: "Trade Lane", type: "text", placeholder: "Asia-Europe" },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Vessel Schedule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Vessel Schedule"
          apiPath="/api/v1/capacity-voyage-management/vessel-schedules"
          fields={SCHEDULE_FIELDS}
          returnPath="/capacity-voyage-management"
        />
      </div>
    </div>
  );
}
