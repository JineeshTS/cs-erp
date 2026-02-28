import { z } from "zod";

// Charter Party schemas
export const createCharterPartySchema = z.object({
  cpReference: z.string().min(1).max(50),
  charterType: z.enum(["voyage_charter", "time_charter", "bareboat", "coa"]).optional(),
  vesselName: z.string().max(255).optional(),
  vesselImo: z.string().max(10).optional(),
  chartererName: z.string().min(1).max(255),
  ownerName: z.string().max(255).optional(),
  brokerName: z.string().max(255).optional(),
  hireRate: z.number().int().min(0).optional(),
  hireCurrency: z.string().length(3).optional(),
  hirePeriodUnit: z.enum(["day", "month"]).optional(),
  deliveryPort: z.string().max(255).optional(),
  redeliveryPort: z.string().max(255).optional(),
  laycanFrom: z.string().datetime().optional(),
  laycanTo: z.string().datetime().optional(),
  commencedAt: z.string().datetime().optional(),
  terminatedAt: z.string().datetime().optional(),
  durationDays: z.number().int().positive().optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  cpTerms: z.string().optional(),
  notes: z.string().optional(),
});
export const updateCharterPartySchema = createCharterPartySchema.partial();

// Voyage Estimate schemas
export const createVoyageEstimateSchema = z.object({
  charterPartyId: z.string().uuid().optional(),
  voyageNumber: z.string().min(1).max(30),
  vesselName: z.string().max(255).optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  cargoType: z.string().max(100).optional(),
  cargoQuantity: z.number().int().min(0).optional(),
  cargoUnit: z.string().max(20).optional(),
  estimatedRevenue: z.number().int().optional(),
  bunkerCost: z.number().int().min(0).optional(),
  portCost: z.number().int().min(0).optional(),
  canalCost: z.number().int().min(0).optional(),
  otherCosts: z.number().int().min(0).optional(),
  totalCost: z.number().int().min(0).optional(),
  netResult: z.number().int().optional(),
  currency: z.string().length(3).optional(),
  voyageDays: z.number().int().positive().optional(),
  seaDays: z.number().int().min(0).optional(),
  portDays: z.number().int().min(0).optional(),
  distanceNm: z.number().min(0).optional(),
  notes: z.string().optional(),
});
export const updateVoyageEstimateSchema = createVoyageEstimateSchema.partial();

