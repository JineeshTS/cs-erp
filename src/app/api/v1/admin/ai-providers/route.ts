import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { aiProviders } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const providers = await db
      .select()
      .from(aiProviders)
      .where(
        and(
          eq(aiProviders.tenantId, user.tenantId),
          isNull(aiProviders.deletedAt)
        )
      );

    return NextResponse.json({ data: providers, meta: { total: providers.length } });
  } catch (error) {
    console.error("GET /api/v1/admin/ai-providers error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

const createProviderSchema = z.object({
  providerName: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  apiKeyEncrypted: z.string().optional(),
  apiEndpoint: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "ai:create"))) {
      return forbiddenResponse();
    }

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createProviderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { providerName, displayName, apiKeyEncrypted, apiEndpoint, isDefault } = parsed.data;

    // If this provider should be the default, unset other defaults first
    if (isDefault) {
      await db
        .update(aiProviders)
        .set({ isDefault: false })
        .where(
          and(
            eq(aiProviders.tenantId, user.tenantId),
            eq(aiProviders.isDefault, true),
            isNull(aiProviders.deletedAt)
          )
        );
    }

    const [provider] = await db
      .insert(aiProviders)
      .values({
        tenantId: user.tenantId,
        providerName,
        displayName,
        apiKeyEncrypted: apiKeyEncrypted || null,
        apiEndpoint: apiEndpoint || null,
        isDefault: isDefault ?? false,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "ai-providers", entityId: provider?.id, module: "admin", newData: provider as Record<string, unknown>, request });

    return NextResponse.json({ data: provider }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/admin/ai-providers error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
