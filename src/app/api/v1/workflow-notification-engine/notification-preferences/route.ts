import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneNotificationPreferences } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateNotificationPreferenceSchema } from "@/lib/workflow-notification-engine/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:read"))) return forbiddenResponse();

    const results = await db
      .select()
      .from(wneNotificationPreferences)
      .where(
        and(
          eq(wneNotificationPreferences.tenantId, user.tenantId),
          eq(wneNotificationPreferences.userId, user.id),
          isNull(wneNotificationPreferences.deletedAt)
        )
      )
      .orderBy(desc(wneNotificationPreferences.createdAt));

    return NextResponse.json({ data: results });
  } catch (err) {
    console.error("Notification preferences list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch notification preferences" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = updateNotificationPreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    // Upsert: try to find existing preference for this user/channel/eventType
    const [existing] = await db
      .select()
      .from(wneNotificationPreferences)
      .where(
        and(
          eq(wneNotificationPreferences.tenantId, user.tenantId),
          eq(wneNotificationPreferences.userId, user.id),
          eq(wneNotificationPreferences.channel, parsed.data.channel),
          eq(wneNotificationPreferences.eventType, parsed.data.eventType),
          isNull(wneNotificationPreferences.deletedAt)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing preference
      const [updated] = await db
        .update(wneNotificationPreferences)
        .set({ isEnabled: parsed.data.isEnabled })
        .where(eq(wneNotificationPreferences.id, existing.id))
        .returning();

      return NextResponse.json({ data: updated });
    }

    // Create new preference
    const [created] = await db
      .insert(wneNotificationPreferences)
      .values({
        tenantId: user.tenantId,
        userId: user.id,
        ...parsed.data,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Notification preference upsert error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to save notification preference" } },
      { status: 500 }
    );
  }
}
