import type {
  serCarbonFootprints,
  serGhgReports,
  serSeaCargoCharters,
  serPoseidonAlignments,
  serDecarbRoadmaps,
  serAltFuelTrackings,
  serEsgKpis,
  serTcfdReports,
} from "@/db/schema";

export type SerCarbonFootprint = typeof serCarbonFootprints.$inferSelect;
export type NewSerCarbonFootprint = typeof serCarbonFootprints.$inferInsert;

export type SerGhgReport = typeof serGhgReports.$inferSelect;
export type NewSerGhgReport = typeof serGhgReports.$inferInsert;

export type SerSeaCargoCharter = typeof serSeaCargoCharters.$inferSelect;
export type NewSerSeaCargoCharter = typeof serSeaCargoCharters.$inferInsert;

export type SerPoseidonAlignment = typeof serPoseidonAlignments.$inferSelect;
export type NewSerPoseidonAlignment = typeof serPoseidonAlignments.$inferInsert;

export type SerDecarbRoadmap = typeof serDecarbRoadmaps.$inferSelect;
export type NewSerDecarbRoadmap = typeof serDecarbRoadmaps.$inferInsert;

export type SerAltFuelTracking = typeof serAltFuelTrackings.$inferSelect;
export type NewSerAltFuelTracking = typeof serAltFuelTrackings.$inferInsert;

export type SerEsgKpi = typeof serEsgKpis.$inferSelect;
export type NewSerEsgKpi = typeof serEsgKpis.$inferInsert;

export type SerTcfdReport = typeof serTcfdReports.$inferSelect;
export type NewSerTcfdReport = typeof serTcfdReports.$inferInsert;
