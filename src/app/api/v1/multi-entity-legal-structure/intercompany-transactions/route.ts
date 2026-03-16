import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsIntercompanyTransactions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createIntercompanyTransactionSchema } from "@/lib/multi-entity-legal-structure/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const sourceEntityId = url.searchParams.get("sourceEntityId");
    const targetEntityId = url.searchParams.get("targetEntityId");
    const status = url.searchParams.get("status");
    const transactionType = url.searchParams.get("transactionType");

    const conditions = [eq(melsIntercompanyTransactions.tenantId, user.tenantId), isNull(melsIntercompanyTransactions.deletedAt)];
    if (search) conditions.push(ilike(melsIntercompanyTransactions.transactionNumber, `%${search}%`));
    if (sourceEntityId) conditions.push(eq(melsIntercompanyTransactions.sourceEntityId, sourceEntityId));
    if (targetEntityId) conditions.push(eq(melsIntercompanyTransactions.targetEntityId, targetEntityId));
    if (status) conditions.push(eq(melsIntercompanyTransactions.status, status));
    if (transactionType) conditions.push(eq(melsIntercompanyTransactions.transactionType, transactionType));
    if (cursor) conditions.push(lt(melsIntercompanyTransactions.createdAt, new Date(cursor)));

    const results = await db.select().from(melsIntercompanyTransactions).where(and(...conditions))
      .orderBy(desc(melsIntercompanyTransactions.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list intercompany transactions:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createIntercompanyTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(melsIntercompanyTransactions).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "intercompany-transactions", entityId: created?.id, module: "multi-entity-legal-structure", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create intercompany transaction:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
