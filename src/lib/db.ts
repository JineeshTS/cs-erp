import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import * as relations from "@/db/relations";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema: { ...schema, ...relations } });

/**
 * Set the PostgreSQL session variable for RLS on the current connection.
 *
 * ERP-001 FIX: Uses session-level scope (false) so the setting persists
 * across all queries on this connection for the request duration.
 * The previous transaction-local scope (true) was ineffective — the setting
 * was lost after auto-commit, causing RLS bypass on all 565 tables.
 *
 * Safety with PgBouncer: server_reset_query = 'RESET ALL' clears session
 * vars when connections return to the pool. Additionally, every authenticated
 * request overwrites the tenant_id at the start via getApiUser/getSession.
 */
export async function setTenantRLS(tenantId: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, false)`);
}

/**
 * Clear tenant context for cross-tenant operations (login, register).
 * Uses session-level scope (false) for consistency with setTenantRLS.
 */
export async function clearTenantRLS(): Promise<void> {
  await db.execute(sql`SELECT set_config('app.tenant_id', '', false)`);
}
