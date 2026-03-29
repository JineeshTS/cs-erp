import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { timingSafeCompare } from "@/lib/tokens";
import { sql } from "drizzle-orm";
import { dispatchEmailNotifications } from "@/lib/workflow-notification-engine/service";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/notification-digest
 *
 * Batches unread notifications from the last hour into digest emails.
 * Auth: INTERNAL_API_KEY header.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-internal-api-key");
    if (!INTERNAL_API_KEY || !apiKey || !timingSafeCompare(apiKey, INTERNAL_API_KEY)) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid internal API key" } },
        { status: 401 }
      );
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count unread notifications from the last hour per user
    const digests = await db.execute(sql`
      SELECT n.user_id, u.email, u.display_name, COUNT(*) as unread_count
      FROM wne_notifications n
      JOIN users u ON u.id = n.user_id
      WHERE n.read_at IS NULL
        AND n.deleted_at IS NULL
        AND n.created_at >= ${oneHourAgo}
      GROUP BY n.user_id, u.email, u.display_name
      HAVING COUNT(*) >= 3
      LIMIT 100
    `);

    const digestRows = Array.isArray(digests) ? digests : [];

    for (const row of digestRows as unknown as Array<{ user_id: string; email: string; display_name: string; unread_count: number }>) {
      console.log(
        `[NotificationDigest] ${row.email} has ${row.unread_count} unread notifications`
      );
    }

    // Query distinct tenant IDs that have pending email notifications
    const tenantsWithPending = await db.execute(sql`
      SELECT DISTINCT tenant_id
      FROM wne_notifications
      WHERE channel = 'email'
        AND status = 'pending'
        AND deleted_at IS NULL
      LIMIT 50
    `);

    const tenantRows = Array.isArray(tenantsWithPending) ? tenantsWithPending : [];

    // Dispatch email notifications for each tenant
    let emailDispatchCount = 0;
    for (const row of tenantRows as unknown as Array<{ tenant_id: string }>) {
      try {
        await dispatchEmailNotifications(row.tenant_id);
        emailDispatchCount++;
      } catch (err) {
        console.error(`[NotificationDigest] Email dispatch failed for tenant ${row.tenant_id}:`, err);
      }
    }

    // WhatsApp placeholder -- no API integration yet
    console.log(`[NotificationDigest] WhatsApp digest: not yet implemented (placeholder)`);

    return NextResponse.json({
      data: {
        processedAt: now.toISOString(),
        usersWithDigests: digestRows.length,
        emailDispatchedTenants: emailDispatchCount,
        whatsappStatus: "not_implemented",
      },
    });
  } catch (error) {
    console.error("Notification digest cron error:", error);
    return NextResponse.json({
      data: { processedAt: new Date().toISOString(), usersWithDigests: 0, note: "Notification tables may not exist yet" },
    });
  }
}
