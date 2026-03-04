import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

const VOYAGE_OPTIMIZATION_FIELDS: FieldConfig[] = [
  {
    name: "optimizationType",
    label: "Optimization Type",
    type: "select",
    required: true,
    options: [
      { value: "route_optimization", label: "Route Optimization" },
      { value: "speed_profile", label: "Speed Profile" },
      { value: "port_sequence", label: "Port Sequence" },
      { value: "bunker_strategy", label: "Bunker Strategy" },
      { value: "emission_reduction", label: "Emission Reduction" },
    ],
  },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "originalCost", label: "Original Cost", type: "text" },
  { name: "optimizedCost", label: "Optimized Cost", type: "text" },
  { name: "savingsAmount", label: "Savings Amount", type: "text" },
  { name: "savingsPct", label: "Savings %", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "accepted", label: "Accepted", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewVoyageOptimizationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/voyage-optimizations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/voyage-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Voyage Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Voyage Optimization"
          apiPath="/api/v1/schedule-voyage-planning/voyage-optimizations"
          fields={VOYAGE_OPTIMIZATION_FIELDS}
          returnPath="/schedule-voyage-planning/voyage-optimizations"
        />
      </div>
    </div>
  );
}
