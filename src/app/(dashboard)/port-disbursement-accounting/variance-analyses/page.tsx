import Link from "next/link";
import { Plus, GitCompare } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listVarianceAnalyses } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function VarianceAnalysesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:create"
  );

  const sp = await searchParams;
  const { data } = await listVarianceAnalyses({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
    limit: 50,
  });

  function statusVariant(status: string) {
    switch (status) {
      case "completed":
        return "success" as const;
      case "flagged":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Variance Analyses
          </h1>
          <p className="text-sm text-gray-500">
            PDA vs FDA variance analysis and reporting
          </p>
        </div>
        {canCreate && (
          <Link
            href="/port-disbursement-accounting/variance-analyses/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Variance Analysis
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <GitCompare className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-500">No variance analyses found.</p>
          {canCreate && (
            <Link
              href="/port-disbursement-accounting/variance-analyses/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first variance analysis
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Analysis Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Total Variance
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Within Threshold
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr
                  key={record.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/port-disbursement-accounting/variance-analyses/${record.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {record.analysisRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.vesselName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.portName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.totalVariance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.withinThreshold ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
