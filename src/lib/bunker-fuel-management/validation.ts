import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Bunker Orders
// ==========================================

export const createBunkerOrderSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  supplierName: z.string().min(1).max(255),
  supplierCode: z.string().max(50).optional(),
  port: z.string().min(1).max(50),
  deliveryDate: z.coerce.date().optional(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  fuelGrade: z.string().max(30).optional(),
  quantityOrdered: z.number().int().min(1),
  quantityDelivered: z.number().int().optional(),
  unit: z.enum(["MT", "CBM", "LTR", "GAL"]).optional(),
  pricePerUnit: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  totalAmount: z.number().int().optional(),
  paymentTerms: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateBunkerOrderSchema = createBunkerOrderSchema.partial();

// ==========================================
// Bunker Stems
// ==========================================

export const createBunkerStemSchema = z.object({
  orderId: z.string().uuid().optional(),
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  port: z.string().min(1).max(50),
  berth: z.string().max(50).optional(),
  supplierName: z.string().max(255).optional(),
  bargeName: z.string().max(255).optional(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  fuelGrade: z.string().max(30).optional(),
  quantityNominated: z.number().int().min(1),
  quantityDelivered: z.number().int().optional(),
  unit: z.enum(["MT", "CBM", "LTR", "GAL"]).optional(),
  deliveryWindowStart: z.coerce.date().optional(),
  deliveryWindowEnd: z.coerce.date().optional(),
  actualDeliveryStart: z.coerce.date().optional(),
  actualDeliveryEnd: z.coerce.date().optional(),
  pumpingRate: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateBunkerStemSchema = createBunkerStemSchema.partial();

// ==========================================
// Quality Tests
// ==========================================

export const createQualityTestSchema = z.object({
  stemId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  vesselName: z.string().min(1).max(255),
  sampleDate: z.coerce.date(),
  labName: z.string().max(255).optional(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  density: z.number().int().optional(),
  viscosity: z.number().int().optional(),
  sulphurContent: z.number().int().optional(),
  flashPoint: z.number().int().optional(),
  waterContent: z.number().int().optional(),
  ashContent: z.number().int().optional(),
  calorificValue: z.number().int().optional(),
  testResults: z.record(z.string(), z.unknown()).optional(),
  isoCompliant: z.boolean().optional(),
  marpolCompliant: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateQualityTestSchema = createQualityTestSchema.partial();

// ==========================================
// Quality Claims
// ==========================================

export const createQualityClaimSchema = z.object({
  testId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  supplierName: z.string().min(1).max(255),
  vesselName: z.string().min(1).max(255),
  claimType: z.enum(["off_spec", "quantity_short", "contamination", "water_content", "viscosity", "sulphur", "other"]),
  claimDescription: z.string().min(1),
  claimAmount: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  quantityDisputed: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateQualityClaimSchema = createQualityClaimSchema.partial();

// ==========================================
// Fuel ROB Records
// ==========================================

export const createFuelRobSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  reportDate: z.coerce.date(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  robQuantity: z.number().int().min(0),
  unit: z.enum(["MT", "CBM", "LTR", "GAL"]).optional(),
  consumptionDaily: z.number().int().optional(),
  consumptionVoyage: z.number().int().optional(),
  receivedQuantity: z.number().int().optional(),
  transferredQuantity: z.number().int().optional(),
  location: z.string().max(100).optional(),
  portCode: z.string().max(20).optional(),
  reportType: z.enum(["noon", "arrival", "departure", "bunkering", "end_of_sea_passage", "end_of_voyage"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateFuelRobSchema = createFuelRobSchema.partial();

// ==========================================
// Fuel Reconciliations
// ==========================================

export const createFuelReconciliationSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  openingRob: z.number().int(),
  closingRob: z.number().int(),
  totalReceived: z.number().int().optional(),
  totalConsumed: z.number().int().optional(),
  totalTransferred: z.number().int().optional(),
  variance: z.number().int().optional(),
  variancePercent: z.number().int().optional(),
  unit: z.enum(["MT", "CBM", "LTR", "GAL"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateFuelReconciliationSchema = createFuelReconciliationSchema.partial();

// ==========================================
// Emissions Records
// ==========================================

export const createEmissionsRecordSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  reportingPeriod: z.enum(["annual", "quarterly", "voyage", "monthly"]),
  reportYear: z.number().int().min(2000).max(2100),
  co2Emissions: z.number().int().optional(),
  noxEmissions: z.number().int().optional(),
  soxEmissions: z.number().int().optional(),
  eexiValue: z.number().int().optional(),
  eexiRequired: z.number().int().optional(),
  eexiCompliant: z.boolean().optional(),
  ciiRating: z.enum(["A", "B", "C", "D", "E"]).optional(),
  ciiValue: z.number().int().optional(),
  ciiRequired: z.number().int().optional(),
  distanceTravelled: z.number().int().optional(),
  cargoCarried: z.number().int().optional(),
  fuelConsumed: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateEmissionsRecordSchema = createEmissionsRecordSchema.partial();

// ==========================================
// Sulphur Records
// ==========================================

export const createSulphurRecordSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  port: z.string().max(50).optional(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  sulphurContentActual: z.number().int(),
  sulphurLimit: z.number().int(),
  isCompliant: z.boolean(),
  ecaZone: z.string().max(50).optional(),
  scrubberEquipped: z.boolean().optional(),
  scrubberOperational: z.boolean().optional(),
  changoverDate: z.coerce.date().optional(),
  changoverPort: z.string().max(50).optional(),
  changoverFromFuel: z.string().max(30).optional(),
  changoverToFuel: z.string().max(30).optional(),
  bdn: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateSulphurRecordSchema = createSulphurRecordSchema.partial();

// ==========================================
// Cost Allocations
// ==========================================

export const createCostAllocationSchema = z.object({
  voyageRef: z.string().min(1).max(50),
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  orderId: z.string().uuid().optional(),
  fuelType: z.enum(["VLSFO", "HSFO", "LSMGO", "MGO", "MDO", "LNG", "ULSFO", "HFO", "BIOFUEL"]),
  quantityAllocated: z.number().int().min(1),
  unit: z.enum(["MT", "CBM", "LTR", "GAL"]).optional(),
  costPerUnit: z.number().int(),
  totalCost: z.number().int(),
  currency: z.string().max(3).optional(),
  allocationMethod: z.enum(["pro_rata", "direct", "distance_based", "cargo_weight", "time_based", "manual"]),
  legFrom: z.string().max(50).optional(),
  legTo: z.string().max(50).optional(),
  percentageOfVoyage: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateCostAllocationSchema = createCostAllocationSchema.partial();

// ==========================================
// Optimization Runs
// ==========================================

export const createOptimizationRunSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  optimizationType: z.enum(["procurement", "routing", "speed", "fuel_mix", "port_selection", "comprehensive"]),
  inputParameters: z.record(z.string(), z.unknown()),
  constraints: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateOptimizationRunSchema = createOptimizationRunSchema.partial();
