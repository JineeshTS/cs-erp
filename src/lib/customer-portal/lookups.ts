import { db } from "@/lib/db";
import { ports, customers, containerTypes } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";

/** Fetch active ports for a tenant as select options. */
export async function getPortOptions(tenantId: string) {
  const rows = await db
    .select({ unLocode: ports.unLocode, name: ports.name, country: ports.country })
    .from(ports)
    .where(and(eq(ports.tenantId, tenantId), eq(ports.status, "active"), isNull(ports.deletedAt)))
    .orderBy(asc(ports.name))
    .limit(50);

  return rows.map((r) => ({
    value: r.unLocode,
    label: `${r.name} (${r.unLocode})`,
  }));
}

/** Fetch active customers for a tenant as select options. */
export async function getCustomerOptions(tenantId: string) {
  const rows = await db
    .select({ id: customers.id, name: customers.name, shortName: customers.shortName })
    .from(customers)
    .where(and(eq(customers.tenantId, tenantId), eq(customers.status, "active"), isNull(customers.deletedAt)))
    .orderBy(asc(customers.name))
    .limit(50);

  return rows.map((r) => ({
    value: r.name,
    label: r.shortName ? `${r.name} (${r.shortName})` : r.name,
  }));
}

/** Fetch active container types for a tenant as select options. */
export async function getContainerTypeOptions(tenantId: string) {
  const rows = await db
    .select({ isoCode: containerTypes.isoCode, description: containerTypes.description })
    .from(containerTypes)
    .where(and(eq(containerTypes.tenantId, tenantId), eq(containerTypes.status, "active"), isNull(containerTypes.deletedAt)))
    .orderBy(asc(containerTypes.isoCode))
    .limit(50);

  return rows.map((r) => ({
    value: r.isoCode,
    label: `${r.isoCode} — ${r.description}`,
  }));
}
