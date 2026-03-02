import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { icdDryPorts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createDryPortSchema } from "@/lib/intermodal-icd-operations/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [
      eq(icdDryPorts.tenantId, user.tenantId),
      isNull(icdDryPorts.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(icdDryPorts.portRef, `%${search}%`),
          ilike(icdDryPorts.portName, `%${search}%`),
          ilike(icdDryPorts.portCode, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(icdDryPorts.status, status));
    }

    if (cursor) {
      conditions.push(gt(icdDryPorts.createdAt, new Date(cursor)));
    }

    const results = await db
      .select()
      .from(icdDryPorts)
      .where(and(...conditions))
      .orderBy(desc(icdDryPorts.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Failed to list dry ports:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createDryPortSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const portRef = `IDP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db
      .insert(icdDryPorts)
      .values({
        ...parsed.data,
        portRef,
        tenantId: user.tenantId,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create dry port:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
