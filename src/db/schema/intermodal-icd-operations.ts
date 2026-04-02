import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// ICD & Dry Port Management
// ==========================================
export const icdDryPorts = pgTable(
  "icd_dry_ports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    portRef: varchar("port_ref", { length: 50 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    portCode: varchar("port_code", { length: 20 }),
    portType: varchar("port_type", { length: 30 }).notNull(), // icd, dry_port, cfs, depot
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    operatorName: varchar("operator_name", { length: 255 }),
    operatorCode: varchar("operator_code", { length: 50 }),
    customsZoneType: varchar("customs_zone_type", { length: 30 }), // free_zone, bonded, general
    storageCapacityTeu: integer("storage_capacity_teu"),
    currentOccupancyTeu: integer("current_occupancy_teu"),
    railConnected: boolean("rail_connected").default(false),
    gateHoursStart: varchar("gate_hours_start", { length: 10 }),
    gateHoursEnd: varchar("gate_hours_end", { length: 10 }),
    contactName: varchar("contact_name", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    servicesOffered: jsonb("services_offered"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_dry_ports_tenant_idx").on(t.tenantId),
    index("icd_dry_ports_port_ref_idx").on(t.portRef),
    index("icd_dry_ports_status_idx").on(t.status),
    index("icd_dry_ports_port_type_idx").on(t.portType),
    index("icd_dry_ports_country_idx").on(t.country),
    index("icd_dry_ports_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Rail Wagon & Train Planning
// ==========================================
export const icdRailPlans = pgTable(
  "icd_rail_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    railPlanRef: varchar("rail_plan_ref", { length: 50 }).notNull(),
    trainNumber: varchar("train_number", { length: 50 }),
    trainOperator: varchar("train_operator", { length: 255 }),
    originIcd: varchar("origin_icd", { length: 255 }).notNull(),
    destinationIcd: varchar("destination_icd", { length: 255 }).notNull(),
    routeDescription: text("route_description"),
    wagonCount: integer("wagon_count"),
    wagonType: varchar("wagon_type", { length: 30 }), // flat, container, mixed
    totalCapacityTeu: integer("total_capacity_teu"),
    bookedTeu: integer("booked_teu"),
    scheduledDepartureAt: timestamp("scheduled_departure_at", { withTimezone: true }),
    scheduledArrivalAt: timestamp("scheduled_arrival_at", { withTimezone: true }),
    actualDepartureAt: timestamp("actual_departure_at", { withTimezone: true }),
    actualArrivalAt: timestamp("actual_arrival_at", { withTimezone: true }),
    transitTimeDays: integer("transit_time_days"),
    containerManifest: jsonb("container_manifest"),
    wagonAssignments: jsonb("wagon_assignments"),
    railwayCompany: varchar("railway_company", { length: 255 }),
    bookingCutoffAt: timestamp("booking_cutoff_at", { withTimezone: true }),
    estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    status: varchar("status", { length: 20 }).notNull().default("planning"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_rail_plans_tenant_idx").on(t.tenantId),
    index("icd_rail_plans_ref_idx").on(t.railPlanRef),
    index("icd_rail_plans_status_idx").on(t.status),
    index("icd_rail_plans_origin_idx").on(t.originIcd),
    index("icd_rail_plans_dest_idx").on(t.destinationIcd),
    index("icd_rail_plans_departure_idx").on(t.scheduledDepartureAt),
    index("icd_rail_plans_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Truck Booking & Transport Management
// ==========================================
export const icdTruckBookings = pgTable(
  "icd_truck_bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    bookingRef: varchar("booking_ref", { length: 50 }).notNull(),
    transporterName: varchar("transporter_name", { length: 255 }).notNull(),
    transporterCode: varchar("transporter_code", { length: 50 }),
    driverName: varchar("driver_name", { length: 255 }),
    driverLicense: varchar("driver_license", { length: 50 }),
    driverPhone: varchar("driver_phone", { length: 50 }),
    truckPlateNumber: varchar("truck_plate_number", { length: 30 }),
    trailerPlateNumber: varchar("trailer_plate_number", { length: 30 }),
    truckType: varchar("truck_type", { length: 30 }), // flatbed, container_chassis, lowbed, side_loader
    containerNumber: varchar("container_number", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    cargoDescription: text("cargo_description"),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    pickupLocation: varchar("pickup_location", { length: 255 }).notNull(),
    deliveryLocation: varchar("delivery_location", { length: 255 }).notNull(),
    scheduledPickupAt: timestamp("scheduled_pickup_at", { withTimezone: true }),
    scheduledDeliveryAt: timestamp("scheduled_delivery_at", { withTimezone: true }),
    actualPickupAt: timestamp("actual_pickup_at", { withTimezone: true }),
    actualDeliveryAt: timestamp("actual_delivery_at", { withTimezone: true }),
    gpsTrackingId: varchar("gps_tracking_id", { length: 100 }),
    distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
    transportCost: decimal("transport_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    podSignedByName: varchar("pod_signed_by_name", { length: 255 }),
    podSignedAt: timestamp("pod_signed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_truck_bookings_tenant_idx").on(t.tenantId),
    index("icd_truck_bookings_ref_idx").on(t.bookingRef),
    index("icd_truck_bookings_status_idx").on(t.status),
    index("icd_truck_bookings_transporter_idx").on(t.transporterName),
    index("icd_truck_bookings_pickup_idx").on(t.scheduledPickupAt),
    index("icd_truck_bookings_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Customs Bonded Warehouse Operations
// ==========================================
export const icdBondedWarehouses = pgTable(
  "icd_bonded_warehouses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    warehouseRef: varchar("warehouse_ref", { length: 50 }).notNull(),
    warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),
    warehouseCode: varchar("warehouse_code", { length: 30 }),
    warehouseType: varchar("warehouse_type", { length: 30 }).notNull(), // bonded, free_zone, general, temperature_controlled
    customsLicenseNumber: varchar("customs_license_number", { length: 100 }),
    customsLicenseExpiry: timestamp("customs_license_expiry", { withTimezone: true }),
    location: varchar("location", { length: 255 }),
    totalAreaSqm: decimal("total_area_sqm", { precision: 12, scale: 2 }),
    usableAreaSqm: decimal("usable_area_sqm", { precision: 12, scale: 2 }),
    storageCapacityTeu: integer("storage_capacity_teu"),
    currentOccupancyTeu: integer("current_occupancy_teu"),
    temperatureControlled: boolean("temperature_controlled").default(false),
    tempRangeMin: decimal("temp_range_min", { precision: 6, scale: 2 }),
    tempRangeMax: decimal("temp_range_max", { precision: 6, scale: 2 }),
    hazmatCertified: boolean("hazmat_certified").default(false),
    securityLevel: varchar("security_level", { length: 20 }), // basic, enhanced, high
    operatingHoursStart: varchar("operating_hours_start", { length: 10 }),
    operatingHoursEnd: varchar("operating_hours_end", { length: 10 }),
    bondPeriodDays: integer("bond_period_days"),
    dailyStorageRate: decimal("daily_storage_rate", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    contactName: varchar("contact_name", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_bonded_warehouses_tenant_idx").on(t.tenantId),
    index("icd_bonded_warehouses_ref_idx").on(t.warehouseRef),
    index("icd_bonded_warehouses_status_idx").on(t.status),
    index("icd_bonded_warehouses_type_idx").on(t.warehouseType),
    index("icd_bonded_warehouses_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Last Mile Delivery Management
// ==========================================
export const icdLastMileDeliveries = pgTable(
  "icd_last_mile_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    deliveryRef: varchar("delivery_ref", { length: 50 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    cargoDescription: text("cargo_description"),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    deliveryType: varchar("delivery_type", { length: 30 }).notNull(), // door_to_door, port_to_door, icd_to_door
    pickupLocation: varchar("pickup_location", { length: 255 }).notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    deliveryCity: varchar("delivery_city", { length: 100 }),
    deliveryPostalCode: varchar("delivery_postal_code", { length: 20 }),
    deliveryContactName: varchar("delivery_contact_name", { length: 255 }),
    deliveryContactPhone: varchar("delivery_contact_phone", { length: 50 }),
    scheduledDeliveryAt: timestamp("scheduled_delivery_at", { withTimezone: true }),
    actualDeliveryAt: timestamp("actual_delivery_at", { withTimezone: true }),
    deliveryWindowStart: varchar("delivery_window_start", { length: 10 }),
    deliveryWindowEnd: varchar("delivery_window_end", { length: 10 }),
    assignedVehicle: varchar("assigned_vehicle", { length: 50 }),
    assignedDriver: varchar("assigned_driver", { length: 255 }),
    deliveryAttempts: integer("delivery_attempts").default(0),
    podUrl: varchar("pod_url", { length: 500 }),
    podSignedAt: timestamp("pod_signed_at", { withTimezone: true }),
    deliveryCost: decimal("delivery_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    failureReason: text("failure_reason"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_last_mile_tenant_idx").on(t.tenantId),
    index("icd_last_mile_ref_idx").on(t.deliveryRef),
    index("icd_last_mile_status_idx").on(t.status),
    index("icd_last_mile_customer_idx").on(t.customerName),
    index("icd_last_mile_scheduled_idx").on(t.scheduledDeliveryAt),
    index("icd_last_mile_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Multimodal Bill of Lading
// ==========================================
export const icdMultimodalBols = pgTable(
  "icd_multimodal_bols",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    bolRef: varchar("bol_ref", { length: 50 }).notNull(),
    bolNumber: varchar("bol_number", { length: 50 }),
    bolType: varchar("bol_type", { length: 30 }).notNull(), // combined_transport, through_bl, multimodal
    shipperName: varchar("shipper_name", { length: 255 }).notNull(),
    shipperAddress: text("shipper_address"),
    consigneeName: varchar("consignee_name", { length: 255 }).notNull(),
    consigneeAddress: text("consignee_address"),
    notifyPartyName: varchar("notify_party_name", { length: 255 }),
    notifyPartyAddress: text("notify_party_address"),
    placeOfReceipt: varchar("place_of_receipt", { length: 255 }),
    portOfLoading: varchar("port_of_loading", { length: 255 }),
    portOfDischarge: varchar("port_of_discharge", { length: 255 }),
    placeOfDelivery: varchar("place_of_delivery", { length: 255 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    containerType: varchar("container_type", { length: 30 }),
    cargoDescription: text("cargo_description"),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    measurementCbm: decimal("measurement_cbm", { precision: 12, scale: 3 }),
    numberOfPackages: integer("number_of_packages"),
    packageType: varchar("package_type", { length: 50 }),
    freightTerms: varchar("freight_terms", { length: 20 }), // prepaid, collect
    freightAmount: decimal("freight_amount", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    transportLegs: jsonb("transport_legs"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    issuedByName: varchar("issued_by_name", { length: 255 }),
    issuedAtPlace: varchar("issued_at_place", { length: 255 }),
    numberOfOriginals: integer("number_of_originals").default(3),
    surrendered: boolean("surrendered").default(false),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_multimodal_bols_tenant_idx").on(t.tenantId),
    index("icd_multimodal_bols_ref_idx").on(t.bolRef),
    index("icd_multimodal_bols_status_idx").on(t.status),
    index("icd_multimodal_bols_shipper_idx").on(t.shipperName),
    index("icd_multimodal_bols_consignee_idx").on(t.consigneeName),
    index("icd_multimodal_bols_bol_number_idx").on(t.bolNumber),
    index("icd_multimodal_bols_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Inland Haulage Rate Management
// ==========================================
export const icdHaulageRates = pgTable(
  "icd_haulage_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    rateRef: varchar("rate_ref", { length: 50 }).notNull(),
    rateName: varchar("rate_name", { length: 255 }).notNull(),
    transportMode: varchar("transport_mode", { length: 30 }).notNull(), // road, rail, barge, multimodal
    originLocation: varchar("origin_location", { length: 255 }).notNull(),
    destinationLocation: varchar("destination_location", { length: 255 }).notNull(),
    containerSize: varchar("container_size", { length: 10 }),
    containerType: varchar("container_type", { length: 30 }),
    ratePerUnit: decimal("rate_per_unit", { precision: 14, scale: 2 }).notNull(),
    rateUnit: varchar("rate_unit", { length: 20 }).notNull(), // per_teu, per_feu, per_kg, per_cbm, lump_sum
    currency: varchar("currency", { length: 3 }).notNull(),
    fuelSurchargePercent: decimal("fuel_surcharge_percent", { precision: 5, scale: 2 }),
    tolls: decimal("tolls", { precision: 10, scale: 2 }),
    additionalCharges: jsonb("additional_charges"),
    carrierName: varchar("carrier_name", { length: 255 }),
    carrierCode: varchar("carrier_code", { length: 50 }),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    minimumCharge: decimal("minimum_charge", { precision: 14, scale: 2 }),
    transitTimeDays: integer("transit_time_days"),
    termsAndConditions: text("terms_and_conditions"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_haulage_rates_tenant_idx").on(t.tenantId),
    index("icd_haulage_rates_ref_idx").on(t.rateRef),
    index("icd_haulage_rates_status_idx").on(t.status),
    index("icd_haulage_rates_mode_idx").on(t.transportMode),
    index("icd_haulage_rates_origin_idx").on(t.originLocation),
    index("icd_haulage_rates_dest_idx").on(t.destinationLocation),
    index("icd_haulage_rates_valid_idx").on(t.validFrom, t.validTo),
    index("icd_haulage_rates_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// AI Intermodal Route Optimization
// ==========================================
export const icdRouteOptimizations = pgTable(
  "icd_route_optimizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    optimizationRef: varchar("optimization_ref", { length: 50 }).notNull(),
    requestedByName: varchar("requested_by_name", { length: 255 }),
    originLocation: varchar("origin_location", { length: 255 }).notNull(),
    destinationLocation: varchar("destination_location", { length: 255 }).notNull(),
    cargoDescription: text("cargo_description"),
    containerSize: varchar("container_size", { length: 10 }),
    containerCount: integer("container_count"),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    requiredDeliveryAt: timestamp("required_delivery_at", { withTimezone: true }),
    optimizationCriteria: varchar("optimization_criteria", { length: 30 }).notNull(), // cost, time, carbon, balanced
    routeOptions: jsonb("route_options"),
    selectedRouteIndex: integer("selected_route_index"),
    selectedRouteSummary: text("selected_route_summary"),
    estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
    estimatedTransitDays: integer("estimated_transit_days"),
    estimatedCarbonKg: decimal("estimated_carbon_kg", { precision: 12, scale: 2 }),
    aiModelUsed: varchar("ai_model_used", { length: 100 }),
    aiConfidenceScore: decimal("ai_confidence_score", { precision: 5, scale: 3 }),
    constraints: jsonb("constraints"),
    currency: varchar("currency", { length: 3 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icd_route_opt_tenant_idx").on(t.tenantId),
    index("icd_route_opt_ref_idx").on(t.optimizationRef),
    index("icd_route_opt_status_idx").on(t.status),
    index("icd_route_opt_origin_idx").on(t.originLocation),
    index("icd_route_opt_dest_idx").on(t.destinationLocation),
    index("icd_route_opt_criteria_idx").on(t.optimizationCriteria),
    index("icd_route_opt_deleted_idx").on(t.deletedAt),
  ]
);
