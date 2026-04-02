import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listCargoAcceptances } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default async function CargoAcceptancesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "oog_special:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listCargoAcceptances({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildUrl(params: Record<string, string>): string {
    const p = new URLSearchParams();
    if (params.search ?? search) p.set("search", params.search ?? search);
    if (params.status ?? status) p.set("status", params.status ?? status);
    if (params.cursor) p.set("cursor", params.cursor);
    return `/oog-special-cargo-management/cargo-acceptances?${p.toString()}`;
  }

  function statusVariant(
    s: string
  ): "success" | "destructive" | "secondary" | "warning" {
    switch (s) {
      case "accepted":
      case "completed":
        return "success";
      case "rejected":
      case "cancelled":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cargo Acceptances
          </h1>
          <p className="text-sm text-gray-500">
            OOG cargo acceptance and measurement validation records
          </p>
        </div>
        {canCreate && (
          <Link
            href="/oog-special-cargo-management/cargo-acceptances/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Cargo Acceptance
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
              placeholder="Ref, customer, container..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status) && (
          <Link
            href="/oog-special-cargo-management/cargo-acceptances"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No cargo acceptances found.</p>
          {canCreate && (
            <Link
              href="/oog-special-cargo-management/cargo-acceptances/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first cargo acceptance
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
                  Customer
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Cargo Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Weight (kg)
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
                      href={`/oog-special-cargo-management/cargo-acceptances/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.acceptanceRef}
                    </Link>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">
                    {t.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.containerNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.cargoType}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.grossWeightKg}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildUrl({ cursor: meta.cursor })}
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
