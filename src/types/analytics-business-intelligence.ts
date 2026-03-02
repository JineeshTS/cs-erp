import type {
  abiExecutiveKpiDashboards,
  abiVoyageAnalytics,
  abiTradeLaneAnalytics,
  abiCustomerRevenueAnalytics,
  abiPredictiveForecasts,
  abiMarketIntelligenceReports,
  abiOperationalEfficiencies,
  abiBiReports,
} from "@/db/schema";

export type AbiExecutiveKpiDashboard = typeof abiExecutiveKpiDashboards.$inferSelect;
export type NewAbiExecutiveKpiDashboard = typeof abiExecutiveKpiDashboards.$inferInsert;

export type AbiVoyageAnalytic = typeof abiVoyageAnalytics.$inferSelect;
export type NewAbiVoyageAnalytic = typeof abiVoyageAnalytics.$inferInsert;

export type AbiTradeLaneAnalytic = typeof abiTradeLaneAnalytics.$inferSelect;
export type NewAbiTradeLaneAnalytic = typeof abiTradeLaneAnalytics.$inferInsert;

export type AbiCustomerRevenueAnalytic = typeof abiCustomerRevenueAnalytics.$inferSelect;
export type NewAbiCustomerRevenueAnalytic = typeof abiCustomerRevenueAnalytics.$inferInsert;

export type AbiPredictiveForecast = typeof abiPredictiveForecasts.$inferSelect;
export type NewAbiPredictiveForecast = typeof abiPredictiveForecasts.$inferInsert;

export type AbiMarketIntelligenceReport = typeof abiMarketIntelligenceReports.$inferSelect;
export type NewAbiMarketIntelligenceReport = typeof abiMarketIntelligenceReports.$inferInsert;

export type AbiOperationalEfficiency = typeof abiOperationalEfficiencies.$inferSelect;
export type NewAbiOperationalEfficiency = typeof abiOperationalEfficiencies.$inferInsert;

export type AbiBiReport = typeof abiBiReports.$inferSelect;
export type NewAbiBiReport = typeof abiBiReports.$inferInsert;
