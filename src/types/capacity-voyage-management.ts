import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  capVesselSchedules,
  capPortRotations,
  capTradeAllocations,
  capSpaceControls,
  capTransshipmentPlans,
  capLoadingLists,
  capBayPlans,
  capStowagePlans,
  capLoadOptimizations,
  capRevenueAnalytics,
  capDemandForecasts,
  capSchedulePerformances,
} from "@/db/schema/capacity-voyage-management";

// Vessel Schedule
export type VesselSchedule = InferSelectModel<typeof capVesselSchedules>;
export type NewVesselSchedule = InferInsertModel<typeof capVesselSchedules>;

// Port Rotation
export type PortRotation = InferSelectModel<typeof capPortRotations>;
export type NewPortRotation = InferInsertModel<typeof capPortRotations>;

// Trade Allocation
export type TradeAllocation = InferSelectModel<typeof capTradeAllocations>;
export type NewTradeAllocation = InferInsertModel<typeof capTradeAllocations>;

// Space Control
export type SpaceControl = InferSelectModel<typeof capSpaceControls>;
export type NewSpaceControl = InferInsertModel<typeof capSpaceControls>;

// Transshipment Plan
export type TransshipmentPlan = InferSelectModel<typeof capTransshipmentPlans>;
export type NewTransshipmentPlan = InferInsertModel<typeof capTransshipmentPlans>;

// Loading List
export type LoadingList = InferSelectModel<typeof capLoadingLists>;
export type NewLoadingList = InferInsertModel<typeof capLoadingLists>;

// Bay Plan
export type BayPlan = InferSelectModel<typeof capBayPlans>;
export type NewBayPlan = InferInsertModel<typeof capBayPlans>;

// Stowage Plan
export type StowagePlan = InferSelectModel<typeof capStowagePlans>;
export type NewStowagePlan = InferInsertModel<typeof capStowagePlans>;

// Load Optimization
export type LoadOptimization = InferSelectModel<typeof capLoadOptimizations>;
export type NewLoadOptimization = InferInsertModel<typeof capLoadOptimizations>;

// Revenue Analytics
export type RevenueAnalytic = InferSelectModel<typeof capRevenueAnalytics>;
export type NewRevenueAnalytic = InferInsertModel<typeof capRevenueAnalytics>;

// Demand Forecast
export type DemandForecast = InferSelectModel<typeof capDemandForecasts>;
export type NewDemandForecast = InferInsertModel<typeof capDemandForecasts>;

// Schedule Performance
export type SchedulePerformance = InferSelectModel<typeof capSchedulePerformances>;
export type NewSchedulePerformance = InferInsertModel<typeof capSchedulePerformances>;
