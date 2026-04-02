import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and, isNull, ilike, lt, desc } from "drizzle-orm";
import { Plus, ArrowLeft, ArrowRight, Search, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmSurcharges } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
const PAGE_SIZE = 50;

export default async function SurchargesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const cursor = sp.cursor ?? "";

  const conditions = [
    eq(cpmSurcharges.tenantId, session.tenantId),
    isNull(cpmSurcharges.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmSurcharges.surchargeName, `%${escapeIlike(search)}%`));
  }

  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(cpmSurcharges.createdAt, cpmSurcharges.id, parsedCursor));
    }

  const rows = await db
    .select()
    .from(cpmSurcharges)
    .where(and(...conditions))
    .orderBy(desc(cpmSurcharges.createdAt), desc(cpmSurcharges.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Surcharges</h1>
        </div>
        <Link
          href="/commercial-pricing-management/surcharges/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Surcharge
        </Link>
      </div>

      <form method="GET" className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by surcharge name..."
            className="w-full rounded-md border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Search
        </button>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-16">
          <FileText className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No surcharges found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try adjusting your search criteria."
              : "Get started by creating a new surcharge."}
          </p>
          {!search && (
            <Link
              href="/commercial-pricing-management/surcharges/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Surcharge
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Basis</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/commercial-pricing-management/surcharges/${item.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.surchargeCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.surchargeName}</td>
                  <td className="px-4 py-3 capitalize">
                    {item.surchargeType?.replace(/_/g, " ") ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {item.calculationBasis?.replace(/_/g, " ") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.amount != null
                      ? Number(item.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : item.percentage != null
                        ? `${Number(item.percentage).toFixed(2)}%`
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.isMandatory ? (
                      <Badge className="bg-blue-100 text-blue-700">Yes</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">No</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {items.length} record{items.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          {cursor && (
            <Link
              href={`/commercial-pricing-management/surcharges${search ? `?search=${encodeURIComponent(search)}` : ""}`}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              First Page
            </Link>
          )}
          {nextCursor && (
            <Link
              href={`/commercial-pricing-management/surcharges?cursor=${encodeURIComponent(nextCursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
