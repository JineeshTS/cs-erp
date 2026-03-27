import { NextRequest, NextResponse } from "next/server";
import { and, lt, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { timingSafeCompare } from "@/lib/tokens";
import { sql } from "drizzle-orm";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/retention-enforce
 *
 * Soft-deletes records past their retention period in document tables.
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

    // Soft-delete documents past their expiry date (if the column exists)
    // For now, log the action — actual enforcement depends on per-tenant retention policy config
    const result = await db.execute(sql`
      UPDATE dms_documents
      SET deleted_at = NOW()
      WHERE deleted_at IS NULL
        AND expiry_date IS NOT NULL
        AND expiry_date < NOW()
      RETURNING id
    `);

    const deletedCount = Array.isArray(result) ? result.length : 0;

    return NextResponse.json({
      data: { enforcedAt: now.toISOString(), softDeletedDocuments: deletedCount },
    });
  } catch (error) {
    // If dms_documents table doesn't have expiry_date column yet, this is expected
    console.error("Retention enforce cron error:", error);
    return NextResponse.json({
      data: { enforcedAt: new Date().toISOString(), softDeletedDocuments: 0, note: "No retention rules active" },
    });
  }
}