// Hire Statement schemas
export const createHireStatementSchema = z.object({
  charterPartyId: z.string().uuid(),
  statementNumber: z.string().min(1).max(30),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
  hireDays: z.number().min(0),
  hireRate: z.number().int().min(0),
  grossHire: z.number().int().min(0),
  offHireDeductions: z.number().int().min(0).optional(),
  bunkerAdjustments: z.number().int().optional(),
  otherDeductions: z.number().int().min(0).optional(),
  netHire: z.number().int(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
});
export const updateHireStatementSchema = createHireStatementSchema.partial();

// Laytime Calculation schemas
export const createLaytimeCalculationSchema = z.object({
  charterPartyId: z.string().uuid().optional(),
  voyageEstimateId: z.string().uuid().optional(),
  portName: z.string().min(1).max(255),
  operationType: z.enum(["loading", "discharging"]).optional(),
  allowedHours: z.number().min(0),
  usedHours: z.number().min(0),
  excessHours: z.number().optional(),
  demurrageRate: z.number().int().min(0).optional(),
  despatchRate: z.number().int().min(0).optional(),
  demurrageAmount: z.number().int().min(0).optional(),
  despatchAmount: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  commencedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});
export const updateLaytimeCalculationSchema = createLaytimeCalculationSchema.partial();

// Vessel Performance schemas
export const createVesselPerformanceSchema = z.object({
  voyageEstimateId: z.string().uuid().optional(),
  vesselName: z.string().min(1).max(255),
  reportDate: z.string().datetime(),
  reportType: z.enum(["noon", "arrival", "departure", "event"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  speedKnots: z.number().min(0).optional(),
  consumptionMt: z.number().min(0).optional(),
  fuelType: z.string().max(30).optional(),
  windForce: z.number().int().min(0).max(12).optional(),
  seaState: z.number().int().min(0).max(9).optional(),
  weatherConditions: z.string().max(100).optional(),
  distanceNm: z.number().min(0).optional(),
  slipPercent: z.number().min(-50).max(50).optional(),
  remarks: z.string().optional(),
});
export const updateVesselPerformanceSchema = createVesselPerformanceSchema.partial();

// Off-Hire Event schemas
export const createOffHireEventSchema = z.object({
  charterPartyId: z.string().uuid(),
  vesselName: z.string().max(255).optional(),
  eventType: z.enum(["breakdown", "drydock", "deviation", "strike", "other"]).optional(),
  reason: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  offHireDays: z.number().min(0).optional(),
  hireRate: z.number().int().min(0).optional(),
  offHireAmount: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  claimStatus: z.enum(["pending", "submitted", "agreed", "disputed", "settled"]).optional(),
  claimReference: z.string().max(50).optional(),
  notes: z.string().optional(),
});
export const updateOffHireEventSchema = createOffHireEventSchema.partial();

// Delivery Report (TDR) schemas
export const createDeliveryReportSchema = z.object({
  charterPartyId: z.string().uuid(),
  vesselName: z.string().max(255).optional(),
  reportType: z.enum(["delivery", "redelivery"]).optional(),
  portName: z.string().max(255).optional(),
  reportDate: z.string().datetime(),
  bunkerRob: z.record(z.string(), z.unknown()).optional(),
  vesselCondition: z.string().optional(),
  surveyReference: z.string().max(100).optional(),
  remarks: z.string().optional(),
});
export const updateDeliveryReportSchema = createDeliveryReportSchema.partial();

// Voyage P&L schemas
export const createVoyagePnlSchema = z.object({
  voyageEstimateId: z.string().uuid().optional(),
  voyageNumber: z.string().min(1).max(30),
  vesselName: z.string().max(255).optional(),
  revenue: z.number().int(),
  hireCost: z.number().int().optional(),
  bunkerCost: z.number().int().optional(),
  portCost: z.number().int().optional(),
  canalCost: z.number().int().optional(),
  agencyCost: z.number().int().optional(),
  insuranceCost: z.number().int().optional(),
  otherCosts: z.number().int().optional(),
  totalCosts: z.number().int().optional(),
  netResult: z.number().int().optional(),
  tceRate: z.number().int().optional(),
  currency: z.string().length(3).optional(),
  periodFrom: z.string().datetime().optional(),
  periodTo: z.string().datetime().optional(),
  notes: z.string().optional(),
});
export const updateVoyagePnlSchema = createVoyagePnlSchema.partial();

// COA Contract schemas
export const createCoaContractSchema = z.object({
  contractReference: z.string().min(1).max(50),
  chartererName: z.string().min(1).max(255),
  cargoType: z.string().min(1).max(100),
  cargoDescription: z.string().optional(),
  quantityMin: z.number().int().min(0).optional(),
  quantityMax: z.number().int().min(0).optional(),
  quantityUnit: z.enum(["MT", "TEU"]).optional(),
  liftingsPerPeriod: z.number().int().positive().optional(),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
  rate: z.number().int().min(0),
  rateBasis: z.enum(["per_mt", "per_teu", "lumpsum"]).optional(),
  currency: z.string().length(3).optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  notes: z.string().optional(),
});
export const updateCoaContractSchema = createCoaContractSchema.partial();

// TC Contract schemas
export const createTcContractSchema = z.object({
  direction: z.enum(["tc_in", "tc_out"]),
  contractReference: z.string().min(1).max(50),
  vesselName: z.string().max(255).optional(),
  counterpartyName: z.string().min(1).max(255),
  brokerName: z.string().max(255).optional(),
  hireRate: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  hirePeriodUnit: z.enum(["day", "month"]).optional(),
  deliveryPort: z.string().max(255).optional(),
  redeliveryPort: z.string().max(255).optional(),
  deliveryDate: z.string().datetime().optional(),
  redeliveryDate: z.string().datetime().optional(),
  minDuration: z.number().int().positive().optional(),
  maxDuration: z.number().int().positive().optional(),
  durationUnit: z.enum(["days", "months"]).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});
export const updateTcContractSchema = createTcContractSchema.partial();

// Fixture schemas
export const createFixtureSchema = z.object({
  fixtureReference: z.string().min(1).max(50),
  vesselName: z.string().max(255).optional(),
  fixtureType: z.enum(["voyage", "time_charter", "bareboat", "coa"]).optional(),
  counterpartyName: z.string().min(1).max(255),
  brokerName: z.string().max(255).optional(),
  cargoType: z.string().max(100).optional(),
  cargoQuantity: z.number().int().min(0).optional(),
  laycanFrom: z.string().datetime().optional(),
  laycanTo: z.string().datetime().optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  freightRate: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  status: z.enum(["open", "negotiating", "fixed", "subjects", "failed", "withdrawn"]).optional(),
  subjectDetails: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});
export const updateFixtureSchema = createFixtureSchema.partial();

// Utilization Analysis schemas
export const createUtilizationAnalysisSchema = z.object({
  vesselName: z.string().min(1).max(255),
  analysisDate: z.string().datetime(),
  periodFrom: z.string().datetime().optional(),
  periodTo: z.string().datetime().optional(),
  currentUtilizationPercent: z.number().min(0).max(100).optional(),
  projectedUtilizationPercent: z.number().min(0).max(100).optional(),
  recommendedAction: z.string().optional(),
  recommendedRoute: z.string().max(255).optional(),
  projectedRevenueImpact: z.number().int().optional(),
  currency: z.string().length(3).optional(),
  aiModel: z.string().max(100).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
});
export const updateUtilizationAnalysisSchema = createUtilizationAnalysisSchema.partial();
