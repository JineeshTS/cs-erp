import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  cvmCharterParties,
  cvmVoyageEstimates,
  cvmHireStatements,
  cvmLaytimeCalculations,
  cvmVesselPerformances,
  cvmOffHireEvents,
  cvmDeliveryReports,
  cvmVoyagePnl,
  cvmCoaContracts,
  cvmTcContracts,
  cvmFixtures,
  cvmUtilizationAnalyses,
} from "@/db/schema/chartering-vessel-management";

// Charter Party
export type CharterParty = InferSelectModel<typeof cvmCharterParties>;
export type NewCharterParty = InferInsertModel<typeof cvmCharterParties>;

// Voyage Estimate
export type VoyageEstimate = InferSelectModel<typeof cvmVoyageEstimates>;
export type NewVoyageEstimate = InferInsertModel<typeof cvmVoyageEstimates>;

// Hire Statement
export type HireStatement = InferSelectModel<typeof cvmHireStatements>;
export type NewHireStatement = InferInsertModel<typeof cvmHireStatements>;

// Laytime Calculation
export type LaytimeCalculation = InferSelectModel<typeof cvmLaytimeCalculations>;
export type NewLaytimeCalculation = InferInsertModel<typeof cvmLaytimeCalculations>;

// Vessel Performance
export type VesselPerformance = InferSelectModel<typeof cvmVesselPerformances>;
export type NewVesselPerformance = InferInsertModel<typeof cvmVesselPerformances>;

// Off-Hire Event
export type OffHireEvent = InferSelectModel<typeof cvmOffHireEvents>;
export type NewOffHireEvent = InferInsertModel<typeof cvmOffHireEvents>;

// Delivery Report (TDR)
export type DeliveryReport = InferSelectModel<typeof cvmDeliveryReports>;
export type NewDeliveryReport = InferInsertModel<typeof cvmDeliveryReports>;

// Voyage P&L
export type VoyagePnl = InferSelectModel<typeof cvmVoyagePnl>;
export type NewVoyagePnl = InferInsertModel<typeof cvmVoyagePnl>;

// COA Contract
export type CoaContract = InferSelectModel<typeof cvmCoaContracts>;
export type NewCoaContract = InferInsertModel<typeof cvmCoaContracts>;

// TC Contract
export type TcContract = InferSelectModel<typeof cvmTcContracts>;
export type NewTcContract = InferInsertModel<typeof cvmTcContracts>;

// Fixture
export type Fixture = InferSelectModel<typeof cvmFixtures>;
export type NewFixture = InferInsertModel<typeof cvmFixtures>;

// Utilization Analysis
export type UtilizationAnalysis = InferSelectModel<typeof cvmUtilizationAnalyses>;
export type NewUtilizationAnalysis = InferInsertModel<typeof cvmUtilizationAnalyses>;
