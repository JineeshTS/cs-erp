import Link from "next/link";
import {
  Plus,
  Container,
  Wrench,
  Snowflake,
  LayoutGrid,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  eqyContainerFleet,
  eqyMaintenanceRepairs,
  eqyReeferContainers,
  eqyYardSlots,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function EquipmentControlYardManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const ownershipType = sp.ownershipType ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [totalFleet, underRepair, reeferActive, yardOccupied] =
    await Promise.all([
      db
        .select({ id: eqyContainerFleet.id })
        .from(eqyContainerFleet)
        .where(
          and(
            eq(eqyContainerFleet.tenantId, session.tenantId),
            isNull(eqyContainerFleet.deletedAt),
            eq(eqyContainerFleet.status, "active")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: eqyMaintenanceRepairs.id })
        .from(eqyMaintenanceRepairs)
        .where(
          and(
            eq(eqyMaintenanceRepairs.tenantId, session.tenantId),
            isNull(eqyMaintenanceRepairs.deletedAt),
            eq(eqyMaintenanceRepairs.status, "in_progress")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: eqyReeferContainers.id })
        .from(eqyReeferContainers)
        .where(
          and(
            eq(eqyReeferContainers.tenantId, session.tenantId),
            isNull(eqyReeferContainers.deletedAt),
            eq(eqyReeferContainers.status, "active")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: eqyYardSlots.id })
        .from(eqyYardSlots)
        .where(
          and(
            eq(eqyYardSlots.tenantId, session.tenantId),
            isNull(eqyYardSlots.deletedAt),
            eq(eqyYardSlots.status, "occupied")
          )
        )
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(eqyContainerFleet.tenantId, session.tenantId),
    isNull(eqyContainerFleet.deletedAt),
  ];
  if (ownershipType)
    conditions.push(eq(eqyContainerFleet.ownershipType, ownershipType));
  if (status) conditions.push(eq(eqyContainerFleet.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(eqyContainerFleet.containerNumber, `%${search}%`),
        ilike(eqyContainerFleet.currentPort, `%${search}%`),
        ilike(eqyContainerFleet.manufacturer, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(eqyContainerFleet.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(eqyContainerFleet)
    .where(and(...conditions))
    .orderBy(desc(eqyContainerFleet.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (ownershipType) p.set("ownershipType", ownershipType);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/equipment-control-yard-managem?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Equipment Control &amp; Yard Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage container fleet, yard operations, and equipment lifecycle
          </p>
        </div>
        {canCreate && (
          <Link
            href="/equipment-control-yard-managem/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Container
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Container className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Fleet</p>
              <p className="text-2xl font-bold text-gray-900">{totalFleet}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Under Repair</p>
              <p className="text-2xl font-bold text-gray-900">{underRepair}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600">
              <Snowflake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reefers Active</p>
              <p className="text-2xl font-bold text-gray-900">{reeferActive}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Yard Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {yardOccupied}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
              placeholder="Container number, port, manufacturer..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="ownershipType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Ownership
          </label>
          <select
            id="ownershipType"
            name="ownershipType"
            defaultValue={ownershipType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="owned">Owned</option>
            <option value="leased">Leased</option>
            <option value="third_party">Third Party</option>
          </select>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || ownershipType || status) && (
          <Link
            href="/equipment-control-yard-managem"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Container Fleet Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Container className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No containers found.</p>
          {canCreate && (
            <Link
              href="/equipment-control-yard-managem/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first container
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container #
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Size / Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Ownership
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Current Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Current Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/equipment-control-yard-managem/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.containerNumber}
                    </Link>
                    {c.isoTypeCode && (
                      <span className="ms-1 text-xs text-gray-400">
                        ({c.isoTypeCode})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.sizeCode} / {c.typeCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.ownershipType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.currentPort || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.currentStatus === "available"
                          ? "success"
                          : c.currentStatus === "in_use"
                            ? "default"
                            : c.currentStatus === "under_repair"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {c.currentStatus.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.status === "active"
                          ? "success"
                          : c.status === "inactive"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {c.status}
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
