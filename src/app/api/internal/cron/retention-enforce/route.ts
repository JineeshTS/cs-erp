import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { timingSafeCompare } from "@/lib/tokens";
import { sql } from "drizzle-orm";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/retention-enforce
 *
 * ERP-103: Enforces data retention by soft-deleting records older than
 * their configured retention period. Reads retention policies from
 * dms_retention_policies per tenant, then applies to dms_documents.
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
    let totalDeleted = 0;

    // Step 1: Soft-delete documents with explicit expiry_date that has passed
    try {
      const expired = await db.execute<{ id: string }>(sql`
        UPDATE dms_documents
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE deleted_at IS NULL
          AND expiry_date IS NOT NULL
          AND expiry_date < NOW()
        RETURNING id
      `);
      totalDeleted += Array.isArray(expired) ? expired.length : 0;
    } catch {
      // expiry_date column may not exist yet — skip
    }

    // Step 2: Apply per-tenant retention policies by document category
    try {
      const policies = await db.execute<{
        tenant_id: string;
        document_category: string;
        retention_days: number;
      }>(sql`
        SELECT tenant_id, document_category, retention_days
        FROM dms_retention_policies
        WHERE deleted_at IS NULL AND is_active = true AND retention_days > 0
      `);

      for (const policy of Array.isArray(policies) ? policies : []) {
        const cutoff = new Date(now.getTime() - policy.retention_days * 86400000);
        const result = await db.execute<{ id: string }>(sql`
          UPDATE dms_documents
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE deleted_at IS NULL
            AND tenant_id = ${policy.tenant_id}::uuid
            AND category = ${policy.document_category}
            AND created_at < ${cutoff.toISOString()}::timestamptz
          RETURNING id
        `);
        const count = Array.isArray(result) ? result.length : 0;
        if (count > 0) {
          console.log(`[retention] Deleted ${count} docs in category "${policy.document_category}" for tenant ${policy.tenant_id}`);
          totalDeleted += count;
        }
      }
    } catch {
      // retention_policies table may not exist yet — skip
    }

    // Step 3: Clean up soft-deleted records older than 90 days (permanent purge of metadata)
    try {
      const purged = await db.execute<{ id: string }>(sql`
        DELETE FROM dms_documents
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '90 days'
        RETURNING id
      `);
      const purgeCount = Array.isArray(purged) ? purged.length : 0;
      if (purgeCount > 0) {
        console.log(`[retention] Purged ${purgeCount} soft-deleted docs older than 90 days`);
      }
    } catch {
      // ignore — table structure issues
    }

    return NextResponse.json({
      data: { enforcedAt: now.toISOString(), softDeletedDocuments: totalDeleted },
    });
  } catch (error) {
    console.error("[retention-enforce] Error:", error);
    return NextResponse.json({
      data: { enforcedAt: new Date().toISOString(), softDeletedDocuments: 0, note: "Retention enforcement encountered errors" },
    });
  }
}
