import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ports,
  terminals,
  vessels,
  commodities,
  containerTypes,
  customers,
  tariffCodes,
  exchangeRates,
  glAccounts,
  costCentres,
} from "@/db/schema";

export async function getMdmOverview(tenantId: string) {
  const [
    portsCount,
    terminalsCount,
    vesselsCount,
    commoditiesCount,
    containerTypesCount,
    customersCount,
    tariffCodesCount,
    exchangeRatesCount,
    glAccountsCount,
    costCentresCount,
  ] = await Promise.all([
    db.select({ id: ports.id }).from(ports)
      .where(and(eq(ports.tenantId, tenantId), isNull(ports.deletedAt))),
    db.select({ id: terminals.id }).from(terminals)
      .where(and(eq(terminals.tenantId, tenantId), isNull(terminals.deletedAt))),
    db.select({ id: vessels.id }).from(vessels)
      .where(and(eq(vessels.tenantId, tenantId), isNull(vessels.deletedAt))),
    db.select({ id: commodities.id }).from(commodities)
      .where(and(eq(commodities.tenantId, tenantId), isNull(commodities.deletedAt))),
    db.select({ id: containerTypes.id }).from(containerTypes)
      .where(and(eq(containerTypes.tenantId, tenantId), isNull(containerTypes.deletedAt))),
    db.select({ id: customers.id }).from(customers)
      .where(and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt))),
    db.select({ id: tariffCodes.id }).from(tariffCodes)
      .where(and(eq(tariffCodes.tenantId, tenantId), isNull(tariffCodes.deletedAt))),
    db.select({ id: exchangeRates.id }).from(exchangeRates)
      .where(and(eq(exchangeRates.tenantId, tenantId), isNull(exchangeRates.deletedAt))),
    db.select({ id: glAccounts.id }).from(glAccounts)
      .where(and(eq(glAccounts.tenantId, tenantId), isNull(glAccounts.deletedAt))),
    db.select({ id: costCentres.id }).from(costCentres)
      .where(and(eq(costCentres.tenantId, tenantId), isNull(costCentres.deletedAt))),
  ]);

  return {
    ports: portsCount.length,
    terminals: terminalsCount.length,
    vessels: vesselsCount.length,
    commodities: commoditiesCount.length,
    containerTypes: containerTypesCount.length,
    customers: customersCount.length,
    tariffCodes: tariffCodesCount.length,
    exchangeRates: exchangeRatesCount.length,
    glAccounts: glAccountsCount.length,
    costCentres: costCentresCount.length,
  };
}
