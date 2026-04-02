import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCargoMixOptimization } from "@/lib/liner-operations-control/service";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditCargoMixOptimizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const CARGO_MIX_OPTIMIZATION_FIELDS: FieldConfig[] = [
    {
      name: "optimizationType",
      label: "Optimization Type",
      type: "select",
      required: true,
      options: [
        { value: "weight_revenue_balance", label: "Weight Revenue Balance" },
        { value: "reefer_dry_mix", label: "Reefer Dry Mix" },
        { value: "hazmat_allocation", label: "Hazmat Allocation" },
        { value: "high_value_priority", label: "High Value Priority" },
        { value: "deadweight_optimization", label: "Deadweight Optimization" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "tradeRoute", label: "Trade Route", type: "text" },
    { name: "currentRevenue", label: "Current Revenue", type: "number" },
    { name: "optimizedRevenue", label: "Optimized Revenue", type: "number" },
    { name: "revenueUplift", label: "Revenue Uplift", type: "number" },
    { name: "upliftPercentage", label: "Uplift Percentage", type: "number" },
    { name: "revenueCurrency", label: "Revenue Currency", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "number" },
    { name: "reeferSlots", label: "Reefer Slots", type: "number" },
    { name: "hazmatSlots", label: "Hazmat Slots", type: "number" },
    { name: "recommendation", label: "Recommendation", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getCargoMixOptimization(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    optimizationType: record.optimizationType ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    tradeRoute: record.tradeRoute ?? "",
    currentRevenue: record.currentRevenue ?? "",
    optimizedRevenue: record.optimizedRevenue ?? "",
    revenueUplift: record.revenueUplift ?? "",
    upliftPercentage: record.upliftPercentage ?? "",
    revenueCurrency: record.revenueCurrency ?? "",
    confidenceScore: record.confidenceScore ?? "",
    reeferSlots: record.reeferSlots?.toString() ?? "",
    hazmatSlots: record.hazmatSlots?.toString() ?? "",
    recommendation: record.recommendation ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/cargo-mix-optimizations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.optimizationRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update cargo mix optimization details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Cargo Mix Optimization"
          apiPath={`/api/v1/liner-operations-control/cargo-mix-optimizations/${id}`}
          returnPath="/liner-operations-control/cargo-mix-optimizations"
          fields={CARGO_MIX_OPTIMIZATION_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
