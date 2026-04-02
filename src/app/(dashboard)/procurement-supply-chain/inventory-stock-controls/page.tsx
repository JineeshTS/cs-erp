import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listInventoryStockControls } from "@/lib/procurement-supply-chain/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  low_stock: "warning",
  out_of_stock: "destructive",
  discontinued: "secondary",
} as const;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "discontinued", label: "Discontinued" },
];

export default async function InventoryStockControlsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/procurement-supply-chain");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "procurement:create"
  );

  const { search, status, cursor } = await searchParams;
  const searchTerm = search || "";
  const statusFilter = status || "";

  const { data, meta } = await listInventoryStockControls({
    tenantId: session.tenantId,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    cursor: cursor || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Stock Controls
          </h1>
          <p className="text-sm text-gray-500">
            Manage inventory levels, reorder points, and stock controls
          </p>
        </div>
        {canCreate && (
          <Link
            href="/procurement-supply-chain/inventory-stock-controls/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Stock Control
          </Link>
        )}
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="search"
          type="text"
          defaultValue={searchTerm}
          placeholder="Search by ref or item name..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No inventory stock controls found.</p>
          {canCreate && (
            <Link
              href="/procurement-supply-chain/inventory-stock-controls/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first stock control
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
                  Item Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Current Stock
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  UOM
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/procurement-supply-chain/inventory-stock-controls/${rec.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rec.inventoryRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rec.itemName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rec.category || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rec.currentStock ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rec.uom || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          rec.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {rec.status}
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
            href={`/procurement-supply-chain/inventory-stock-controls?${new URLSearchParams({
              ...(searchTerm ? { search: searchTerm } : {}),
              ...(statusFilter ? { status: statusFilter } : {}),
              cursor: meta.cursor,
            }).toString()}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next Page
          </Link>
        </div>
      )}
    </div>
  );
}
