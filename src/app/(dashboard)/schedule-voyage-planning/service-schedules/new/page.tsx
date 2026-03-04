import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

const SERVICE_SCHEDULE_FIELDS: FieldConfig[] = [
  {
    name: "scheduleType",
    label: "Schedule Type",
    type: "select",
    required: true,
    options: [
      { value: "liner_service", label: "Liner Service" },
      { value: "feeder_service", label: "Feeder Service" },
      { value: "relay_service", label: "Relay Service" },
      { value: "pendulum_route", label: "Pendulum Route" },
      { value: "round_trip", label: "Round Trip" },
    ],
  },
  { name: "serviceName", label: "Service Name", type: "text" },
  { name: "serviceCode", label: "Service Code", type: "text" },
  { name: "tradeRoute", label: "Trade Route", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "frequencyDays", label: "Frequency (Days)", type: "number" },
  { name: "portCount", label: "Port Count", type: "number" },
  { name: "transitTimeDays", label: "Transit Time (Days)", type: "number" },
  { name: "publishedAt", label: "Published At", type: "datetime-local" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewServiceSchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/service-schedules");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/service-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Service Schedule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Service Schedule"
          apiPath="/api/v1/schedule-voyage-planning/service-schedules"
          fields={SERVICE_SCHEDULE_FIELDS}
          returnPath="/schedule-voyage-planning/service-schedules"
        />
      </div>
    </div>
  );
}
