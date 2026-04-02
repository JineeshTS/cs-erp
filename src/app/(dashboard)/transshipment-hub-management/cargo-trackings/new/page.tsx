import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewCargoTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "thm:create"))
  )
    redirect("/transshipment-hub-management/cargo-trackings");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const CARGO_TRACKING_FIELDS: FieldConfig[] = [
    {
      name: "trackingType",
      label: "Tracking Type",
      type: "select",
      required: true,
      options: [
        { value: "discharge_tracking", label: "Discharge Tracking" },
        { value: "yard_movement", label: "Yard Movement" },
        { value: "load_tracking", label: "Load Tracking" },
        { value: "gate_passage", label: "Gate Passage" },
        { value: "milestone_update", label: "Milestone Update" },
      ],
    },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "hubPort", label: "Hub Port", type: "select", options: portOpts },
    { name: "currentLocation", label: "Current Location", type: "text" },
    { name: "inboundVessel", label: "Inbound Vessel", type: "select", options: vesselOpts },
    { name: "outboundVessel", label: "Outbound Vessel", type: "select", options: vesselOpts },
    { name: "dischargeTime", label: "Discharge Time", type: "datetime-local" },
    { name: "loadTime", label: "Load Time", type: "datetime-local" },
    { name: "yardPosition", label: "Yard Position", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/cargo-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cargo Tracking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Cargo Tracking"
          apiPath="/api/v1/transshipment-hub-management/cargo-trackings"
          fields={CARGO_TRACKING_FIELDS}
          returnPath="/transshipment-hub-management/cargo-trackings"
        />
      </div>
    </div>
  );
}
