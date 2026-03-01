import Link from "next/link";
import { ArrowLeft, Plus, Search, UserCog } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { isfServiceAccounts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ServiceAccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const canCreate = await hasPermission(session.id, session.tenantId, "infra:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const serviceType = sp.serviceType ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions: ReturnType<typeof eq>[] = [
    eq(isfServiceAccounts.tenantId, session.tenantId),
    isNull(isfServiceAccounts.deletedAt),
  ];
  if (serviceType)
    conditions.push(eq(isfServiceAccounts.serviceType, serviceType));
  if (search) {
    conditions.push(
      or(
        ilike(isfServiceAccounts.accountName, `%${search}%`),
        ilike(isfServiceAccounts.accountCode, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(isfServiceAccounts.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(isfServiceAccounts)
    .where(and(...conditions))
    .orderBy(desc(isfServiceAccounts.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (serviceType) p.set("serviceType", serviceType);
    p.set("cursor", nextCur);
    return `/infrastructure-security/service-accounts?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/infrastructure-security"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Service Accounts
            </h1>
            <p className="text-sm text-gray-500">
              Manage application and system service accounts
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/infrastructure-security/service-accounts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Service Account
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Account name or code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="serviceType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Service Type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            defaultValue={serviceType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="application">Application</option>
            <option value="system">System</option>
            <option value="integration">Integration</option>
            <option value="ci_cd">CI/CD</option>
            <option value="monitoring">Monitoring</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || serviceType) && (
          <Link
            href="/infrastructure-security/service-accounts"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <UserCog className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No service accounts found.</p>
          {canCreate && (
            <Link
              href="/infrastructure-security/service-accounts/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first service account
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Account Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Service Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/infrastructure-security/service-accounts/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.accountName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.accountCode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.serviceType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        t.status === "active"
                          ? "success"
                          : t.status === "suspended"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(nextCursor)}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
