import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

/**
 * Set the PostgreSQL session variable for RLS on the current connection.
 * Uses set_config('app.tenant_id', ..., false) for session-level scope.
 *
 * Call this at the start of any API route handler after extracting tenantId.
 */
/**
 * Set the PostgreSQL variable for RLS — CSERP-006: uses transaction-local scope (true)
 * to prevent cross-tenant leakage with PgBouncer connection pooling.
 */
export async function setTenantRLS(tenantId: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
}

/**
 * Clear tenant context — CSERP-006: transaction-local scope (true).
 */
export async function clearTenantRLS(): Promise<void> {
  await db.execute(sql`SELECT set_config('app.tenant_id', '', true)`);
}
