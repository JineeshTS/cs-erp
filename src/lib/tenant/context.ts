import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Get the current tenant ID from request headers (set by middleware).
 * For use in Server Components and Route Handlers.
 */
export async function getCurrentTenantId(): Promise<string> {
  const hdrs = await headers();
  const tenantId = hdrs.get("x-tenant-id");
  if (!tenantId) throw new Error("No tenant context");
  return tenantId;
}

/**
 * Set the PostgreSQL session variable for RLS.
 * Call this at the start of any DB operation that needs tenant scoping.
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, false)`);
}

/**
 * Run a function with tenant context set on the DB connection.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  await setTenantContext(tenantId);
  return fn();
}
