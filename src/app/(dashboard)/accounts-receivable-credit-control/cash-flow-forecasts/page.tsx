import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { listCashFlowForecasts } from "@/lib/accounts-receivable-credit-control/service";

export default async function CashFlowForecastsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.id, session.tenantId, "receivable:read"))) {
    redirect("/login");
  }

  const params = await searchParams;
  const search = params.search || "";
  const cursor = params.cursor || undefined;

  const { data, meta } = await listCashFlowForecasts({
    search,
    cursor,
    limit: 50,
    tenantId: session.tenantId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          Cash Flow Forecasts
        </h1>
        {(await hasPermission(session.id, session.tenantId, "receivable:create")) && (
          <Link
            href="/accounts-receivable-credit-control/cash-flow-forecasts/new"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            + New Forecast
          </Link>
        )}
      </div>

      <form method="GET" className="flex items-center gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search forecasts..."
          className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No cash flow forecasts found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try adjusting your search query."
              : "Create your first cash flow forecast to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Forecast Ref</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Period</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">Year</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">Month</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">Expected Inflows</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">Expected Outflows</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">Net Cash Flow</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Scenario</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: Record<string, unknown>) => (
                  <tr
                    key={row.id as string}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts-receivable-credit-control/cash-flow-forecasts/${row.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {row.forecastRef as string}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.forecastPeriod as string}</td>
                    <td className="px-4 py-3 text-end text-foreground">{row.forecastYear as string}</td>
                    <td className="px-4 py-3 text-end text-foreground">{row.forecastMonth as string}</td>
                    <td className="px-4 py-3 text-end text-foreground">
                      {row.expectedInflows != null ? Number(row.expectedInflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-end text-foreground">
                      {row.expectedOutflows != null ? Number(row.expectedOutflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-end text-foreground">
                      {row.netCashFlow != null ? Number(row.netCashFlow).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.scenarioType as string}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
                        {row.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta?.cursor && (
            <div className="flex justify-center">
              <Link
                href={`/accounts-receivable-credit-control/cash-flow-forecasts?cursor=${meta.cursor}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Load more
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
