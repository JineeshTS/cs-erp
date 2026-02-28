import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, isNull, lt } from "drizzle-orm";
import { Plus, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmRevenueLeakages } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  detected: "bg-red-100 text-red-800",
  investigating: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-orange-100 text-orange-800",
  recovered: "bg-green-100 text-green-800",
  written_off: "bg-gray-100 text-gray-800",
};

export default async function RevenueLeakagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { search, cursor, status } = await searchParams;

  const conditions = [
    eq(cpmRevenueLeakages.tenantId, session.tenantId),
    isNull(cpmRevenueLeakages.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmRevenueLeakages.leakageReference, `%${search}%`));
  }
  if (status) {
    conditions.push(eq(cpmRevenueLeakages.status, status));
  }
  if (cursor) {
    conditions.push(lt(cpmRevenueLeakages.createdAt, new Date(cursor)));
  }

  const records = await db
    .select()
    .from(cpmRevenueLeakages)
    .where(and(...conditions))
    .orderBy(desc(cpmRevenueLeakages.createdAt))
    .limit(51);

  const hasMore = records.length > 50;
  const items = hasMore ? records.slice(0, 50) : records;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt?.toISOString()
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">Revenue Leakages</h1>
        </div>
        <Link
          href="/commercial-pricing-management/revenue-leakages/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Leakage
        </Link>
      </div>

      <form method="GET" className="flex items-center gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search by reference..."
          defaultValue={search ?? ""}
          className="h-10 w-full max-w-sm rounded-md border px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="detected">Detected</option>
          <option value="investigating">Investigating</option>
          <option value="confirmed">Confirmed</option>
          <option value="recovered">Recovered</option>
          <option value="written_off">Written Off</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}>
        <div className="rounded-lg border bg-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No revenue leakages found.</p>
              <Link
                href="/commercial-pricing-management/revenue-leakages/new"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Create your first leakage record
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Expected</th>
                    <th className="px-4 py-3 font-medium">Actual</th>
                    <th className="px-4 py-3 font-medium">Leakage</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/commercial-pricing-management/revenue-leakages/${record.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {record.leakageReference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {record.leakageType ? record.leakageType.replace(/_/g, " ") : "-"}
                      </td>
                      <td className="px-4 py-3">{record.expectedAmount}</td>
                      <td className="px-4 py-3">{record.actualAmount}</td>
                      <td className="px-4 py-3">{record.leakageAmount}</td>
                      <td className="px-4 py-3">
                        {record.status && (
                          <Badge className={STATUS_COLORS[record.status] ?? ""}>
                            {record.status.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nextCursor && (
            <div className="flex justify-center border-t p-4">
              <Link
                href={`/commercial-pricing-management/revenue-leakages?cursor=${encodeURIComponent(nextCursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
                className="text-sm text-primary hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
