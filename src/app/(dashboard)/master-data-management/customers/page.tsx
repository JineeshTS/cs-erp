import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { customers } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CustomersListPage() {
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
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, session.tenantId),
        isNull(customers.deletedAt)
      )
    )
    .orderBy(desc(customers.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            Manage customer and agent master data
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/customers/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No customers found.</p>
          {canCreate && (
            <Link
              href="/master-data-management/customers/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first customer
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  City
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/master-data-management/customers/${customer.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.customerType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.country || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.city || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        customer.status === "active" ? "success" : "secondary"
                      }
                    >
                      {customer.status}
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
