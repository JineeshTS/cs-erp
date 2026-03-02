import { z } from "zod/v4";

// ==========================================
// ICD & Dry Port Management
// ==========================================

export const createDryPortSchema = z.object({
  portName: z.string().min(1).max(255),
  portCode: z.string().max(20).optional(),
  portType: z.enum(["icd", "dry_port", "cfs", "depot"]),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  operatorName: z.string().max(255).optional(),
  operatorCode: z.string().max(50).optional(),
  customsZoneType: z.enum(["free_zone", "bonded", "general"]).optional(),
  storageCapacityTeu: z.number().int().optional(),
  currentOccupancyTeu: z.number().int().optional(),
  railConnected: z.boolean().optional(),
  gateHoursStart: z.string().max(10).optional(),
  gateHoursEnd: z.string().max(10).optional(),
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDryPortSchema = createDryPortSchema.partial();

// ==========================================
// Rail Wagon & Train Planning
// ==========================================

export const createRailPlanSchema = z.object({
  trainNumber: z.string().max(50).optional(),
  trainOperator: z.string().max(255).optional(),
  originIcd: z.string().min(1).max(255),
  destinationIcd: z.string().min(1).max(255),
  routeDescription: z.string().optional(),
  wagonCount: z.number().int().optional(),
  wagonType: z.enum(["flat", "container", "mixed"]).optional(),
  totalCapacityTeu: z.number().int().optional(),
  bookedTeu: z.number().int().optional(),
  scheduledDepartureAt: z.coerce.date().optional(),
  scheduledArrivalAt: z.coerce.date().optional(),
  actualDepartureAt: z.coerce.date().optional(),
  actualArrivalAt: z.coerce.date().optional(),
  transitTimeDays: z.number().int().optional(),
  railwayCompany: z.string().max(255).optional(),
  bookingCutoffAt: z.coerce.date().optional(),
  estimatedCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRailPlanSchema = createRailPlanSchema.partial();

// ==========================================
// Truck Booking & Transport Management
// ==========================================

export const createTruckBookingSchema = z.object({
  transporterName: z.string().min(1).max(255),
  transporterCode: z.string().max(50).optional(),
  driverName: z.string().max(255).optional(),
  driverLicense: z.string().max(50).optional(),
  driverPhone: z.string().max(50).optional(),
  truckPlateNumber: z.string().max(30).optional(),
  trailerPlateNumber: z.string().max(30).optional(),
  truckType: z.enum(["flatbed", "container_chassis", "lowbed", "side_loader"]).optional(),
  containerNumber: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  cargoDescription: z.string().optional(),
  grossWeightKg: z.string().optional(),
  pickupLocation: z.string().min(1).max(255),
  deliveryLocation: z.string().min(1).max(255),
  scheduledPickupAt: z.coerce.date().optional(),
  scheduledDeliveryAt: z.coerce.date().optional(),
  actualPickupAt: z.coerce.date().optional(),
  actualDeliveryAt: z.coerce.date().optional(),
  gpsTrackingId: z.string().max(100).optional(),
  distanceKm: z.string().optional(),
  transportCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  podSignedByName: z.string().max(255).optional(),
  podSignedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTruckBookingSchema = createTruckBookingSchema.partial();

// ==========================================
// Customs Bonded Warehouse Operations
// ==========================================

export const createBondedWarehouseSchema = z.object({
  warehouseName: z.string().min(1).max(255),
  warehouseCode: z.string().max(30).optional(),
  warehouseType: z.enum(["bonded", "free_zone", "general", "temperature_controlled"]),
  customsLicenseNumber: z.string().max(100).optional(),
  customsLicenseExpiry: z.coerce.date().optional(),
  location: z.string().max(255).optional(),
  totalAreaSqm: z.string().optional(),
  usableAreaSqm: z.string().optional(),
  storageCapacityTeu: z.number().int().optional(),
  currentOccupancyTeu: z.number().int().optional(),
  temperatureControlled: z.boolean().optional(),
  tempRangeMin: z.string().optional(),
  tempRangeMax: z.string().optional(),
  hazmatCertified: z.boolean().optional(),
  securityLevel: z.enum(["basic", "enhanced", "high"]).optional(),
  operatingHoursStart: z.string().max(10).optional(),
  operatingHoursEnd: z.string().max(10).optional(),
  bondPeriodDays: z.number().int().optional(),
  dailyStorageRate: z.string().optional(),
  currency: z.string().max(3).optional(),
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBondedWarehouseSchema = createBondedWarehouseSchema.partial();

// ==========================================
// Last Mile Delivery Management
// ==========================================

export const createLastMileDeliverySchema = z.object({
  bookingRef: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  cargoDescription: z.string().optional(),
  grossWeightKg: z.string().optional(),
  deliveryType: z.enum(["door_to_door", "port_to_door", "icd_to_door"]),
  pickupLocation: z.string().min(1).max(255),
  deliveryAddress: z.string().min(1),
  deliveryCity: z.string().max(100).optional(),
  deliveryPostalCode: z.string().max(20).optional(),
  deliveryContactName: z.string().max(255).optional(),
  deliveryContactPhone: z.string().max(50).optional(),
  scheduledDeliveryAt: z.coerce.date().optional(),
  actualDeliveryAt: z.coerce.date().optional(),
  deliveryWindowStart: z.string().max(10).optional(),
  deliveryWindowEnd: z.string().max(10).optional(),
  assignedVehicle: z.string().max(50).optional(),
  assignedDriver: z.string().max(255).optional(),
  deliveryAttempts: z.number().int().optional(),
  podUrl: z.string().max(500).optional(),
  podSignedAt: z.coerce.date().optional(),
  deliveryCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  failureReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLastMileDeliverySchema = createLastMileDeliverySchema.partial();

// ==========================================
// Multimodal Bill of Lading
// ==========================================

export const createMultimodalBolSchema = z.object({
  bolNumber: z.string().max(50).optional(),
  bolType: z.enum(["combined_transport", "through_bl", "multimodal"]),
  shipperName: z.string().min(1).max(255),
  shipperAddress: z.string().optional(),
  consigneeName: z.string().min(1).max(255),
  consigneeAddress: z.string().optional(),
  notifyPartyName: z.string().max(255).optional(),
  notifyPartyAddress: z.string().optional(),
  placeOfReceipt: z.string().max(255).optional(),
  portOfLoading: z.string().max(255).optional(),
  portOfDischarge: z.string().max(255).optional(),
  placeOfDelivery: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  containerType: z.string().max(30).optional(),
  cargoDescription: z.string().optional(),
  grossWeightKg: z.string().optional(),
  measurementCbm: z.string().optional(),
  numberOfPackages: z.number().int().optional(),
  packageType: z.string().max(50).optional(),
  freightTerms: z.enum(["prepaid", "collect"]).optional(),
  freightAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  issuedAt: z.coerce.date().optional(),
  issuedByName: z.string().max(255).optional(),
  issuedAtPlace: z.string().max(255).optional(),
  numberOfOriginals: z.number().int().optional(),
  surrendered: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateMultimodalBolSchema = createMultimodalBolSchema.partial();

// ==========================================
// Inland Haulage Rate Management
// ==========================================

export const createHaulageRateSchema = z.object({
  rateName: z.string().min(1).max(255),
  transportMode: z.enum(["road", "rail", "barge", "multimodal"]),
  originLocation: z.string().min(1).max(255),
  destinationLocation: z.string().min(1).max(255),
  containerSize: z.string().max(10).optional(),
  containerType: z.string().max(30).optional(),
  ratePerUnit: z.string().min(1),
  rateUnit: z.enum(["per_teu", "per_feu", "per_kg", "per_cbm", "lump_sum"]),
  currency: z.string().min(1).max(3),
  fuelSurchargePercent: z.string().optional(),
  tolls: z.string().optional(),
  carrierName: z.string().max(255).optional(),
  carrierCode: z.string().max(50).optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  minimumCharge: z.string().optional(),
  transitTimeDays: z.number().int().optional(),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateHaulageRateSchema = createHaulageRateSchema.partial();

// ==========================================
// AI Intermodal Route Optimization
// ==========================================

export const createRouteOptimizationSchema = z.object({
  requestedByName: z.string().max(255).optional(),
  originLocation: z.string().min(1).max(255),
  destinationLocation: z.string().min(1).max(255),
  cargoDescription: z.string().optional(),
  containerSize: z.string().max(10).optional(),
  containerCount: z.number().int().optional(),
  grossWeightKg: z.string().optional(),
  requiredDeliveryAt: z.coerce.date().optional(),
  optimizationCriteria: z.enum(["cost", "time", "carbon", "balanced"]),
  selectedRouteIndex: z.number().int().optional(),
  selectedRouteSummary: z.string().optional(),
  estimatedCost: z.string().optional(),
  estimatedTransitDays: z.number().int().optional(),
  estimatedCarbonKg: z.string().optional(),
  aiModelUsed: z.string().max(100).optional(),
  aiConfidenceScore: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRouteOptimizationSchema = createRouteOptimizationSchema.partial();
