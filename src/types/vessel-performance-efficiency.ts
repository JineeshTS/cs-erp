import type {
  vpeSpeedConsumptions,
  vpeCiiRatings,
  vpeEexiCompliances,
  vpeNoonReports,
  vpeVoyagePerformances,
  vpeWeatherRoutings,
  vpeCarbonEmissions,
  vpeFuelBenchmarks,
} from "@/db/schema";

export type VpeSpeedConsumption = typeof vpeSpeedConsumptions.$inferSelect;
export type NewVpeSpeedConsumption = typeof vpeSpeedConsumptions.$inferInsert;

export type VpeCiiRating = typeof vpeCiiRatings.$inferSelect;
export type NewVpeCiiRating = typeof vpeCiiRatings.$inferInsert;

export type VpeEexiCompliance = typeof vpeEexiCompliances.$inferSelect;
export type NewVpeEexiCompliance = typeof vpeEexiCompliances.$inferInsert;

export type VpeNoonReport = typeof vpeNoonReports.$inferSelect;
export type NewVpeNoonReport = typeof vpeNoonReports.$inferInsert;

export type VpeVoyagePerformance = typeof vpeVoyagePerformances.$inferSelect;
export type NewVpeVoyagePerformance = typeof vpeVoyagePerformances.$inferInsert;

export type VpeWeatherRouting = typeof vpeWeatherRoutings.$inferSelect;
export type NewVpeWeatherRouting = typeof vpeWeatherRoutings.$inferInsert;

export type VpeCarbonEmission = typeof vpeCarbonEmissions.$inferSelect;
export type NewVpeCarbonEmission = typeof vpeCarbonEmissions.$inferInsert;

export type VpeFuelBenchmark = typeof vpeFuelBenchmarks.$inferSelect;
export type NewVpeFuelBenchmark = typeof vpeFuelBenchmarks.$inferInsert;
