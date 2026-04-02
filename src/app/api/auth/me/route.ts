import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, clearTenantRLS, setTenantRLS } from "@/lib/db";
import { users, roles, tenants } from "@/db/schema";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      token = request.cookies.get("cs_access_token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        {
          status: 401,
          headers: { "WWW-Authenticate": 'Bearer realm="cs-erp"' },
        }
      );
    }

    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
        {
          status: 401,
          headers: { "WWW-Authenticate": 'Bearer realm="cs-erp", error="invalid_token"' },
        }
      );
    }

    // Clear stale tenant context, then set correct RLS scope from JWT
    await clearTenantRLS();
    await setTenantRLS(payload.tid);

    // Fetch user data
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        emailVerified: users.emailVerified,
        totpEnabled: users.totpEnabled,
        tenantId: users.tenantId,
        roleId: users.roleId,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user || user.status === "inactive") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "User not found" } },
        { status: 401 }
      );
    }

    // Verify JWT tenant matches user's actual tenant
    if (user.tenantId !== payload.tid) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Token tenant mismatch" } },
        { status: 401 }
      );
    }

    // Get role
    let role = null;
    if (user.roleId) {
      const [r] = await db
        .select({
          name: roles.name,
          permissions: roles.permissions,
        })
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);
      if (r) role = r;
    }

    // Get tenant
    const [tenant] = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        plan: tenants.plan,
      })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    return NextResponse.json({ data: {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        emailVerified: user.emailVerified,
        totpEnabled: user.totpEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      role: role
        ? { name: role.name, permissions: role.permissions }
        : null,
      tenant: tenant
        ? { id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan }
        : null,
    } });
  } catch (error) {
    console.error("[me]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}
