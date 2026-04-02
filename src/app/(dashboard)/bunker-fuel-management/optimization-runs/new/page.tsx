import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { BfmForm, FieldConfig } from "@/components/bunker-fuel-management/bfm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewOptimizationRunPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/optimization-runs");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const OPTIMIZATION_RUN_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    {
      name: "optimizationType",
      label: "Optimization Type",
      type: "select",
      required: true,
      options: [
        { value: "procurement", label: "Procurement" },
        { value: "routing", label: "Routing" },
        { value: "speed", label: "Speed" },
        { value: "fuel_mix", label: "Fuel Mix" },
        { value: "port_selection", label: "Port Selection" },
        { value: "comprehensive", label: "Comprehensive" },
      ],
    },
    {
      name: "inputParameters",
      label: "Input Parameters (JSON)",
      type: "textarea",
      required: true,
      placeholder: '{"budget": 100000, "ports": ["QADOH", "AEJEA"]}',
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/optimization-runs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Optimization Run
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Optimization Run"
          apiPath="/api/v1/bunker-fuel-management/optimization-runs"
          fields={OPTIMIZATION_RUN_FIELDS}
          returnPath="/bunker-fuel-management/optimization-runs"
        />
      </div>
    </div>
  );
}
