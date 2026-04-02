import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewUtilizationAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const UA_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "analysisDate", label: "Analysis Date", type: "datetime-local", required: true },
    { name: "periodFrom", label: "Period From", type: "datetime-local" },
    { name: "periodTo", label: "Period To", type: "datetime-local" },
    { name: "currentUtilizationPercent", label: "Current Utilization %", type: "number" },
    { name: "projectedUtilizationPercent", label: "Projected Utilization %", type: "number" },
    { name: "recommendedAction", label: "Recommended Action", type: "textarea" },
    { name: "recommendedRoute", label: "Recommended Route", type: "text" },
    { name: "projectedRevenueImpact", label: "Projected Revenue Impact", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "aiModel", label: "AI Model", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/utilization-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Utilization Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Utilization Analysis"
          apiPath="/api/v1/chartering-vessel-management/utilization-analyses"
          fields={UA_FIELDS}
          returnPath="/chartering-vessel-management/utilization-analyses"
        />
      </div>
    </div>
  );
}
