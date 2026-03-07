import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyageOptimization } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditVoyageOptimizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/voyage-optimizations");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "originalCost", label: "Original Cost", type: "text" },
    { name: "optimizedCost", label: "Optimized Cost", type: "text" },
    { name: "savingsAmount", label: "Savings Amount", type: "text" },
    { name: "savingsPct", label: "Savings %", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "modelVersion", label: "Model Version", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "text" },
    { name: "accepted", label: "Accepted", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getVoyageOptimization(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/voyage-optimizations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Voyage Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Voyage Optimization"
          apiPath={`/api/v1/schedule-voyage-planning/voyage-optimizations/${id}`}
          fields={VOYAGE_OPTIMIZATION_FIELDS}
          initialData={{
            optimizationType: record.optimizationType,
            voyageRef: record.voyageRef ?? "",
            vesselName: record.vesselName ?? "",
            originalCost: record.originalCost ?? "",
            optimizedCost: record.optimizedCost ?? "",
            savingsAmount: record.savingsAmount ?? "",
            savingsPct: record.savingsPct ?? "",
            currency: record.currency ?? "",
            modelVersion: record.modelVersion ?? "",
            confidenceScore: record.confidenceScore ?? "",
            accepted: record.accepted ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/voyage-optimizations/${id}`}
        />
      </div>
    </div>
  );
}
