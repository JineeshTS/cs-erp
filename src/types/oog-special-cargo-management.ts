import type {
  oogCargoAcceptances,
  oogStowagePlans,
  oogSpecialEquipment,
  oogSecuringPlans,
  oogHeavyLifts,
  oogMultiModalLogistics,
  oogDocPermits,
  oogPortApprovals,
} from "@/db/schema";

export type OogCargoAcceptance = typeof oogCargoAcceptances.$inferSelect;
export type NewOogCargoAcceptance = typeof oogCargoAcceptances.$inferInsert;

export type OogStowagePlan = typeof oogStowagePlans.$inferSelect;
export type NewOogStowagePlan = typeof oogStowagePlans.$inferInsert;

export type OogSpecialEquipment = typeof oogSpecialEquipment.$inferSelect;
export type NewOogSpecialEquipment = typeof oogSpecialEquipment.$inferInsert;

export type OogSecuringPlan = typeof oogSecuringPlans.$inferSelect;
export type NewOogSecuringPlan = typeof oogSecuringPlans.$inferInsert;

export type OogHeavyLift = typeof oogHeavyLifts.$inferSelect;
export type NewOogHeavyLift = typeof oogHeavyLifts.$inferInsert;

export type OogMultiModalLogistic = typeof oogMultiModalLogistics.$inferSelect;
export type NewOogMultiModalLogistic = typeof oogMultiModalLogistics.$inferInsert;

export type OogDocPermit = typeof oogDocPermits.$inferSelect;
export type NewOogDocPermit = typeof oogDocPermits.$inferInsert;

export type OogPortApproval = typeof oogPortApprovals.$inferSelect;
export type NewOogPortApproval = typeof oogPortApprovals.$inferInsert;
