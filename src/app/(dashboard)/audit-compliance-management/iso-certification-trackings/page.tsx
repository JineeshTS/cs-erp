import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listIsoCertificationTrackings } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "expired") return "destructive" as const;
  if (status === "suspended") return "warning" as const;
  return "secondary" as const;
}

export default async function IsoCertificationTrackingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "audit:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listIsoCertificationTrackings({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/audit-compliance-management/iso-certification-trackings?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/audit-compliance-management"
              className="hover:text-gray-700"
            >
              Audit &amp; Compliance
            </Link>
            <span>/</span>
            <span className="text-gray-900">ISO Certification Trackings</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            ISO Certification Trackings
          </h1>
          <p className="text-sm text-gray-500">
            Track and manage ISO certifications and surveillance schedules
          </p>
        </div>
        {canCreate && (
          <Link
            href="/audit-compliance-management/iso-certification-trackings/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New ISO Certification
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
              placeholder="Certification ref, standard..."
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
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
            href="/audit-compliance-management/iso-certification-trackings"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            No ISO certification trackings found.
          </p>
          {canCreate && (
            <Link
              href="/audit-compliance-management/iso-certification-trackings/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first ISO certification tracking
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Certification Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Standard
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Certification Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Certifying Body
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Expiry Date
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
                      href={`/audit-compliance-management/iso-certification-trackings/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.certificationRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.standard || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.certificationType || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.certifyingBody || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.expiryDate
                      ? new Date(t.expiryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(t.status)}>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(meta.cursor)}
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
