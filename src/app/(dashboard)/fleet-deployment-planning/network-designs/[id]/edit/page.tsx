import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getNetworkDesign } from "@/lib/fleet-deployment-planning/service";
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

export default async function EditNetworkDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:edit")))
    redirect("/fleet-deployment-planning/network-designs");

  const { id } = await params;

  const design = await getNetworkDesign(session.tenantId, id);

  if (!design) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fleet-deployment-planning/network-designs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Design</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FdpForm
          entityType="Network Design"
          apiPath={`/api/v1/fleet-deployment-planning/network-designs/${id}`}
          fields={NETWORK_DESIGN_FIELDS}
          initialData={{
            networkType: design.networkType,
            title: design.title,
            serviceName: design.serviceName ?? "",
            portRotation: design.portRotation ?? "",
            roundTripDays: design.roundTripDays ?? "",
            vesselCount: design.vesselCount ?? "",
            weeklyFrequency: design.weeklyFrequency ?? "",
            estimatedRevenue: design.estimatedRevenue ?? "",
            estimatedCost: design.estimatedCost ?? "",
            netContribution: design.netContribution ?? "",
            notes: design.notes ?? "",
          }}
          isEdit
          returnPath={`/fleet-deployment-planning/network-designs/${id}`}
        />
      </div>
    </div>
  );
}
