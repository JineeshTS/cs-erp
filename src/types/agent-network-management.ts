import type {
  anmGaAgreements,
  anmSubAgentConfigs,
  anmAgentCommissions,
  anmAgencyDocuments,
  anmPerformanceKpis,
  anmPortalConfigs,
  anmBookingAuthorities,
  anmAgentIncentives,
} from "@/db/schema";

export type AnmGaAgreement = typeof anmGaAgreements.$inferSelect;
export type NewAnmGaAgreement = typeof anmGaAgreements.$inferInsert;

export type AnmSubAgentConfig = typeof anmSubAgentConfigs.$inferSelect;
export type NewAnmSubAgentConfig = typeof anmSubAgentConfigs.$inferInsert;

export type AnmAgentCommission = typeof anmAgentCommissions.$inferSelect;
export type NewAnmAgentCommission = typeof anmAgentCommissions.$inferInsert;

export type AnmAgencyDocument = typeof anmAgencyDocuments.$inferSelect;
export type NewAnmAgencyDocument = typeof anmAgencyDocuments.$inferInsert;

export type AnmPerformanceKpi = typeof anmPerformanceKpis.$inferSelect;
export type NewAnmPerformanceKpi = typeof anmPerformanceKpis.$inferInsert;

export type AnmPortalConfig = typeof anmPortalConfigs.$inferSelect;
export type NewAnmPortalConfig = typeof anmPortalConfigs.$inferInsert;

export type AnmBookingAuthority = typeof anmBookingAuthorities.$inferSelect;
export type NewAnmBookingAuthority = typeof anmBookingAuthorities.$inferInsert;

export type AnmAgentIncentive = typeof anmAgentIncentives.$inferSelect;
export type NewAnmAgentIncentive = typeof anmAgentIncentives.$inferInsert;
