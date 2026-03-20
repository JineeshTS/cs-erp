import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBudgetPlanning } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function BudgetPlanningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const { id } = await params;
  const record = await getBudgetPlanning(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ptt:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "ptt:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/port-tariff-terminal-billing/budget-plannings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.budgetRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Budget Planning Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/port-tariff-terminal-billing/budget-plannings/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/port-tariff-terminal-billing/budget-plannings/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Budget Ref
            </dt>
            <dd className="mt-1 text-sm">{record.budgetRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge variant="outline">{record.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Budget Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.budgetType?.replace(/_/g, " ") ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Port Code
            </dt>
            <dd className="mt-1 text-sm">{record.portCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Port Name
            </dt>
            <dd className="mt-1 text-sm">{record.portName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Fiscal Year
            </dt>
            <dd className="mt-1 text-sm">{record.fiscalYear ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Fiscal Period
            </dt>
            <dd className="mt-1 text-sm">{record.fiscalPeriod ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Budgeted Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.budgetedAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Actual Amount
            </dt>
            <dd className="mt-1 text-sm">{record.actualAmount ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Variance Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.varianceAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Variance Percentage
            </dt>
            <dd className="mt-1 text-sm">
              {record.variancePercentage ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.budgetCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Cost Category
            </dt>
            <dd className="mt-1 text-sm">
              {record.costCategory ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Forecasted Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.forecastedAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Approved By
            </dt>
            <dd className="mt-1 text-sm">{record.approvedBy ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Approval Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.approvalDate
                ? new Date(record.approvalDate).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.notes ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
