import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getVesselOptions, getPortOptions } from "@/lib/lookups";

export default async function NewFeederCoordinationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "thm:create"))
  )
    redirect("/transshipment-hub-management/feeder-coordinations");

  const [vesselOpts, portOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getPortOptions(session.tenantId),
  ]);

  const FEEDER_COORDINATION_FIELDS: FieldConfig[] = [
    {
      name: "coordinationType",
      label: "Coordination Type",
      type: "select",
      required: true,
      options: [
        { value: "feeder_arrival", label: "Feeder Arrival" },
        { value: "feeder_departure", label: "Feeder Departure" },
        { value: "relay_connection", label: "Relay Connection" },
        { value: "barge_transfer", label: "Barge Transfer" },
        { value: "intermodal_link", label: "Intermodal Link" },
      ],
    },
    { name: "feederVessel", label: "Feeder Vessel", type: "select", options: vesselOpts },
    { name: "feederService", label: "Feeder Service", type: "text" },
    { name: "motherVessel", label: "Mother Vessel", type: "select", options: vesselOpts },
    { name: "hubPort", label: "Hub Port", type: "select", options: portOpts },
    { name: "etaFeeder", label: "ETA Feeder", type: "datetime-local" },
    { name: "etdFeeder", label: "ETD Feeder", type: "datetime-local" },
    { name: "connectionWindowHours", label: "Connection Window (Hours)", type: "text" },
    { name: "cargoUnits", label: "Cargo Units", type: "number" },
    { name: "bufferHours", label: "Buffer Hours", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/feeder-coordinations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Feeder Coordination
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Feeder Coordination"
          apiPath="/api/v1/transshipment-hub-management/feeder-coordinations"
          fields={FEEDER_COORDINATION_FIELDS}
          returnPath="/transshipment-hub-management/feeder-coordinations"
        />
      </div>
    </div>
  );
}
