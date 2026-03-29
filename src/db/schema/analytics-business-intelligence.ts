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
// Executive KPI Dashboard
// ==========================================
export const abiExecutiveKpiDashboards = pgTable(
  "abi_executive_kpi_dashboards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    dashboardRef: varchar("dashboard_ref", { length: 50 }).notNull(),
    dashboardType: varchar("dashboard_type", { length: 30 }).notNull(), // daily, weekly, monthly, quarterly, annual
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    totalTeu: decimal("total_teu", { precision: 14, scale: 2 }),
    totalRevenue: decimal("total_revenue", { precision: 18, scale: 2 }),
    revenueCurrency: varchar("revenue_currency", { length: 3 }).default("USD"),
    grossProfit: decimal("gross_profit", { precision: 18, scale: 2 }),
    grossMarginPct: decimal("gross_margin_pct", { precision: 6, scale: 2 }),
    vesselUtilizationPct: decimal("vessel_utilization_pct", { precision: 6, scale: 2 }),
    slotUtilizationPct: decimal("slot_utilization_pct", { precision: 6, scale: 2 }),
    onTimePerformancePct: decimal("on_time_performance_pct", { precision: 6, scale: 2 }),
    bookingConversionPct: decimal("booking_conversion_pct", { precision: 6, scale: 2 }),
    averageRevenuePerTeu: decimal("average_revenue_per_teu", { precision: 14, scale: 2 }),
    operatingCosts: decimal("operating_costs", { precision: 18, scale: 2 }),
    ebitda: decimal("ebitda", { precision: 18, scale: 2 }),
    activeVessels: integer("active_vessels"),
    activeRoutes: integer("active_routes"),
    totalBookings: integer("total_bookings"),
    kpiBreakdown: jsonb("kpi_breakdown"), // { byRegion: [], byService: [], byVessel: [] }
    trendData: jsonb("trend_data"), // { labels: [], datasets: [] }
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
    index("abi_exec_kpi_tenant_idx").on(t.tenantId),
    index("abi_exec_kpi_ref_idx").on(t.dashboardRef),
    index("abi_exec_kpi_status_idx").on(t.status),
    index("abi_exec_kpi_type_idx").on(t.dashboardType),
    index("abi_exec_kpi_period_idx").on(t.periodStart),
    index("abi_exec_kpi_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Voyage & Service Analytics
// ==========================================
export const abiVoyageAnalytics = pgTable(
  "abi_voyage_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    analyticsRef: varchar("analytics_ref", { length: 50 }).notNull(),
    analyticsType: varchar("analytics_type", { length: 30 }).notNull(), // voyage_performance, service_comparison, route_profitability, schedule_adherence
    voyageRef: varchar("voyage_ref", { length: 50 }),
    serviceName: varchar("service_name", { length: 255 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    routeOrigin: varchar("route_origin", { length: 255 }),
    routeDestination: varchar("route_destination", { length: 255 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    totalTeu: decimal("total_teu", { precision: 14, scale: 2 }),
    revenue: decimal("revenue", { precision: 18, scale: 2 }),
    costs: decimal("costs", { precision: 18, scale: 2 }),
    profit: decimal("profit", { precision: 18, scale: 2 }),
    profitMarginPct: decimal("profit_margin_pct", { precision: 6, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    utilizationPct: decimal("utilization_pct", { precision: 6, scale: 2 }),
    scheduleReliabilityPct: decimal("schedule_reliability_pct", { precision: 6, scale: 2 }),
    avgTransitDays: decimal("avg_transit_days", { precision: 8, scale: 2 }),
    dwellTimeHours: decimal("dwell_time_hours", { precision: 8, scale: 2 }),
    portCallCount: integer("port_call_count"),
    cargoMix: jsonb("cargo_mix"), // { containerTypes: [], commodities: [] }
    performanceMetrics: jsonb("performance_metrics"),
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
    index("abi_voyage_analytics_tenant_idx").on(t.tenantId),
    index("abi_voyage_analytics_ref_idx").on(t.analyticsRef),
    index("abi_voyage_analytics_status_idx").on(t.status),
    index("abi_voyage_analytics_type_idx").on(t.analyticsType),
    index("abi_voyage_analytics_vessel_idx").on(t.vesselName),
    index("abi_voyage_analytics_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Trade Lane Performance Analytics
// ==========================================
export const abiTradeLaneAnalytics = pgTable(
  "abi_trade_lane_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    analyticsRef: varchar("analytics_ref", { length: 50 }).notNull(),
    analyticsType: varchar("analytics_type", { length: 30 }).notNull(), // lane_performance, volume_trend, rate_analysis, market_share
    tradeLaneName: varchar("trade_lane_name", { length: 255 }).notNull(),
    originRegion: varchar("origin_region", { length: 255 }),
    destinationRegion: varchar("destination_region", { length: 255 }),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    totalTeu: decimal("total_teu", { precision: 14, scale: 2 }),
    totalShipments: integer("total_shipments"),
    revenue: decimal("revenue", { precision: 18, scale: 2 }),
    avgRatePerTeu: decimal("avg_rate_per_teu", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    marketSharePct: decimal("market_share_pct", { precision: 6, scale: 2 }),
    volumeGrowthPct: decimal("volume_growth_pct", { precision: 6, scale: 2 }),
    avgTransitDays: decimal("avg_transit_days", { precision: 8, scale: 2 }),
    reliabilityPct: decimal("reliability_pct", { precision: 6, scale: 2 }),
    competitorRates: jsonb("competitor_rates"), // [{ carrier, rate, marketShare }]
    volumeTrend: jsonb("volume_trend"), // { labels: [], values: [] }
    topCommodities: jsonb("top_commodities"), // [{ commodity, teu, revenue }]
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
    index("abi_trade_lane_tenant_idx").on(t.tenantId),
    index("abi_trade_lane_ref_idx").on(t.analyticsRef),
    index("abi_trade_lane_status_idx").on(t.status),
    index("abi_trade_lane_type_idx").on(t.analyticsType),
    index("abi_trade_lane_name_idx").on(t.tradeLaneName),
    index("abi_trade_lane_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Customer Revenue Analytics
// ==========================================
export const abiCustomerRevenueAnalytics = pgTable(
  "abi_customer_revenue_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    analyticsRef: varchar("analytics_ref", { length: 50 }).notNull(),
    analyticsType: varchar("analytics_type", { length: 30 }).notNull(), // revenue_breakdown, profitability, segmentation, lifetime_value
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    customerSegment: varchar("customer_segment", { length: 50 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    totalRevenue: decimal("total_revenue", { precision: 18, scale: 2 }),
    totalCosts: decimal("total_costs", { precision: 18, scale: 2 }),
    grossProfit: decimal("gross_profit", { precision: 18, scale: 2 }),
    grossMarginPct: decimal("gross_margin_pct", { precision: 6, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    totalTeu: decimal("total_teu", { precision: 14, scale: 2 }),
    totalShipments: integer("total_shipments"),
    avgRevenuePerShipment: decimal("avg_revenue_per_shipment", { precision: 14, scale: 2 }),
    paymentTermsDays: integer("payment_terms_days"),
    avgDaysToPayment: decimal("avg_days_to_payment", { precision: 8, scale: 2 }),
    outstandingBalance: decimal("outstanding_balance", { precision: 18, scale: 2 }),
    lifetimeValue: decimal("lifetime_value", { precision: 18, scale: 2 }),
    revenueByService: jsonb("revenue_by_service"), // [{ service, revenue, teu }]
    revenueByLane: jsonb("revenue_by_lane"), // [{ lane, revenue, teu }]
    revenueTrend: jsonb("revenue_trend"), // { labels: [], values: [] }
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
    index("abi_cust_revenue_tenant_idx").on(t.tenantId),
    index("abi_cust_revenue_ref_idx").on(t.analyticsRef),
    index("abi_cust_revenue_status_idx").on(t.status),
    index("abi_cust_revenue_type_idx").on(t.analyticsType),
    index("abi_cust_revenue_customer_idx").on(t.customerName),
    index("abi_cust_revenue_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Predictive Analytics & Forecasting
// ==========================================
export const abiPredictiveForecasts = pgTable(
  "abi_predictive_forecasts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    forecastRef: varchar("forecast_ref", { length: 50 }).notNull(),
    forecastType: varchar("forecast_type", { length: 30 }).notNull(), // demand_forecast, rate_forecast, volume_forecast, capacity_forecast
    modelName: varchar("model_name", { length: 255 }),
    modelVersion: varchar("model_version", { length: 50 }),
    targetMetric: varchar("target_metric", { length: 100 }).notNull(),
    targetEntity: varchar("target_entity", { length: 255 }),
    forecastHorizon: varchar("forecast_horizon", { length: 30 }), // 1_week, 1_month, 3_months, 6_months, 1_year
    forecastStart: timestamp("forecast_start", { withTimezone: true }),
    forecastEnd: timestamp("forecast_end", { withTimezone: true }),
    predictedValue: decimal("predicted_value", { precision: 18, scale: 2 }),
    confidenceLower: decimal("confidence_lower", { precision: 18, scale: 2 }),
    confidenceUpper: decimal("confidence_upper", { precision: 18, scale: 2 }),
    confidencePct: decimal("confidence_pct", { precision: 6, scale: 2 }),
    actualValue: decimal("actual_value", { precision: 18, scale: 2 }),
    variancePct: decimal("variance_pct", { precision: 8, scale: 2 }),
    accuracyScore: decimal("accuracy_score", { precision: 6, scale: 2 }),
    dataPoints: integer("data_points"),
    forecastData: jsonb("forecast_data"), // [{ date, predicted, lower, upper }]
    featureImportance: jsonb("feature_importance"), // [{ feature, importance }]
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
    index("abi_pred_forecast_tenant_idx").on(t.tenantId),
    index("abi_pred_forecast_ref_idx").on(t.forecastRef),
    index("abi_pred_forecast_status_idx").on(t.status),
    index("abi_pred_forecast_type_idx").on(t.forecastType),
    index("abi_pred_forecast_metric_idx").on(t.targetMetric),
    index("abi_pred_forecast_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Market Intelligence & Competitor Benchmarking
// ==========================================
export const abiMarketIntelligenceReports = pgTable(
  "abi_market_intelligence_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(), // market_overview, competitor_analysis, rate_benchmark, capacity_analysis
    title: varchar("title", { length: 500 }).notNull(),
    region: varchar("region", { length: 255 }),
    tradeLane: varchar("trade_lane", { length: 255 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    marketSize: decimal("market_size", { precision: 18, scale: 2 }),
    marketGrowthPct: decimal("market_growth_pct", { precision: 6, scale: 2 }),
    ourMarketSharePct: decimal("our_market_share_pct", { precision: 6, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    avgMarketRate: decimal("avg_market_rate", { precision: 14, scale: 2 }),
    ourAvgRate: decimal("our_avg_rate", { precision: 14, scale: 2 }),
    ratePremiumPct: decimal("rate_premium_pct", { precision: 6, scale: 2 }),
    competitorData: jsonb("competitor_data"), // [{ name, marketShare, avgRate, strengths, weaknesses }]
    marketTrends: jsonb("market_trends"), // [{ trend, impact, likelihood }]
    rateIndexData: jsonb("rate_index_data"), // { labels: [], values: [] }
    recommendations: text("recommendations"),
    source: varchar("source", { length: 255 }),
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
    index("abi_market_intel_tenant_idx").on(t.tenantId),
    index("abi_market_intel_ref_idx").on(t.reportRef),
    index("abi_market_intel_status_idx").on(t.status),
    index("abi_market_intel_type_idx").on(t.reportType),
    index("abi_market_intel_region_idx").on(t.region),
    index("abi_market_intel_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Operational Efficiency Analytics
// ==========================================
export const abiOperationalEfficiencies = pgTable(
  "abi_operational_efficiencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    analyticsRef: varchar("analytics_ref", { length: 50 }).notNull(),
    analyticsType: varchar("analytics_type", { length: 30 }).notNull(), // port_turnaround, container_dwell, documentation_speed, equipment_utilization
    entityName: varchar("entity_name", { length: 255 }),
    entityType: varchar("entity_type", { length: 50 }), // vessel, port, terminal, depot
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    avgTurnaroundHours: decimal("avg_turnaround_hours", { precision: 8, scale: 2 }),
    avgDwellTimeDays: decimal("avg_dwell_time_days", { precision: 8, scale: 2 }),
    avgDocProcessingHours: decimal("avg_doc_processing_hours", { precision: 8, scale: 2 }),
    equipmentUtilizationPct: decimal("equipment_utilization_pct", { precision: 6, scale: 2 }),
    berthProductivity: decimal("berth_productivity", { precision: 10, scale: 2 }),
    craneMovesPerHour: decimal("crane_moves_per_hour", { precision: 8, scale: 2 }),
    truckTurnaroundMinutes: decimal("truck_turnaround_minutes", { precision: 8, scale: 2 }),
    incidentCount: integer("incident_count"),
    delayCount: integer("delay_count"),
    delayHoursTotal: decimal("delay_hours_total", { precision: 10, scale: 2 }),
    costPerTeu: decimal("cost_per_teu", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    benchmarkComparison: jsonb("benchmark_comparison"), // { industry: {}, company: {}, target: {} }
    efficiencyTrend: jsonb("efficiency_trend"), // { labels: [], values: [] }
    bottlenecks: jsonb("bottlenecks"), // [{ area, description, impact, recommendation }]
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
    index("abi_ops_efficiency_tenant_idx").on(t.tenantId),
    index("abi_ops_efficiency_ref_idx").on(t.analyticsRef),
    index("abi_ops_efficiency_status_idx").on(t.status),
    index("abi_ops_efficiency_type_idx").on(t.analyticsType),
    index("abi_ops_efficiency_entity_idx").on(t.entityName),
    index("abi_ops_efficiency_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Automated BI Report Generation
// ==========================================
export const abiBiReports = pgTable(
  "abi_bi_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(), // scheduled, ad_hoc, triggered, custom
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    templateName: varchar("template_name", { length: 255 }),
    category: varchar("category", { length: 50 }), // financial, operational, commercial, executive
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    schedule: varchar("schedule", { length: 50 }), // daily, weekly, monthly, quarterly
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    recipientEmails: jsonb("recipient_emails"), // string[]
    recipientRoles: jsonb("recipient_roles"), // string[]
    dataSources: jsonb("data_sources"), // [{ source, query, params }]
    reportConfig: jsonb("report_config"), // { charts: [], tables: [], filters: [] }
    outputFormat: varchar("output_format", { length: 10 }).default("pdf"), // pdf, xlsx, csv, html
    outputUrl: varchar("output_url", { length: 500 }),
    generationDurationMs: integer("generation_duration_ms"),
    pageCount: integer("page_count"),
    fileSize: integer("file_size"),
    isPublished: boolean("is_published").default(false),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
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
    index("abi_bi_report_tenant_idx").on(t.tenantId),
    index("abi_bi_report_ref_idx").on(t.reportRef),
    index("abi_bi_report_status_idx").on(t.status),
    index("abi_bi_report_type_idx").on(t.reportType),
    index("abi_bi_report_category_idx").on(t.category),
    index("abi_bi_report_deleted_idx").on(t.deletedAt),
  ]
);
