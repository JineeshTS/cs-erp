import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, isNull, lt } from "drizzle-orm";
import { Plus, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmDeadFreightRecords } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
const STATUS_COLORS: Record<string, string> = {
  calculated: "bg-blue-100 text-blue-800",
  invoiced: "bg-yellow-100 text-yellow-800",
  partially_recovered: "bg-orange-100 text-orange-800",
  recovered: "bg-green-100 text-green-800",
  waived: "bg-gray-100 text-gray-800",
};

export default async function DeadFreightRecordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { search, cursor, status } = await searchParams;

  const conditions = [
    eq(cpmDeadFreightRecords.tenantId, session.tenantId),
    isNull(cpmDeadFreightRecords.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmDeadFreightRecords.recordReference, `%${escapeIlike(search)}%`));
  }
  if (status) {
    conditions.push(eq(cpmDeadFreightRecords.status, status));
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(cpmDeadFreightRecords.createdAt, cpmDeadFreightRecords.id, parsedCursor));
    }

  const records = await db
    .select()
    .from(cpmDeadFreightRecords)
    .where(and(...conditions))
    .orderBy(desc(cpmDeadFreightRecords.createdAt), desc(cpmDeadFreightRecords.id))
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
          <h1 className="text-2xl font-semibold">Dead Freight Records</h1>
        </div>
        <Link
          href="/commercial-pricing-management/dead-freight-records/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Record
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
          <option value="calculated">Calculated</option>
          <option value="invoiced">Invoiced</option>
          <option value="partially_recovered">Partially Recovered</option>
          <option value="recovered">Recovered</option>
          <option value="waived">Waived</option>
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
              <p className="text-sm text-muted-foreground">No dead freight records found.</p>
              <Link
                href="/commercial-pricing-management/dead-freight-records/new"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Create your first record
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Voyage</th>
                    <th className="px-4 py-3 font-medium">Booked TEU</th>
                    <th className="px-4 py-3 font-medium">Actual TEU</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/commercial-pricing-management/dead-freight-records/${record.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {record.recordReference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{record.voyageReference ?? "-"}</td>
                      <td className="px-4 py-3">{record.bookedTeu}</td>
                      <td className="px-4 py-3">{record.actualTeu}</td>
                      <td className="px-4 py-3">{record.deadFreightAmount}</td>
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
                href={`/commercial-pricing-management/dead-freight-records?cursor=${encodeURIComponent(nextCursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
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
