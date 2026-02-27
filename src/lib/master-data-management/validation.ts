import { z } from "zod";

// Port schemas
export const createPortSchema = z.object({
  unLocode: z.string().min(2).max(10),
  name: z.string().min(1).max(255),
  country: z.string().length(2),
  countryName: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  portType: z.enum(["seaport", "airport", "inland_port", "dry_port"]).optional(),
  isMajorPort: z.boolean().optional(),
});

export const updatePortSchema = createPortSchema.partial();

// Terminal schemas
export const createTerminalSchema = z.object({
  portId: z.string().uuid(),
  name: z.string().min(1).max(255),
  code: z.string().max(20).optional(),
  operatorName: z.string().max(255).optional(),
  capacity: z.number().int().positive().optional(),
  terminalType: z.enum(["container", "bulk", "tanker", "multipurpose", "ro_ro"]).optional(),
});

export const updateTerminalSchema = createTerminalSchema.partial();

// Vessel schemas
export const createVesselSchema = z.object({
  imoNumber: z.string().min(5).max(10),
  name: z.string().min(1).max(255),
  callSign: z.string().max(20).optional(),
  mmsi: z.string().max(15).optional(),
  flag: z.string().length(2).optional(),
  vesselType: z.enum(["container", "bulk_carrier", "tanker", "ro_ro", "general_cargo", "other"]).optional(),
  teuCapacity: z.number().int().positive().optional(),
  dwt: z.number().positive().optional(),
  grossTonnage: z.number().positive().optional(),
  netTonnage: z.number().positive().optional(),
  loa: z.number().positive().optional(),
  beam: z.number().positive().optional(),
  draft: z.number().positive().optional(),
  builtYear: z.number().int().min(1900).max(2100).optional(),
  builder: z.string().max(255).optional(),
  ownerName: z.string().max(255).optional(),
  operatorName: z.string().max(255).optional(),
  classificationSociety: z.string().max(100).optional(),
});

export const updateVesselSchema = createVesselSchema.partial();

// Commodity schemas
export const createCommoditySchema = z.object({
  hsCode: z.string().min(2).max(12),
  description: z.string().min(1),
  shortDescription: z.string().max(255).optional(),
  category: z.string().max(100).optional(),
  chapter: z.string().max(10).optional(),
  hazardClass: z.string().max(10).optional(),
  unNumber: z.string().max(10).optional(),
  unitOfMeasure: z.string().max(20).optional(),
  requiresFumigation: z.boolean().optional(),
  requiresInspection: z.boolean().optional(),
  isRestricted: z.boolean().optional(),
  dutyRate: z.number().min(0).max(100).optional(),
});

export const updateCommoditySchema = createCommoditySchema.partial();

// Container Type schemas
export const createContainerTypeSchema = z.object({
  isoCode: z.string().min(2).max(10),
  description: z.string().min(1).max(255),
  sizeType: z.string().min(1).max(10),
  lengthFt: z.number().positive().optional(),
  widthFt: z.number().positive().optional(),
  heightFt: z.number().positive().optional(),
  tareWeightKg: z.number().positive().optional(),
  maxPayloadKg: z.number().positive().optional(),
  cubicCapacityCbm: z.number().positive().optional(),
  isReefer: z.boolean().optional(),
  isOpenTop: z.boolean().optional(),
  isFlatRack: z.boolean().optional(),
  isTank: z.boolean().optional(),
});

export const updateContainerTypeSchema = createContainerTypeSchema.partial();

// Customer schemas
export const createCustomerSchema = z.object({
  parentId: z.string().uuid().optional(),
  customerType: z.enum(["shipper", "consignee", "agent", "freight_forwarder", "carrier", "customs_broker"]),
  name: z.string().min(1).max(255),
  shortName: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  registrationNumber: z.string().max(100).optional(),
  country: z.string().length(2).optional(),
  city: z.string().max(100).optional(),
  address: z.string().optional(),
  postalCode: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(255).optional(),
  website: z.string().max(255).optional(),
  creditLimitAmount: z.number().int().min(0).optional(),
  creditLimitCurrency: z.string().length(3).optional(),
  paymentTermsDays: z.number().int().min(0).max(365).optional(),
  contacts: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Tariff Code schemas
export const createTariffCodeSchema = z.object({
  code: z.string().min(1).max(30),
  description: z.string().min(1),
  rateType: z.enum(["flat", "per_unit", "percentage", "tiered"]),
  rateAmount: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  perUnit: z.string().max(20).optional(),
  originPortId: z.string().uuid().optional(),
  destinationPortId: z.string().uuid().optional(),
  commodityId: z.string().uuid().optional(),
  containerTypeId: z.string().uuid().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

export const updateTariffCodeSchema = createTariffCodeSchema.partial();

// Exchange Rate schemas
export const createExchangeRateSchema = z.object({
  baseCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  rate: z.string(),
  inverseRate: z.string().optional(),
  source: z.string().max(50).optional(),
  effectiveDate: z.string(),
  validUntil: z.string().optional(),
});

export const updateExchangeRateSchema = createExchangeRateSchema.partial();

// GL Account schemas
export const createGlAccountSchema = z.object({
  accountCode: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parentId: z.string().uuid().optional(),
  description: z.string().optional(),
  normalBalance: z.enum(["debit", "credit"]).optional(),
});

export const updateGlAccountSchema = createGlAccountSchema.partial();

// Cost Centre schemas
export const createCostCentreSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  department: z.string().max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

export const updateCostCentreSchema = createCostCentreSchema.partial();
