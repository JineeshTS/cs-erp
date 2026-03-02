import type {
  ltrServiceLoops,
  ltrPortPairTradeLanes,
  ltrTradeLanePnl,
  ltrSlotAgreements,
  ltrAllianceAgreements,
  ltrPortStayAnalyses,
  ltrRouteOptimizations,
  ltrMarketIntelligence,
} from "@/db/schema";

export type LtrServiceLoop = typeof ltrServiceLoops.$inferSelect;
export type NewLtrServiceLoop = typeof ltrServiceLoops.$inferInsert;

export type LtrPortPairTradeLane = typeof ltrPortPairTradeLanes.$inferSelect;
export type NewLtrPortPairTradeLane = typeof ltrPortPairTradeLanes.$inferInsert;

export type LtrTradeLanePnl = typeof ltrTradeLanePnl.$inferSelect;
export type NewLtrTradeLanePnl = typeof ltrTradeLanePnl.$inferInsert;

export type LtrSlotAgreement = typeof ltrSlotAgreements.$inferSelect;
export type NewLtrSlotAgreement = typeof ltrSlotAgreements.$inferInsert;

export type LtrAllianceAgreement = typeof ltrAllianceAgreements.$inferSelect;
export type NewLtrAllianceAgreement = typeof ltrAllianceAgreements.$inferInsert;

export type LtrPortStayAnalysis = typeof ltrPortStayAnalyses.$inferSelect;
export type NewLtrPortStayAnalysis = typeof ltrPortStayAnalyses.$inferInsert;

export type LtrRouteOptimization = typeof ltrRouteOptimizations.$inferSelect;
export type NewLtrRouteOptimization = typeof ltrRouteOptimizations.$inferInsert;

export type LtrMarketIntelligence = typeof ltrMarketIntelligence.$inferSelect;
export type NewLtrMarketIntelligence = typeof ltrMarketIntelligence.$inferInsert;
