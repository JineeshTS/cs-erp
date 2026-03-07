import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVoyageBudget } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditVoyageBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");


  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const { id } = await params;
  const budget = await getVoyageBudget(id, session.tenantId);
  if (!budget) notFound();

  const fields: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "serviceRoute", label: "Service Route", type: "text" },
    {
      name: "budgetType",
      label: "Budget Type",
      type: "select",
      required: true,
      options: [
        { value: "preliminary", label: "Preliminary" },
        { value: "final", label: "Final" },
        { value: "revised", label: "Revised" },
        { value: "supplementary", label: "Supplementary" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    { name: "bunkerCost", label: "Bunker Cost", type: "number" },
    { name: "portCost", label: "Port Cost", type: "number" },
    { name: "canalCost", label: "Canal Cost", type: "number" },
    { name: "crewCost", label: "Crew Cost", type: "number" },
    { name: "insuranceCost", label: "Insurance Cost", type: "number" },
    { name: "otherCost", label: "Other Cost", type: "number" },
    {
      name: "totalBudget",
      label: "Total Budget",
      type: "number",
      required: true,
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    voyageRef: budget.voyageRef,
    vesselName: budget.vesselName,
    vesselImo: budget.vesselImo,
    serviceRoute: budget.serviceRoute,
    budgetType: budget.budgetType,
    currency: budget.currency,
    bunkerCost: budget.bunkerCost,
    portCost: budget.portCost,
    canalCost: budget.canalCost,
    crewCost: budget.crewCost,
    insuranceCost: budget.insuranceCost,
    otherCost: budget.otherCost,
    totalBudget: budget.totalBudget,
    notes: budget.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/voyage-budgets/${budget.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {budget.budgetRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update voyage budget details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Voyage Budget"
          apiPath={`/api/v1/costing-financial-management/voyage-budgets/${budget.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/voyage-budgets"
        />
      </div>
    </div>
  );
}
