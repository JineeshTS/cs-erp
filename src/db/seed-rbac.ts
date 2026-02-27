/**
 * Seed script for RBAC permissions and default roles.
 * Run with: npx tsx src/db/seed-rbac.ts
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { permissions, rolePermissions } from "./schema/permissions";
import { roles } from "./schema/roles";

const PERMISSIONS_SEED = [
  // System
  { name: "system:manage", resource: "system", action: "manage", description: "Full system management" },
  { name: "system:audit", resource: "system", action: "audit", description: "View audit logs" },
  { name: "system:config", resource: "system", action: "config", description: "Modify system configuration" },
  // Users
  { name: "users:read", resource: "users", action: "read", description: "View users" },
  { name: "users:create", resource: "users", action: "create", description: "Create users" },
  { name: "users:edit", resource: "users", action: "edit", description: "Edit users" },
  { name: "users:delete", resource: "users", action: "delete", description: "Delete users" },
  // Roles
  { name: "roles:read", resource: "roles", action: "read", description: "View roles" },
  { name: "roles:create", resource: "roles", action: "create", description: "Create roles" },
  { name: "roles:edit", resource: "roles", action: "edit", description: "Edit roles" },
  { name: "roles:delete", resource: "roles", action: "delete", description: "Delete roles" },
  // Tenants
  { name: "tenants:read", resource: "tenants", action: "read", description: "View tenants" },
  { name: "tenants:create", resource: "tenants", action: "create", description: "Create tenants" },
  { name: "tenants:edit", resource: "tenants", action: "edit", description: "Edit tenants" },
  { name: "tenants:delete", resource: "tenants", action: "delete", description: "Delete tenants" },
  // Vessels
  { name: "vessels:read", resource: "vessels", action: "read", description: "View vessels" },
  { name: "vessels:create", resource: "vessels", action: "create", description: "Create vessels" },
  { name: "vessels:edit", resource: "vessels", action: "edit", description: "Edit vessels" },
  { name: "vessels:delete", resource: "vessels", action: "delete", description: "Delete vessels" },
  { name: "vessels:track", resource: "vessels", action: "track", description: "Track vessels" },
  // Bookings
  { name: "bookings:read", resource: "bookings", action: "read", description: "View bookings" },
  { name: "bookings:create", resource: "bookings", action: "create", description: "Create bookings" },
  { name: "bookings:edit", resource: "bookings", action: "edit", description: "Edit bookings" },
  { name: "bookings:approve", resource: "bookings", action: "approve", description: "Approve bookings" },
  { name: "bookings:cancel", resource: "bookings", action: "cancel", description: "Cancel bookings" },
  // Containers
  { name: "containers:read", resource: "containers", action: "read", description: "View containers" },
  { name: "containers:create", resource: "containers", action: "create", description: "Create containers" },
  { name: "containers:edit", resource: "containers", action: "edit", description: "Edit containers" },
  { name: "containers:track", resource: "containers", action: "track", description: "Track containers" },
  // Cargo
  { name: "cargo:read", resource: "cargo", action: "read", description: "View cargo" },
  { name: "cargo:create", resource: "cargo", action: "create", description: "Create cargo" },
  { name: "cargo:edit", resource: "cargo", action: "edit", description: "Edit cargo" },
  { name: "cargo:approve", resource: "cargo", action: "approve", description: "Approve cargo" },
  // Customs
  { name: "customs:read", resource: "customs", action: "read", description: "View customs declarations" },
  { name: "customs:submit", resource: "customs", action: "submit", description: "Submit customs declarations" },
  { name: "customs:approve", resource: "customs", action: "approve", description: "Approve customs" },
  // Finance
  { name: "finance:read", resource: "finance", action: "read", description: "View financial data" },
  { name: "finance:create", resource: "finance", action: "create", description: "Create financial records" },
  { name: "finance:approve", resource: "finance", action: "approve", description: "Approve financial records" },
  // Reports
  { name: "reports:read", resource: "reports", action: "read", description: "View reports" },
  { name: "reports:generate", resource: "reports", action: "generate", description: "Generate reports" },
  { name: "reports:export", resource: "reports", action: "export", description: "Export reports" },
  // AI
  { name: "ai:use", resource: "ai", action: "use", description: "Use AI assistant" },
  { name: "ai:manage", resource: "ai", action: "manage", description: "Manage AI settings" },
];

const ROLE_DEFINITIONS: Record<string, { description: string; permissionFilter: (p: string) => boolean }> = {
  super_admin: {
    description: "Super administrator with full system access",
    permissionFilter: () => true,
  },
  tenant_admin: {
    description: "Tenant administrator with full tenant access",
    permissionFilter: (p) => !p.startsWith("system:"),
  },
  operations_manager: {
    description: "Operations manager for shipping operations",
    permissionFilter: (p) => {
      const ops = ["vessels:", "bookings:", "containers:", "cargo:"];
      if (ops.some((o) => p.startsWith(o))) return true;
      if (p === "customs:read" || p === "customs:submit") return true;
      if (p === "finance:read") return true;
      if (p.startsWith("reports:")) return true;
      if (p === "ai:use") return true;
      return false;
    },
  },
  finance_manager: {
    description: "Finance manager for billing and payments",
    permissionFilter: (p) => {
      if (p.startsWith("finance:")) return true;
      if (p === "bookings:approve" || p === "bookings:read") return true;
      if (p.startsWith("reports:")) return true;
      if (p === "ai:use") return true;
      return false;
    },
  },
  customs_officer: {
    description: "Customs officer for declarations and compliance",
    permissionFilter: (p) => {
      if (p.startsWith("customs:")) return true;
      if (p === "cargo:read" || p === "cargo:approve") return true;
      if (p === "bookings:read") return true;
      if (p === "ai:use") return true;
      return false;
    },
  },
  dispatcher: {
    description: "Dispatcher for container and booking management",
    permissionFilter: (p) => {
      if (p.startsWith("bookings:")) return true;
      if (p.startsWith("containers:")) return true;
      if (p === "vessels:read" || p === "vessels:track") return true;
      if (p === "ai:use") return true;
      return false;
    },
  },
  viewer: {
    description: "Read-only access to all resources",
    permissionFilter: (p) => p.endsWith(":read"),
  },
};

async function main() {
  const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = postgres(url, { prepare: false });
  const db = drizzle(client);

  console.log("Seeding permissions...");

  // Upsert permissions
  for (const perm of PERMISSIONS_SEED) {
    await db
      .insert(permissions)
      .values(perm)
      .onConflictDoNothing({ target: permissions.name });
  }

  // Fetch all permissions with IDs
  const allPerms = await db.select().from(permissions);
  const permMap = new Map(allPerms.map((p) => [p.name, p.id]));

  console.log(`Seeded ${allPerms.length} permissions`);

  // Create system roles (tenantId = null)
  for (const [roleName, def] of Object.entries(ROLE_DEFINITIONS)) {
    // Check if role exists
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);

    let roleId: string;
    if (existing.length > 0 && existing[0].tenantId === null) {
      roleId = existing[0].id;
      console.log(`  Role "${roleName}" already exists (${roleId})`);
    } else if (existing.length === 0) {
      const [created] = await db
        .insert(roles)
        .values({
          name: roleName,
          description: def.description,
          isSystem: true,
          tenantId: null,
          permissions: [],
        })
        .returning({ id: roles.id });
      roleId = created.id;
      console.log(`  Created role "${roleName}" (${roleId})`);
    } else {
      continue;
    }

    // Assign permissions
    const applicablePerms = PERMISSIONS_SEED.filter((p) =>
      def.permissionFilter(p.name)
    );

    for (const perm of applicablePerms) {
      const permId = permMap.get(perm.name);
      if (!permId) continue;
      await db
        .insert(rolePermissions)
        .values({ roleId, permissionId: permId })
        .onConflictDoNothing();
    }

    console.log(
      `  Assigned ${applicablePerms.length} permissions to "${roleName}"`
    );
  }

  console.log("RBAC seed complete!");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
