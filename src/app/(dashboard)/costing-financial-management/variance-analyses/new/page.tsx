import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewVarianceAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");


  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const fields: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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
      type: "select", options: currencyOpts,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/costing-financial-management/variance-analyses"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Variance Analysis
          </h1>
          <p className="text-sm text-gray-500">
            Create a new variance analysis
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Variance Analysis"
          apiPath="/api/v1/costing-financial-management/variance-analyses"
          fields={fields}
          returnPath="/costing-financial-management/variance-analyses"
        />
      </div>
    </div>
  );
}
