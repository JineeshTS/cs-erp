import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTariffComparison } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";

export default async function TariffComparisonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const { id } = await params;
  const record = await getTariffComparison(id, session.tenantId);
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
            href="/port-tariff-terminal-billing/tariff-comparisons"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.comparisonRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tariff Comparison Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/port-tariff-terminal-billing/tariff-comparisons/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/port-tariff-terminal-billing/tariff-comparisons/${id}`}
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
              Comparison Ref
            </dt>
            <dd className="mt-1 text-sm">{record.comparisonRef}</dd>
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
              Comparison Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.comparisonType?.replace(/_/g, " ") ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Base Port Code
            </dt>
            <dd className="mt-1 text-sm">{record.basePortCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Base Port Name
            </dt>
            <dd className="mt-1 text-sm">{record.basePortName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Compare Port Code
            </dt>
            <dd className="mt-1 text-sm">
              {record.comparePortCode ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Compare Port Name
            </dt>
            <dd className="mt-1 text-sm">
              {record.comparePortName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Charge Category
            </dt>
            <dd className="mt-1 text-sm">
              {record.chargeCategory ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Base Port Cost
            </dt>
            <dd className="mt-1 text-sm">{record.basePortCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Compare Port Cost
            </dt>
            <dd className="mt-1 text-sm">
              {record.comparePortCost ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Difference Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.differenceAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Difference Percentage
            </dt>
            <dd className="mt-1 text-sm">
              {record.differencePercentage ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Benchmark Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.benchmarkCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Period From
            </dt>
            <dd className="mt-1 text-sm">
              {record.periodFrom
                ? new Date(record.periodFrom).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Period To
            </dt>
            <dd className="mt-1 text-sm">
              {record.periodTo
                ? new Date(record.periodTo).toLocaleString()
                : "\u2014"}
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
