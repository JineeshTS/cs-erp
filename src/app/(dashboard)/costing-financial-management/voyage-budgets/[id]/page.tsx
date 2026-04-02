import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVoyageBudget } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyageBudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const budget = await getVoyageBudget(id, session.tenantId);
  if (!budget) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Budget Ref", value: budget.budgetRef },
    { label: "Voyage Ref", value: budget.voyageRef },
    { label: "Vessel Name", value: budget.vesselName },
    { label: "Vessel IMO", value: budget.vesselImo },
    { label: "Service Route", value: budget.serviceRoute },
    { label: "Budget Type", value: budget.budgetType },
    { label: "Currency", value: budget.currency },
    { label: "Bunker Cost", value: budget.bunkerCost },
    { label: "Port Cost", value: budget.portCost },
    { label: "Canal Cost", value: budget.canalCost },
    { label: "Crew Cost", value: budget.crewCost },
    { label: "Insurance Cost", value: budget.insuranceCost },
    { label: "Other Cost", value: budget.otherCost },
    { label: "Total Budget", value: budget.totalBudget },
    { label: "Total Actual", value: budget.totalActual },
    { label: "Variance", value: budget.variance },
    { label: "Variance %", value: budget.variancePercent },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            budget.status === "approved"
              ? "success"
              : budget.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {budget.status}
        </Badge>
      ),
    },
    {
      label: "Approved At",
      value: budget.approvedAt
        ? new Date(budget.approvedAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: budget.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/voyage-budgets"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {budget.budgetRef}
            </h1>
            <p className="text-sm text-gray-500">Voyage Budget Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/voyage-budgets/${budget.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
