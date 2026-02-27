import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ports,
  vessels,
  commodities,
  containerTypes,
  customers,
  tariffCodes,
  exchangeRates,
  glAccounts,
} from "@/db/schema";

// Overview: count of active records per entity type
export async function getMdmOverview(tenantId: string) {
  const counts = await Promise.all([
    db.select().from(ports).where(and(eq(ports.tenantId, tenantId), isNull(ports.deletedAt))),
    db.select().from(vessels).where(and(eq(vessels.tenantId, tenantId), isNull(vessels.deletedAt))),
    db.select().from(commodities).where(and(eq(commodities.tenantId, tenantId), isNull(commodities.deletedAt))),
    db.select().from(containerTypes).where(and(eq(containerTypes.tenantId, tenantId), isNull(containerTypes.deletedAt))),
    db.select().from(customers).where(and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt))),
    db.select().from(tariffCodes).where(and(eq(tariffCodes.tenantId, tenantId), isNull(tariffCodes.deletedAt))),
    db.select().from(exchangeRates).where(and(eq(exchangeRates.tenantId, tenantId), isNull(exchangeRates.deletedAt))),
    db.select().from(glAccounts).where(and(eq(glAccounts.tenantId, tenantId), isNull(glAccounts.deletedAt))),
  ]);

  return {
    ports: counts[0].length,
    vessels: counts[1].length,
    commodities: counts[2].length,
    containerTypes: counts[3].length,
    customers: counts[4].length,
    tariffCodes: counts[5].length,
    exchangeRates: counts[6].length,
    glAccounts: counts[7].length,
  };
}
