import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cvmCharterParties,
  cvmVoyageEstimates,
  cvmHireStatements,
  cvmLaytimeCalculations,
  cvmVesselPerformances,
  cvmOffHireEvents,
  cvmDeliveryReports,
  cvmVoyagePnl,
  cvmCoaContracts,
  cvmTcContracts,
  cvmFixtures,
  cvmUtilizationAnalyses,
} from "@/db/schema";

export async function getCvmOverview(tenantId: string) {
  const [
    charterParties,
    voyageEstimates,
    hireStatements,
    laytimeCalculations,
    vesselPerformances,
    offHireEvents,
    deliveryReports,
    voyagePnl,
    coaContracts,
    tcContracts,
    fixtures,
    utilizationAnalyses,
  ] = await Promise.all([
    db.select({ id: cvmCharterParties.id }).from(cvmCharterParties)
      .where(and(eq(cvmCharterParties.tenantId, tenantId), isNull(cvmCharterParties.deletedAt))),
    db.select({ id: cvmVoyageEstimates.id }).from(cvmVoyageEstimates)
      .where(and(eq(cvmVoyageEstimates.tenantId, tenantId), isNull(cvmVoyageEstimates.deletedAt))),
    db.select({ id: cvmHireStatements.id }).from(cvmHireStatements)
      .where(and(eq(cvmHireStatements.tenantId, tenantId), isNull(cvmHireStatements.deletedAt))),
    db.select({ id: cvmLaytimeCalculations.id }).from(cvmLaytimeCalculations)
      .where(and(eq(cvmLaytimeCalculations.tenantId, tenantId), isNull(cvmLaytimeCalculations.deletedAt))),
    db.select({ id: cvmVesselPerformances.id }).from(cvmVesselPerformances)
      .where(and(eq(cvmVesselPerformances.tenantId, tenantId), isNull(cvmVesselPerformances.deletedAt))),
    db.select({ id: cvmOffHireEvents.id }).from(cvmOffHireEvents)
      .where(and(eq(cvmOffHireEvents.tenantId, tenantId), isNull(cvmOffHireEvents.deletedAt))),
    db.select({ id: cvmDeliveryReports.id }).from(cvmDeliveryReports)
      .where(and(eq(cvmDeliveryReports.tenantId, tenantId), isNull(cvmDeliveryReports.deletedAt))),
    db.select({ id: cvmVoyagePnl.id }).from(cvmVoyagePnl)
      .where(and(eq(cvmVoyagePnl.tenantId, tenantId), isNull(cvmVoyagePnl.deletedAt))),
    db.select({ id: cvmCoaContracts.id }).from(cvmCoaContracts)
      .where(and(eq(cvmCoaContracts.tenantId, tenantId), isNull(cvmCoaContracts.deletedAt))),
    db.select({ id: cvmTcContracts.id }).from(cvmTcContracts)
      .where(and(eq(cvmTcContracts.tenantId, tenantId), isNull(cvmTcContracts.deletedAt))),
    db.select({ id: cvmFixtures.id }).from(cvmFixtures)
      .where(and(eq(cvmFixtures.tenantId, tenantId), isNull(cvmFixtures.deletedAt))),
    db.select({ id: cvmUtilizationAnalyses.id }).from(cvmUtilizationAnalyses)
      .where(and(eq(cvmUtilizationAnalyses.tenantId, tenantId), isNull(cvmUtilizationAnalyses.deletedAt))),
  ]);

  return {
    charterParties: charterParties.length,
    voyageEstimates: voyageEstimates.length,
    hireStatements: hireStatements.length,
    laytimeCalculations: laytimeCalculations.length,
    vesselPerformances: vesselPerformances.length,
    offHireEvents: offHireEvents.length,
    deliveryReports: deliveryReports.length,
    voyagePnl: voyagePnl.length,
    coaContracts: coaContracts.length,
    tcContracts: tcContracts.length,
    fixtures: fixtures.length,
    utilizationAnalyses: utilizationAnalyses.length,
  };
}
