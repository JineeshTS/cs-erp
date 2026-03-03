import type {
  clmLeaseAgreements,
  clmOnhireOffhires,
  clmMnrDamageBillings,
  clmLeaseCostAllocations,
  clmLessorReconciliations,
  clmContainerRedeliveries,
  clmLeaseVsBuyAnalyses,
  clmFleetOptimizers,
} from "@/db/schema";

export type ClmLeaseAgreement = typeof clmLeaseAgreements.$inferSelect;
export type NewClmLeaseAgreement = typeof clmLeaseAgreements.$inferInsert;

export type ClmOnhireOffhire = typeof clmOnhireOffhires.$inferSelect;
export type NewClmOnhireOffhire = typeof clmOnhireOffhires.$inferInsert;

export type ClmMnrDamageBilling = typeof clmMnrDamageBillings.$inferSelect;
export type NewClmMnrDamageBilling = typeof clmMnrDamageBillings.$inferInsert;

export type ClmLeaseCostAllocation = typeof clmLeaseCostAllocations.$inferSelect;
export type NewClmLeaseCostAllocation = typeof clmLeaseCostAllocations.$inferInsert;

export type ClmLessorReconciliation = typeof clmLessorReconciliations.$inferSelect;
export type NewClmLessorReconciliation = typeof clmLessorReconciliations.$inferInsert;

export type ClmContainerRedelivery = typeof clmContainerRedeliveries.$inferSelect;
export type NewClmContainerRedelivery = typeof clmContainerRedeliveries.$inferInsert;

export type ClmLeaseVsBuyAnalysis = typeof clmLeaseVsBuyAnalyses.$inferSelect;
export type NewClmLeaseVsBuyAnalysis = typeof clmLeaseVsBuyAnalyses.$inferInsert;

export type ClmFleetOptimizer = typeof clmFleetOptimizers.$inferSelect;
export type NewClmFleetOptimizer = typeof clmFleetOptimizers.$inferInsert;
