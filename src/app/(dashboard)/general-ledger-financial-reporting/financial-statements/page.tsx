import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listFinancialStatements } from "@/lib/general-ledger-financial-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function FinancialStatementsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/general-ledger-financial-reporting");

  const canCreate = await hasPermission(session.id, session.tenantId, "gl:create");
  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data, meta } = await listFinancialStatements({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildNextUrl(nextCursor: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCursor);
    return `/general-ledger-financial-reporting/financial-statements?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Statements
          </h1>
          <p className="text-sm text-gray-500">
            Generate IFRS-compliant financial statements
          </p>
        </div>
        {canCreate && (
          <Link
            href="/general-ledger-financial-reporting/financial-statements/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Financial Statement
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Statement ref..."
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Filter
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-2 text-gray-500">No financial statements found.</p>
          {canCreate && (
            <Link
              href="/general-ledger-financial-reporting/financial-statements/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first financial statement
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Standard
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Fiscal Year
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Net Income
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/general-ledger-financial-reporting/financial-statements/${row.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {row.statementRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.statementType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.reportingStandard ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.fiscalYear ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.netIncome ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        row.status === "published"
                          ? "success"
                          : row.status === "approved"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && meta.cursor && (
        <div className="flex justify-end">
          <Link
            href={buildNextUrl(meta.cursor)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next Page
          </Link>
        </div>
      )}
    </div>
  );
}
