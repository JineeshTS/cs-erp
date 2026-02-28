import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmUtilizationAnalyses } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const UA_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "analysisDate", label: "Analysis Date", type: "datetime-local", required: true },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  { name: "currentUtilizationPercent", label: "Current Utilization %", type: "number" },
  { name: "projectedUtilizationPercent", label: "Projected Utilization %", type: "number" },
  { name: "recommendedAction", label: "Recommended Action", type: "textarea" },
  { name: "recommendedRoute", label: "Recommended Route", type: "text" },
  { name: "projectedRevenueImpact", label: "Projected Revenue Impact", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "aiModel", label: "AI Model", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditUtilizationAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const ua = await db
    .select()
    .from(cvmUtilizationAnalyses)
    .where(
      and(
        eq(cvmUtilizationAnalyses.id, id),
        eq(cvmUtilizationAnalyses.tenantId, session.tenantId),
        isNull(cvmUtilizationAnalyses.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ua) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/utilization-analyses/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Utilization Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Utilization Analysis"
          apiPath={`/api/v1/chartering-vessel-management/utilization-analyses/${id}`}
          fields={UA_FIELDS}
          initialData={{
            vesselName: ua.vesselName,
            analysisDate: ua.analysisDate ? ua.analysisDate.toISOString() : "",
            periodFrom: ua.periodFrom ? ua.periodFrom.toISOString() : "",
            periodTo: ua.periodTo ? ua.periodTo.toISOString() : "",
            currentUtilizationPercent: ua.currentUtilizationPercent
              ? Number(ua.currentUtilizationPercent)
              : "",
            projectedUtilizationPercent: ua.projectedUtilizationPercent
              ? Number(ua.projectedUtilizationPercent)
              : "",
            recommendedAction: ua.recommendedAction ?? "",
            recommendedRoute: ua.recommendedRoute ?? "",
            projectedRevenueImpact: ua.projectedRevenueImpact ?? "",
            currency: ua.currency,
            aiModel: ua.aiModel ?? "",
            notes: ua.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/utilization-analyses/${id}`}
        />
      </div>
    </div>
  );
}
