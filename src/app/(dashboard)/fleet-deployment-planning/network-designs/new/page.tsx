import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FdpForm } from "@/components/fleet-deployment-planning/fdp-form";
import type { FieldConfig } from "@/components/fleet-deployment-planning/fdp-form";

const NETWORK_DESIGN_FIELDS: FieldConfig[] = [
  {
    name: "networkType",
    label: "Network Type",
    type: "select",
    required: true,
    options: [
      { value: "hub_spoke", label: "Hub & Spoke" },
      { value: "direct_service", label: "Direct Service" },
      { value: "pendulum", label: "Pendulum" },
      { value: "round_trip", label: "Round Trip" },
      { value: "relay", label: "Relay" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "serviceName", label: "Service Name", type: "text" },
  { name: "portRotation", label: "Port Rotation", type: "textarea" },
  { name: "roundTripDays", label: "Round Trip Days", type: "number" },
  { name: "vesselCount", label: "Vessel Count", type: "number" },
  { name: "weeklyFrequency", label: "Weekly Frequency", type: "number" },
  { name: "estimatedRevenue", label: "Estimated Revenue", type: "number" },
  { name: "estimatedCost", label: "Estimated Cost", type: "number" },
  { name: "netContribution", label: "Net Contribution", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewNetworkDesignPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:create")))
    redirect("/fleet-deployment-planning/network-designs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet-deployment-planning/network-designs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Network Design
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FdpForm
          entityType="Network Design"
          apiPath="/api/v1/fleet-deployment-planning/network-designs"
          fields={NETWORK_DESIGN_FIELDS}
          returnPath="/fleet-deployment-planning/network-designs"
        />
      </div>
    </div>
  );
}
