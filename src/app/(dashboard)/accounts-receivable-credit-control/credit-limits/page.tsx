import Link from "next/link";
import { Plus, ShieldCheck, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listCreditLimits } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CreditLimitsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canCreate = await hasPermission(session.id, session.tenantId, "receivable:create");

  const sp = await searchParams;
  const result = await listCreditLimits({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
    limit: 50,
  });

  const riskVariant = (risk: string) => {
    switch (risk) {
      case "low": return "success" as const;
      case "standard": return "secondary" as const;
      case "medium": return "warning" as const;
      case "high": return "destructive" as const;
      case "critical": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Limits</h1>
          <p className="text-sm text-gray-500">Manage credit limits and risk assessment</p>
        </div>
        {canCreate && (
          <Link href="/accounts-receivable-credit-control/credit-limits/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Credit Limit
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={sp.search ?? ""} placeholder="Customer name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {sp.search && <Link href="/accounts-receivable-credit-control/credit-limits" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No credit limits found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Credit Limit</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Current Exposure</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Available Credit</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Risk Category</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {result.data.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><Link href={`/accounts-receivable-credit-control/credit-limits/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.customerName}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{t.creditLimit?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.currentExposure?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.availableCredit?.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge variant={riskVariant(t.riskCategory)}>{t.riskCategory}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={t.status === "active" ? "success" : "secondary"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.meta.hasMore && result.meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={`/accounts-receivable-credit-control/credit-limits?cursor=${result.meta.cursor}${sp.search ? `&search=${sp.search}` : ""}`} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
