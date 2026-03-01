import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVarianceAnalysis } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function EditVarianceAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");

  const { id } = await params;
  const analysis = await getVarianceAnalysis(id, session.tenantId);
  if (!analysis) notFound();

  const fields: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "text" },
    { name: "costCentre", label: "Cost Centre", type: "text" },
    {
      name: "analysisPeriod",
      label: "Analysis Period",
      type: "text",
      required: true,
    },
    {
      name: "analysisType",
      label: "Analysis Type",
      type: "select",
      required: true,
      options: [
        { value: "voyage", label: "Voyage" },
        { value: "cost_centre", label: "Cost Centre" },
        { value: "department", label: "Department" },
        { value: "vessel", label: "Vessel" },
        { value: "service_route", label: "Service Route" },
        { value: "overall", label: "Overall" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "text",
      placeholder: "USD",
    },
    {
      name: "budgetAmount",
      label: "Budget Amount",
      type: "number",
      required: true,
    },
    {
      name: "actualAmount",
      label: "Actual Amount",
      type: "number",
      required: true,
    },
    {
      name: "varianceAmount",
      label: "Variance Amount",
      type: "number",
      required: true,
    },
    { name: "variancePercent", label: "Variance %", type: "number" },
    {
      name: "varianceType",
      label: "Variance Type",
      type: "select",
      options: [
        { value: "favorable", label: "Favorable" },
        { value: "unfavorable", label: "Unfavorable" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    voyageRef: analysis.voyageRef,
    vesselName: analysis.vesselName,
    costCentre: analysis.costCentre,
    analysisPeriod: analysis.analysisPeriod,
    analysisType: analysis.analysisType,
    currency: analysis.currency,
    budgetAmount: analysis.budgetAmount,
    actualAmount: analysis.actualAmount,
    varianceAmount: analysis.varianceAmount,
    variancePercent: analysis.variancePercent,
    varianceType: analysis.varianceType,
    notes: analysis.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/variance-analyses/${analysis.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {analysis.analysisRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update variance analysis details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Variance Analysis"
          apiPath={`/api/v1/costing-financial-management/variance-analyses/${analysis.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/variance-analyses"
        />
      </div>
    </div>
  );
}
