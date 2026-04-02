import type {
  dgmImdgCompliance,
  dgmBookingScreenings,
  dgmSegregationRules,
  dgmPlacardRequirements,
  dgmManifests,
  dgmEmergencyProcedures,
  dgmChemicalSafetyData,
  dgmIncidentReports,
} from "@/db/schema";

export type DgmImdgCompliance = typeof dgmImdgCompliance.$inferSelect;
export type NewDgmImdgCompliance = typeof dgmImdgCompliance.$inferInsert;

export type DgmBookingScreening = typeof dgmBookingScreenings.$inferSelect;
export type NewDgmBookingScreening = typeof dgmBookingScreenings.$inferInsert;

export type DgmSegregationRule = typeof dgmSegregationRules.$inferSelect;
export type NewDgmSegregationRule = typeof dgmSegregationRules.$inferInsert;

export type DgmPlacardRequirement = typeof dgmPlacardRequirements.$inferSelect;
export type NewDgmPlacardRequirement = typeof dgmPlacardRequirements.$inferInsert;

export type DgmManifest = typeof dgmManifests.$inferSelect;
export type NewDgmManifest = typeof dgmManifests.$inferInsert;

export type DgmEmergencyProcedure = typeof dgmEmergencyProcedures.$inferSelect;
export type NewDgmEmergencyProcedure = typeof dgmEmergencyProcedures.$inferInsert;

export type DgmChemicalSafetyData = typeof dgmChemicalSafetyData.$inferSelect;
export type NewDgmChemicalSafetyData = typeof dgmChemicalSafetyData.$inferInsert;

export type DgmIncidentReport = typeof dgmIncidentReports.$inferSelect;
export type NewDgmIncidentReport = typeof dgmIncidentReports.$inferInsert;
