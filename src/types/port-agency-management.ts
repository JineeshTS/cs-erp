import type {
  pamPortCallPlans,
  pamHusbandryServices,
  pamPreArrivalChecklists,
  pamPortAuthorityCommunications,
  pamCrewChangeCoordinations,
  pamCashToMasters,
  pamVesselClearances,
  pamDisbursementAccounts,
} from "@/db/schema";

export type PamPortCallPlan = typeof pamPortCallPlans.$inferSelect;
export type NewPamPortCallPlan = typeof pamPortCallPlans.$inferInsert;

export type PamHusbandryService = typeof pamHusbandryServices.$inferSelect;
export type NewPamHusbandryService = typeof pamHusbandryServices.$inferInsert;

export type PamPreArrivalChecklist = typeof pamPreArrivalChecklists.$inferSelect;
export type NewPamPreArrivalChecklist = typeof pamPreArrivalChecklists.$inferInsert;

export type PamPortAuthorityCommunication = typeof pamPortAuthorityCommunications.$inferSelect;
export type NewPamPortAuthorityCommunication = typeof pamPortAuthorityCommunications.$inferInsert;

export type PamCrewChangeCoordination = typeof pamCrewChangeCoordinations.$inferSelect;
export type NewPamCrewChangeCoordination = typeof pamCrewChangeCoordinations.$inferInsert;

export type PamCashToMaster = typeof pamCashToMasters.$inferSelect;
export type NewPamCashToMaster = typeof pamCashToMasters.$inferInsert;

export type PamVesselClearance = typeof pamVesselClearances.$inferSelect;
export type NewPamVesselClearance = typeof pamVesselClearances.$inferInsert;

export type PamDisbursementAccount = typeof pamDisbursementAccounts.$inferSelect;
export type NewPamDisbursementAccount = typeof pamDisbursementAccounts.$inferInsert;
