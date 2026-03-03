import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCostOptimization } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";

export default async function CostOptimizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const { id } = await params;
  const record = await getCostOptimization(id, session.tenantId);
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
            href="/port-tariff-terminal-billing/cost-optimizations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.optimizationRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Cost Optimization Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/port-tariff-terminal-billing/cost-optimizations/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/port-tariff-terminal-billing/cost-optimizations/${id}`}
              method="POST"
            >
              <input type="hidden" name="_method" value="DELETE" />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Optimization Ref
            </dt>
            <dd className="mt-1 text-sm">{record.optimizationRef}</dd>
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
              Optimization Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.optimizationType?.replace(/_/g, " ") ?? "\u2014"}
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
              Current Cost
            </dt>
            <dd className="mt-1 text-sm">{record.currentCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Optimized Cost
            </dt>
            <dd className="mt-1 text-sm">{record.optimizedCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Projected Savings
            </dt>
            <dd className="mt-1 text-sm">
              {record.projectedSavings ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Savings Percentage
            </dt>
            <dd className="mt-1 text-sm">
              {record.savingsPercentage ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.optimizationCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Confidence Score
            </dt>
            <dd className="mt-1 text-sm">
              {record.confidenceScore ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Implementation Difficulty
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.implementationDifficulty ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Timeline (Weeks)
            </dt>
            <dd className="mt-1 text-sm">
              {record.timelineWeeks ?? "\u2014"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Recommendation
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.recommendation ?? "\u2014"}
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
