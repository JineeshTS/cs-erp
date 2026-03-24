import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, isNull, lt } from "drizzle-orm";
import { Plus, ArrowLeft, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmAiPricingModels } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function AiPricingModelsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { search, cursor } = await searchParams;
  const limit = 50;

  const conditions = [
    eq(cpmAiPricingModels.tenantId, session.tenantId),
    isNull(cpmAiPricingModels.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmAiPricingModels.modelName, `%${escapeIlike(search)}%`));
  }

  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(cpmAiPricingModels.createdAt, cpmAiPricingModels.id, parsedCursor));
    }

  const rows = await db
    .select()
    .from(cpmAiPricingModels)
    .where(and(...conditions))
    .orderBy(desc(cpmAiPricingModels.createdAt), desc(cpmAiPricingModels.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
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
          <h1 className="text-2xl font-semibold">AI Pricing Models</h1>
        </div>
        <Link
          href="/commercial-pricing-management/ai-pricing-models/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </div>

      <form className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            placeholder="Search by name..."
            defaultValue={search ?? ""}
            className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accuracy</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Predicted Rate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Suggested Rate</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No AI pricing models found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/commercial-pricing-management/ai-pricing-models/${item.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.modelName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.modelCode ?? "-"}</td>
                    <td className="px-4 py-3">{item.modelType ?? "-"}</td>
                    <td className="px-4 py-3">{item.accuracy != null ? `${item.accuracy}%` : "-"}</td>
                    <td className="px-4 py-3">{item.predictedRate ?? "-"}</td>
                    <td className="px-4 py-3">{item.suggestedRate ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <Link
            href={`/commercial-pricing-management/ai-pricing-models?cursor=${encodeURIComponent(nextCursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
