import { z } from "zod/v4";

// ==========================================
// Executive KPI Dashboard
// ==========================================
export const createExecutiveKpiDashboardSchema = z.object({
  dashboardType: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"]),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  totalTeu: z.string().optional(),
  totalRevenue: z.string().optional(),
  revenueCurrency: z.string().max(3).optional(),
  grossProfit: z.string().optional(),
  grossMarginPct: z.string().optional(),
  vesselUtilizationPct: z.string().optional(),
  slotUtilizationPct: z.string().optional(),
  onTimePerformancePct: z.string().optional(),
  bookingConversionPct: z.string().optional(),
  averageRevenuePerTeu: z.string().optional(),
  operatingCosts: z.string().optional(),
  ebitda: z.string().optional(),
  activeVessels: z.number().int().optional(),
  activeRoutes: z.number().int().optional(),
  totalBookings: z.number().int().optional(),
  kpiBreakdown: z.record(z.string(), z.unknown()).optional(),
  trendData: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateExecutiveKpiDashboardSchema = createExecutiveKpiDashboardSchema.partial();

// ==========================================
// Voyage & Service Analytics
// ==========================================
export const createVoyageAnalyticsSchema = z.object({
  analyticsType: z.enum(["voyage_performance", "service_comparison", "route_profitability", "schedule_adherence"]),
  voyageRef: z.string().max(50).optional(),
  serviceName: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  routeOrigin: z.string().max(255).optional(),
  routeDestination: z.string().max(255).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  totalTeu: z.string().optional(),
  revenue: z.string().optional(),
  costs: z.string().optional(),
  profit: z.string().optional(),
  profitMarginPct: z.string().optional(),
  currency: z.string().max(3).optional(),
  utilizationPct: z.string().optional(),
  scheduleReliabilityPct: z.string().optional(),
  avgTransitDays: z.string().optional(),
  dwellTimeHours: z.string().optional(),
  portCallCount: z.number().int().optional(),
  cargoMix: z.record(z.string(), z.unknown()).optional(),
  performanceMetrics: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVoyageAnalyticsSchema = createVoyageAnalyticsSchema.partial();

// ==========================================
// Trade Lane Performance Analytics
// ==========================================
export const createTradeLaneAnalyticsSchema = z.object({
  analyticsType: z.enum(["lane_performance", "volume_trend", "rate_analysis", "market_share"]),
  tradeLaneName: z.string().min(1).max(255),
  originRegion: z.string().max(255).optional(),
  destinationRegion: z.string().max(255).optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  totalTeu: z.string().optional(),
  totalShipments: z.number().int().optional(),
  revenue: z.string().optional(),
  avgRatePerTeu: z.string().optional(),
  currency: z.string().max(3).optional(),
  marketSharePct: z.string().optional(),
  volumeGrowthPct: z.string().optional(),
  avgTransitDays: z.string().optional(),
  reliabilityPct: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTradeLaneAnalyticsSchema = createTradeLaneAnalyticsSchema.partial();

// ==========================================
// Customer Revenue Analytics
// ==========================================
export const createCustomerRevenueAnalyticsSchema = z.object({
  analyticsType: z.enum(["revenue_breakdown", "profitability", "segmentation", "lifetime_value"]),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  customerSegment: z.string().max(50).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  totalRevenue: z.string().optional(),
  totalCosts: z.string().optional(),
  grossProfit: z.string().optional(),
  grossMarginPct: z.string().optional(),
  currency: z.string().max(3).optional(),
  totalTeu: z.string().optional(),
  totalShipments: z.number().int().optional(),
  avgRevenuePerShipment: z.string().optional(),
  paymentTermsDays: z.number().int().optional(),
  avgDaysToPayment: z.string().optional(),
  outstandingBalance: z.string().optional(),
  lifetimeValue: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCustomerRevenueAnalyticsSchema = createCustomerRevenueAnalyticsSchema.partial();

// ==========================================
// Predictive Analytics & Forecasting
// ==========================================
export const createPredictiveForecastSchema = z.object({
  forecastType: z.enum(["demand_forecast", "rate_forecast", "volume_forecast", "capacity_forecast"]),
  modelName: z.string().max(255).optional(),
  modelVersion: z.string().max(50).optional(),
  targetMetric: z.string().min(1).max(100),
  targetEntity: z.string().max(255).optional(),
  forecastHorizon: z.enum(["1_week", "1_month", "3_months", "6_months", "1_year"]).optional(),
  forecastStart: z.coerce.date().optional(),
  forecastEnd: z.coerce.date().optional(),
  predictedValue: z.string().optional(),
  confidenceLower: z.string().optional(),
  confidenceUpper: z.string().optional(),
  confidencePct: z.string().optional(),
  actualValue: z.string().optional(),
  dataPoints: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePredictiveForecastSchema = createPredictiveForecastSchema.partial();

// ==========================================
// Market Intelligence & Competitor Benchmarking
// ==========================================
export const createMarketIntelligenceReportSchema = z.object({
  reportType: z.enum(["market_overview", "competitor_analysis", "rate_benchmark", "capacity_analysis"]),
  title: z.string().min(1).max(500),
  region: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  marketSize: z.string().optional(),
  marketGrowthPct: z.string().optional(),
  ourMarketSharePct: z.string().optional(),
  currency: z.string().max(3).optional(),
  avgMarketRate: z.string().optional(),
  ourAvgRate: z.string().optional(),
  ratePremiumPct: z.string().optional(),
  recommendations: z.string().optional(),
  source: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateMarketIntelligenceReportSchema = createMarketIntelligenceReportSchema.partial();

// ==========================================
// Operational Efficiency Analytics
// ==========================================
export const createOperationalEfficiencySchema = z.object({
  analyticsType: z.enum(["port_turnaround", "container_dwell", "documentation_speed", "equipment_utilization"]),
  entityName: z.string().max(255).optional(),
  entityType: z.enum(["vessel", "port", "terminal", "depot"]).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  avgTurnaroundHours: z.string().optional(),
  avgDwellTimeDays: z.string().optional(),
  avgDocProcessingHours: z.string().optional(),
  equipmentUtilizationPct: z.string().optional(),
  berthProductivity: z.string().optional(),
  craneMovesPerHour: z.string().optional(),
  truckTurnaroundMinutes: z.string().optional(),
  incidentCount: z.number().int().optional(),
  delayCount: z.number().int().optional(),
  delayHoursTotal: z.string().optional(),
  costPerTeu: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateOperationalEfficiencySchema = createOperationalEfficiencySchema.partial();

// ==========================================
// Automated BI Report Generation
// ==========================================
export const createBiReportSchema = z.object({
  reportType: z.enum(["scheduled", "ad_hoc", "triggered", "custom"]),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  templateName: z.string().max(255).optional(),
  category: z.enum(["financial", "operational", "commercial", "executive"]).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  schedule: z.enum(["daily", "weekly", "monthly", "quarterly"]).optional(),
  recipientEmails: z.array(z.string()).optional(),
  recipientRoles: z.array(z.string()).optional(),
  outputFormat: z.enum(["pdf", "xlsx", "csv", "html"]).optional(),
  isPublished: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBiReportSchema = createBiReportSchema.partial();
