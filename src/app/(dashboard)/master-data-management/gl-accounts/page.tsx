import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, isNull, desc } from "drizzle-orm";
import { glAccounts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function GlAccountsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "masterdata:create"
  );

  const data = await db
    .select()
    .from(glAccounts)
    .where(
      eq(glAccounts.tenantId, session.tenantId)
    )
    .orderBy(desc(glAccounts.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GL Accounts</h1>
          <p className="text-sm text-gray-500">
            Manage general ledger account master data
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/gl-accounts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No GL accounts found.</p>
          {canCreate && (
            <Link
              href="/master-data-management/gl-accounts/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first GL account
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Account Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Account Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Normal Balance
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((account) => (
                <tr
                  key={account.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/master-data-management/gl-accounts/${account.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {account.accountCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{account.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {account.accountType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {account.normalBalance}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={account.isActive ? "success" : "secondary"}
                    >
                      {account.isActive ? "active" : "inactive"}
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
