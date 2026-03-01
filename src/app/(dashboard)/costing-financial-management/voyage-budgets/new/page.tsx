import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function NewVoyageBudgetPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

  const fields: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "text", required: true },
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
      type: "text",
      placeholder: "USD",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/costing-financial-management/voyage-budgets"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Voyage Budget
          </h1>
          <p className="text-sm text-gray-500">
            Create a new voyage budget estimate
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Voyage Budget"
          apiPath="/api/v1/costing-financial-management/voyage-budgets"
          fields={fields}
          returnPath="/costing-financial-management/voyage-budgets"
        />
      </div>
    </div>
  );
}
