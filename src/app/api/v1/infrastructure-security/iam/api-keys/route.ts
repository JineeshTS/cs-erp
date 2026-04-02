import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { isfApiKeys } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createApiKeySchema } from "@/lib/infrastructure-security/validation";
import crypto from "crypto";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Generate raw key and derive hash
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyPrefix = rawKey.slice(0, 8);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const [created] = await db
      .insert(isfApiKeys)
      .values({
        tenantId: user.tenantId,
        keyName: parsed.data.keyName,
        keyPrefix,
        keyHash,
        serviceAccountId: parsed.data.serviceAccountId,
        scopes: parsed.data.scopes,
        rateLimit: parsed.data.rateLimit,
        expiresAt: parsed.data.expiresAt,
        ipWhitelist: parsed.data.ipWhitelist,
        notes: parsed.data.notes,
        metadata: parsed.data.metadata,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "api-keys", entityId: created.id, module: "infrastructure-security", newData: created as Record<string, unknown>, request });

    // Return the raw key ONCE — it will not be stored
    return NextResponse.json(
      {
        data: {
          ...created,
          rawKey,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
