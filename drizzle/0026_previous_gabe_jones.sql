CREATE TABLE "ltr_alliance_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"alliance_ref" varchar(50) NOT NULL,
	"alliance_name" varchar(255) NOT NULL,
	"alliance_type" varchar(30) NOT NULL,
	"member_carriers" jsonb NOT NULL,
	"member_count" integer NOT NULL,
	"covered_trade_routes" jsonb,
	"total_deployed_teu" integer,
	"vessel_sharing_arrangement" text,
	"slot_exchange_terms" jsonb,
	"joint_service_count" integer,
	"governance_structure" text,
	"meeting_schedule" varchar(100),
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"regulatory_approval" boolean DEFAULT false,
	"regulatory_details" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_market_intelligence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"intelligence_ref" varchar(50) NOT NULL,
	"trade_route" varchar(255) NOT NULL,
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"data_source" varchar(100) NOT NULL,
	"index_type" varchar(50) NOT NULL,
	"index_value" numeric(12, 2),
	"index_date" timestamp with time zone NOT NULL,
	"spot_rate" numeric(12, 2),
	"contract_rate" numeric(12, 2),
	"rate_unit" varchar(20) DEFAULT 'per_teu',
	"currency" varchar(3) DEFAULT 'USD',
	"capacity_utilization" numeric(5, 2),
	"demand_forecast" jsonb,
	"supply_forecast" jsonb,
	"competitor_activity" jsonb,
	"market_trend" varchar(20),
	"sentiment_score" numeric(5, 2),
	"ai_insights" text,
	"alerts" jsonb,
	"status" varchar(20) DEFAULT 'current' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_port_pair_trade_lanes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"trade_lane_ref" varchar(50) NOT NULL,
	"origin_port" varchar(255) NOT NULL,
	"origin_country" varchar(100) NOT NULL,
	"origin_region" varchar(100),
	"destination_port" varchar(255) NOT NULL,
	"destination_country" varchar(100) NOT NULL,
	"destination_region" varchar(100),
	"trade_direction" varchar(30) NOT NULL,
	"distance_nm" integer,
	"average_transit_days" integer,
	"service_loop_ids" jsonb,
	"competitor_count" integer,
	"competitor_details" jsonb,
	"volume_history_teu" jsonb,
	"market_share_percent" numeric(5, 2),
	"avg_freight_rate" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"seasonality_factors" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_port_stay_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analysis_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_id" uuid,
	"port_name" varchar(255) NOT NULL,
	"port_country" varchar(100) NOT NULL,
	"terminal_name" varchar(255),
	"arrival_date" timestamp with time zone NOT NULL,
	"departure_date" timestamp with time zone,
	"total_port_stay_hours" numeric(8, 2),
	"waiting_time_hours" numeric(8, 2),
	"berthing_time_hours" numeric(8, 2),
	"cargo_ops_hours" numeric(8, 2),
	"containers_moved" integer,
	"moves_per_hour" numeric(6, 2),
	"crane_split" jsonb,
	"delay_reasons" jsonb,
	"total_delay_hours" numeric(8, 2),
	"bunker_consumed" numeric(10, 2),
	"port_cost_estimate" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"productivity_score" numeric(5, 2),
	"benchmark_score" numeric(5, 2),
	"status" varchar(20) DEFAULT 'recorded' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_route_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"optimization_ref" varchar(50) NOT NULL,
	"service_loop_name" varchar(255),
	"trade_route" varchar(255) NOT NULL,
	"optimization_type" varchar(30) NOT NULL,
	"current_route" jsonb NOT NULL,
	"proposed_route" jsonb,
	"objective_function" varchar(50) NOT NULL,
	"constraints" jsonb,
	"input_parameters" jsonb,
	"model_version" varchar(50),
	"estimated_savings" numeric(15, 2),
	"savings_breakdown" jsonb,
	"transit_time_impact" integer,
	"capacity_impact" integer,
	"emissions_impact" numeric(10, 2),
	"confidence_score" numeric(5, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"implemented_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_service_loops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"loop_ref" varchar(50) NOT NULL,
	"loop_name" varchar(255) NOT NULL,
	"loop_code" varchar(50) NOT NULL,
	"trade_route" varchar(255) NOT NULL,
	"direction" varchar(30) NOT NULL,
	"port_rotation" jsonb NOT NULL,
	"total_ports" integer NOT NULL,
	"round_trip_days" integer,
	"frequency" varchar(30) NOT NULL,
	"vessel_count" integer,
	"vessel_names" jsonb,
	"deployed_capacity_teu" integer,
	"transit_time_days" jsonb,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"alliance_partner" varchar(255),
	"operating_carrier" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_slot_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agreement_ref" varchar(50) NOT NULL,
	"agreement_type" varchar(30) NOT NULL,
	"partner_name" varchar(255) NOT NULL,
	"partner_code" varchar(50),
	"service_loop_name" varchar(255),
	"trade_route" varchar(255),
	"slot_allocation_teu" integer,
	"slot_utilization_percent" numeric(5, 2),
	"revenue_share_percent" numeric(5, 2),
	"cost_share_percent" numeric(5, 2),
	"minimum_quantity_commitment" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"contract_terms" jsonb,
	"penalty_clause" text,
	"settlement_frequency" varchar(30),
	"last_settlement_date" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'USD',
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ltr_trade_lane_pnl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pnl_ref" varchar(50) NOT NULL,
	"trade_lane_id" uuid,
	"trade_lane_name" varchar(255) NOT NULL,
	"service_loop_name" varchar(255),
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"volume_teu" integer,
	"revenue" numeric(15, 2),
	"bunker_cost" numeric(15, 2),
	"port_cost" numeric(15, 2),
	"canal_cost" numeric(15, 2),
	"equipment_cost" numeric(15, 2),
	"overhead_cost" numeric(15, 2),
	"total_cost" numeric(15, 2),
	"gross_profit" numeric(15, 2),
	"gross_margin_percent" numeric(5, 2),
	"contribution_margin" numeric(15, 2),
	"revenue_per_teu" numeric(10, 2),
	"cost_per_teu" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"cost_breakdown" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ltr_alliance_agreements" ADD CONSTRAINT "ltr_alliance_agreements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_market_intelligence" ADD CONSTRAINT "ltr_market_intelligence_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_port_pair_trade_lanes" ADD CONSTRAINT "ltr_port_pair_trade_lanes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_port_stay_analyses" ADD CONSTRAINT "ltr_port_stay_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_route_optimizations" ADD CONSTRAINT "ltr_route_optimizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_service_loops" ADD CONSTRAINT "ltr_service_loops_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_slot_agreements" ADD CONSTRAINT "ltr_slot_agreements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ltr_trade_lane_pnl" ADD CONSTRAINT "ltr_trade_lane_pnl_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ltr_alliance_agmt_tenant_idx" ON "ltr_alliance_agreements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_alliance_agmt_ref_tenant_idx" ON "ltr_alliance_agreements" USING btree ("tenant_id","alliance_ref");--> statement-breakpoint
CREATE INDEX "ltr_alliance_agmt_name_idx" ON "ltr_alliance_agreements" USING btree ("tenant_id","alliance_name");--> statement-breakpoint
CREATE INDEX "ltr_alliance_agmt_type_idx" ON "ltr_alliance_agreements" USING btree ("tenant_id","alliance_type");--> statement-breakpoint
CREATE INDEX "ltr_alliance_agmt_status_idx" ON "ltr_alliance_agreements" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_alliance_agmt_created_idx" ON "ltr_alliance_agreements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_alliance_agmt_deleted_idx" ON "ltr_alliance_agreements" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_tenant_idx" ON "ltr_market_intelligence" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_market_intel_ref_tenant_idx" ON "ltr_market_intelligence" USING btree ("tenant_id","intelligence_ref");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_route_idx" ON "ltr_market_intelligence" USING btree ("tenant_id","trade_route");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_source_idx" ON "ltr_market_intelligence" USING btree ("tenant_id","data_source");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_index_type_idx" ON "ltr_market_intelligence" USING btree ("tenant_id","index_type");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_date_idx" ON "ltr_market_intelligence" USING btree ("tenant_id","index_date");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_status_idx" ON "ltr_market_intelligence" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_created_idx" ON "ltr_market_intelligence" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_market_intel_deleted_idx" ON "ltr_market_intelligence" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_tenant_idx" ON "ltr_port_pair_trade_lanes" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_port_pair_tl_ref_tenant_idx" ON "ltr_port_pair_trade_lanes" USING btree ("tenant_id","trade_lane_ref");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_origin_idx" ON "ltr_port_pair_trade_lanes" USING btree ("tenant_id","origin_port");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_dest_idx" ON "ltr_port_pair_trade_lanes" USING btree ("tenant_id","destination_port");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_direction_idx" ON "ltr_port_pair_trade_lanes" USING btree ("tenant_id","trade_direction");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_status_idx" ON "ltr_port_pair_trade_lanes" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_created_idx" ON "ltr_port_pair_trade_lanes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_port_pair_tl_deleted_idx" ON "ltr_port_pair_trade_lanes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_tenant_idx" ON "ltr_port_stay_analyses" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_port_stay_ref_tenant_idx" ON "ltr_port_stay_analyses" USING btree ("tenant_id","analysis_ref");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_vessel_idx" ON "ltr_port_stay_analyses" USING btree ("tenant_id","vessel_name");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_port_idx" ON "ltr_port_stay_analyses" USING btree ("tenant_id","port_name");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_arrival_idx" ON "ltr_port_stay_analyses" USING btree ("tenant_id","arrival_date");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_status_idx" ON "ltr_port_stay_analyses" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_created_idx" ON "ltr_port_stay_analyses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_port_stay_deleted_idx" ON "ltr_port_stay_analyses" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_route_opt_tenant_idx" ON "ltr_route_optimizations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_route_opt_ref_tenant_idx" ON "ltr_route_optimizations" USING btree ("tenant_id","optimization_ref");--> statement-breakpoint
CREATE INDEX "ltr_route_opt_trade_idx" ON "ltr_route_optimizations" USING btree ("tenant_id","trade_route");--> statement-breakpoint
CREATE INDEX "ltr_route_opt_type_idx" ON "ltr_route_optimizations" USING btree ("tenant_id","optimization_type");--> statement-breakpoint
CREATE INDEX "ltr_route_opt_status_idx" ON "ltr_route_optimizations" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_route_opt_created_idx" ON "ltr_route_optimizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_route_opt_deleted_idx" ON "ltr_route_optimizations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_service_loops_tenant_idx" ON "ltr_service_loops" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_service_loops_ref_tenant_idx" ON "ltr_service_loops" USING btree ("tenant_id","loop_ref");--> statement-breakpoint
CREATE INDEX "ltr_service_loops_status_idx" ON "ltr_service_loops" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_service_loops_trade_route_idx" ON "ltr_service_loops" USING btree ("tenant_id","trade_route");--> statement-breakpoint
CREATE INDEX "ltr_service_loops_loop_code_idx" ON "ltr_service_loops" USING btree ("tenant_id","loop_code");--> statement-breakpoint
CREATE INDEX "ltr_service_loops_created_idx" ON "ltr_service_loops" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_service_loops_deleted_idx" ON "ltr_service_loops" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_tenant_idx" ON "ltr_slot_agreements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_slot_agreements_ref_tenant_idx" ON "ltr_slot_agreements" USING btree ("tenant_id","agreement_ref");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_partner_idx" ON "ltr_slot_agreements" USING btree ("tenant_id","partner_name");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_type_idx" ON "ltr_slot_agreements" USING btree ("tenant_id","agreement_type");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_status_idx" ON "ltr_slot_agreements" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_effective_idx" ON "ltr_slot_agreements" USING btree ("tenant_id","effective_from");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_created_idx" ON "ltr_slot_agreements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_slot_agreements_deleted_idx" ON "ltr_slot_agreements" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ltr_trade_lane_pnl_tenant_idx" ON "ltr_trade_lane_pnl" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ltr_trade_lane_pnl_ref_tenant_idx" ON "ltr_trade_lane_pnl" USING btree ("tenant_id","pnl_ref");--> statement-breakpoint
CREATE INDEX "ltr_trade_lane_pnl_tl_idx" ON "ltr_trade_lane_pnl" USING btree ("tenant_id","trade_lane_id");--> statement-breakpoint
CREATE INDEX "ltr_trade_lane_pnl_period_idx" ON "ltr_trade_lane_pnl" USING btree ("tenant_id","period_start");--> statement-breakpoint
CREATE INDEX "ltr_trade_lane_pnl_status_idx" ON "ltr_trade_lane_pnl" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ltr_trade_lane_pnl_created_idx" ON "ltr_trade_lane_pnl" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ltr_trade_lane_pnl_deleted_idx" ON "ltr_trade_lane_pnl" USING btree ("deleted_at");