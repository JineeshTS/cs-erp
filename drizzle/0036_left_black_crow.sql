CREATE TABLE "abi_bi_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"template_name" varchar(255),
	"category" varchar(50),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"schedule" varchar(50),
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"recipient_emails" jsonb,
	"recipient_roles" jsonb,
	"data_sources" jsonb,
	"report_config" jsonb,
	"output_format" varchar(10) DEFAULT 'pdf',
	"output_url" varchar(500),
	"generation_duration_ms" integer,
	"page_count" integer,
	"file_size" integer,
	"is_published" boolean DEFAULT false,
	"approved_by" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_customer_revenue_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(50) NOT NULL,
	"analytics_type" varchar(30) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"customer_segment" varchar(50),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"total_revenue" numeric(18, 2),
	"total_costs" numeric(18, 2),
	"gross_profit" numeric(18, 2),
	"gross_margin_pct" numeric(6, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"total_teu" numeric(14, 2),
	"total_shipments" integer,
	"avg_revenue_per_shipment" numeric(14, 2),
	"payment_terms_days" integer,
	"avg_days_to_payment" numeric(8, 2),
	"outstanding_balance" numeric(18, 2),
	"lifetime_value" numeric(18, 2),
	"revenue_by_service" jsonb,
	"revenue_by_lane" jsonb,
	"revenue_trend" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_executive_kpi_dashboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dashboard_ref" varchar(50) NOT NULL,
	"dashboard_type" varchar(30) NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"total_teu" numeric(14, 2),
	"total_revenue" numeric(18, 2),
	"revenue_currency" varchar(3) DEFAULT 'USD',
	"gross_profit" numeric(18, 2),
	"gross_margin_pct" numeric(6, 2),
	"vessel_utilization_pct" numeric(6, 2),
	"slot_utilization_pct" numeric(6, 2),
	"on_time_performance_pct" numeric(6, 2),
	"booking_conversion_pct" numeric(6, 2),
	"average_revenue_per_teu" numeric(14, 2),
	"operating_costs" numeric(18, 2),
	"ebitda" numeric(18, 2),
	"active_vessels" integer,
	"active_routes" integer,
	"total_bookings" integer,
	"kpi_breakdown" jsonb,
	"trend_data" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_market_intelligence_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"title" varchar(500) NOT NULL,
	"region" varchar(255),
	"trade_lane" varchar(255),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"market_size" numeric(18, 2),
	"market_growth_pct" numeric(6, 2),
	"our_market_share_pct" numeric(6, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"avg_market_rate" numeric(14, 2),
	"our_avg_rate" numeric(14, 2),
	"rate_premium_pct" numeric(6, 2),
	"competitor_data" jsonb,
	"market_trends" jsonb,
	"rate_index_data" jsonb,
	"recommendations" text,
	"source" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_operational_efficiencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(50) NOT NULL,
	"analytics_type" varchar(30) NOT NULL,
	"entity_name" varchar(255),
	"entity_type" varchar(50),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"avg_turnaround_hours" numeric(8, 2),
	"avg_dwell_time_days" numeric(8, 2),
	"avg_doc_processing_hours" numeric(8, 2),
	"equipment_utilization_pct" numeric(6, 2),
	"berth_productivity" numeric(10, 2),
	"crane_moves_per_hour" numeric(8, 2),
	"truck_turnaround_minutes" numeric(8, 2),
	"incident_count" integer,
	"delay_count" integer,
	"delay_hours_total" numeric(10, 2),
	"cost_per_teu" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"benchmark_comparison" jsonb,
	"efficiency_trend" jsonb,
	"bottlenecks" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_predictive_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"forecast_ref" varchar(50) NOT NULL,
	"forecast_type" varchar(30) NOT NULL,
	"model_name" varchar(255),
	"model_version" varchar(50),
	"target_metric" varchar(100) NOT NULL,
	"target_entity" varchar(255),
	"forecast_horizon" varchar(30),
	"forecast_start" timestamp with time zone,
	"forecast_end" timestamp with time zone,
	"predicted_value" numeric(18, 2),
	"confidence_lower" numeric(18, 2),
	"confidence_upper" numeric(18, 2),
	"confidence_pct" numeric(6, 2),
	"actual_value" numeric(18, 2),
	"variance_pct" numeric(8, 2),
	"accuracy_score" numeric(6, 2),
	"data_points" integer,
	"forecast_data" jsonb,
	"feature_importance" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_trade_lane_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(50) NOT NULL,
	"analytics_type" varchar(30) NOT NULL,
	"trade_lane_name" varchar(255) NOT NULL,
	"origin_region" varchar(255),
	"destination_region" varchar(255),
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"total_teu" numeric(14, 2),
	"total_shipments" integer,
	"revenue" numeric(18, 2),
	"avg_rate_per_teu" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"market_share_pct" numeric(6, 2),
	"volume_growth_pct" numeric(6, 2),
	"avg_transit_days" numeric(8, 2),
	"reliability_pct" numeric(6, 2),
	"competitor_rates" jsonb,
	"volume_trend" jsonb,
	"top_commodities" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "abi_voyage_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(50) NOT NULL,
	"analytics_type" varchar(30) NOT NULL,
	"voyage_ref" varchar(50),
	"service_name" varchar(255),
	"vessel_name" varchar(255),
	"route_origin" varchar(255),
	"route_destination" varchar(255),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"total_teu" numeric(14, 2),
	"revenue" numeric(18, 2),
	"costs" numeric(18, 2),
	"profit" numeric(18, 2),
	"profit_margin_pct" numeric(6, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"utilization_pct" numeric(6, 2),
	"schedule_reliability_pct" numeric(6, 2),
	"avg_transit_days" numeric(8, 2),
	"dwell_time_hours" numeric(8, 2),
	"port_call_count" integer,
	"cargo_mix" jsonb,
	"performance_metrics" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "abi_bi_reports" ADD CONSTRAINT "abi_bi_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_customer_revenue_analytics" ADD CONSTRAINT "abi_customer_revenue_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_executive_kpi_dashboards" ADD CONSTRAINT "abi_executive_kpi_dashboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_market_intelligence_reports" ADD CONSTRAINT "abi_market_intelligence_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_operational_efficiencies" ADD CONSTRAINT "abi_operational_efficiencies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_predictive_forecasts" ADD CONSTRAINT "abi_predictive_forecasts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_trade_lane_analytics" ADD CONSTRAINT "abi_trade_lane_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abi_voyage_analytics" ADD CONSTRAINT "abi_voyage_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "abi_bi_report_tenant_idx" ON "abi_bi_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_bi_report_ref_idx" ON "abi_bi_reports" USING btree ("report_ref");--> statement-breakpoint
CREATE INDEX "abi_bi_report_status_idx" ON "abi_bi_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_bi_report_type_idx" ON "abi_bi_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "abi_bi_report_category_idx" ON "abi_bi_reports" USING btree ("category");--> statement-breakpoint
CREATE INDEX "abi_bi_report_deleted_idx" ON "abi_bi_reports" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_cust_revenue_tenant_idx" ON "abi_customer_revenue_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_cust_revenue_ref_idx" ON "abi_customer_revenue_analytics" USING btree ("analytics_ref");--> statement-breakpoint
CREATE INDEX "abi_cust_revenue_status_idx" ON "abi_customer_revenue_analytics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_cust_revenue_type_idx" ON "abi_customer_revenue_analytics" USING btree ("analytics_type");--> statement-breakpoint
CREATE INDEX "abi_cust_revenue_customer_idx" ON "abi_customer_revenue_analytics" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "abi_cust_revenue_deleted_idx" ON "abi_customer_revenue_analytics" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_exec_kpi_tenant_idx" ON "abi_executive_kpi_dashboards" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_exec_kpi_ref_idx" ON "abi_executive_kpi_dashboards" USING btree ("dashboard_ref");--> statement-breakpoint
CREATE INDEX "abi_exec_kpi_status_idx" ON "abi_executive_kpi_dashboards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_exec_kpi_type_idx" ON "abi_executive_kpi_dashboards" USING btree ("dashboard_type");--> statement-breakpoint
CREATE INDEX "abi_exec_kpi_period_idx" ON "abi_executive_kpi_dashboards" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "abi_exec_kpi_deleted_idx" ON "abi_executive_kpi_dashboards" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_market_intel_tenant_idx" ON "abi_market_intelligence_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_market_intel_ref_idx" ON "abi_market_intelligence_reports" USING btree ("report_ref");--> statement-breakpoint
CREATE INDEX "abi_market_intel_status_idx" ON "abi_market_intelligence_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_market_intel_type_idx" ON "abi_market_intelligence_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "abi_market_intel_region_idx" ON "abi_market_intelligence_reports" USING btree ("region");--> statement-breakpoint
CREATE INDEX "abi_market_intel_deleted_idx" ON "abi_market_intelligence_reports" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_ops_efficiency_tenant_idx" ON "abi_operational_efficiencies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_ops_efficiency_ref_idx" ON "abi_operational_efficiencies" USING btree ("analytics_ref");--> statement-breakpoint
CREATE INDEX "abi_ops_efficiency_status_idx" ON "abi_operational_efficiencies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_ops_efficiency_type_idx" ON "abi_operational_efficiencies" USING btree ("analytics_type");--> statement-breakpoint
CREATE INDEX "abi_ops_efficiency_entity_idx" ON "abi_operational_efficiencies" USING btree ("entity_name");--> statement-breakpoint
CREATE INDEX "abi_ops_efficiency_deleted_idx" ON "abi_operational_efficiencies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_pred_forecast_tenant_idx" ON "abi_predictive_forecasts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_pred_forecast_ref_idx" ON "abi_predictive_forecasts" USING btree ("forecast_ref");--> statement-breakpoint
CREATE INDEX "abi_pred_forecast_status_idx" ON "abi_predictive_forecasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_pred_forecast_type_idx" ON "abi_predictive_forecasts" USING btree ("forecast_type");--> statement-breakpoint
CREATE INDEX "abi_pred_forecast_metric_idx" ON "abi_predictive_forecasts" USING btree ("target_metric");--> statement-breakpoint
CREATE INDEX "abi_pred_forecast_deleted_idx" ON "abi_predictive_forecasts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_trade_lane_tenant_idx" ON "abi_trade_lane_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_trade_lane_ref_idx" ON "abi_trade_lane_analytics" USING btree ("analytics_ref");--> statement-breakpoint
CREATE INDEX "abi_trade_lane_status_idx" ON "abi_trade_lane_analytics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_trade_lane_type_idx" ON "abi_trade_lane_analytics" USING btree ("analytics_type");--> statement-breakpoint
CREATE INDEX "abi_trade_lane_name_idx" ON "abi_trade_lane_analytics" USING btree ("trade_lane_name");--> statement-breakpoint
CREATE INDEX "abi_trade_lane_deleted_idx" ON "abi_trade_lane_analytics" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "abi_voyage_analytics_tenant_idx" ON "abi_voyage_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "abi_voyage_analytics_ref_idx" ON "abi_voyage_analytics" USING btree ("analytics_ref");--> statement-breakpoint
CREATE INDEX "abi_voyage_analytics_status_idx" ON "abi_voyage_analytics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "abi_voyage_analytics_type_idx" ON "abi_voyage_analytics" USING btree ("analytics_type");--> statement-breakpoint
CREATE INDEX "abi_voyage_analytics_vessel_idx" ON "abi_voyage_analytics" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "abi_voyage_analytics_deleted_idx" ON "abi_voyage_analytics" USING btree ("deleted_at");