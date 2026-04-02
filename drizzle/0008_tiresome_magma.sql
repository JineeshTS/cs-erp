CREATE TABLE "cap_bay_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid NOT NULL,
	"port_rotation_id" uuid,
	"baplie_version" varchar(20) DEFAULT '2.2',
	"plan_type" varchar(20) DEFAULT 'pre_stow' NOT NULL,
	"total_slots" integer DEFAULT 0,
	"occupied_slots" integer DEFAULT 0,
	"utilization_percent" numeric(5, 2),
	"file_reference" varchar(255),
	"baplie_data" jsonb,
	"submitted_at" timestamp with time zone,
	"validated_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_demand_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"trade_lane" varchar(100) NOT NULL,
	"origin_region" varchar(100),
	"destination_region" varchar(100),
	"forecast_period_start" timestamp with time zone NOT NULL,
	"forecast_period_end" timestamp with time zone NOT NULL,
	"forecasted_demand_teu" integer,
	"actual_demand_teu" integer,
	"available_capacity_teu" integer,
	"utilization_forecast_percent" numeric(5, 2),
	"confidence_level" numeric(5, 2),
	"methodology" varchar(20) DEFAULT 'historical' NOT NULL,
	"season_factor" numeric(5, 2),
	"market_conditions" jsonb,
	"recommendations" jsonb,
	"ai_model" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_load_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid,
	"optimization_run_id" varchar(50),
	"algorithm" varchar(50) DEFAULT 'genetic',
	"objective" varchar(30) DEFAULT 'maximize_teu' NOT NULL,
	"input_parameters" jsonb,
	"results" jsonb,
	"total_teu_before" integer,
	"total_teu_after" integer,
	"improvement_percent" numeric(5, 2),
	"revenue_impact" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"ai_model" varchar(100),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_loading_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid NOT NULL,
	"port_rotation_id" uuid,
	"list_reference" varchar(50) NOT NULL,
	"list_type" varchar(20) DEFAULT 'preliminary' NOT NULL,
	"total_containers" integer DEFAULT 0,
	"total_teu" integer DEFAULT 0,
	"total_weight_mt" integer DEFAULT 0,
	"hazmat_count" integer DEFAULT 0,
	"reefer_count" integer DEFAULT 0,
	"oog_count" integer DEFAULT 0,
	"cut_off_cargo" timestamp with time zone,
	"cut_off_documentation" timestamp with time zone,
	"cut_off_vgm" timestamp with time zone,
	"published_at" timestamp with time zone,
	"containers" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_port_rotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"sequence_number" integer NOT NULL,
	"arrival_eta" timestamp with time zone,
	"departure_etd" timestamp with time zone,
	"actual_arrival" timestamp with time zone,
	"actual_departure" timestamp with time zone,
	"terminal_name" varchar(255),
	"berth_name" varchar(100),
	"call_purpose" varchar(30) DEFAULT 'both' NOT NULL,
	"time_zone" varchar(50),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_revenue_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid,
	"trade_lane" varchar(100),
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"period_from" timestamp with time zone NOT NULL,
	"period_to" timestamp with time zone NOT NULL,
	"total_teu" integer,
	"total_revenue" integer,
	"revenue_per_teu" integer,
	"average_rate" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"container_type_breakdown" jsonb,
	"commodity_breakdown" jsonb,
	"comparison_previous_period" jsonb,
	"calculated_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_schedule_performances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid,
	"port_rotation_id" uuid,
	"port_name" varchar(255),
	"scheduled_arrival" timestamp with time zone,
	"actual_arrival" timestamp with time zone,
	"scheduled_departure" timestamp with time zone,
	"actual_departure" timestamp with time zone,
	"arrival_delay_hours" numeric(8, 2),
	"departure_delay_hours" numeric(8, 2),
	"delay_reason" varchar(255),
	"on_time_arrival" boolean,
	"on_time_departure" boolean,
	"bunker_consumption_mt" numeric(10, 2),
	"speed_knots" numeric(5, 1),
	"distance_nm" numeric(10, 1),
	"weather_conditions" varchar(50),
	"sea_state" varchar(20),
	"reliability_score" numeric(5, 2),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"status" varchar(20) DEFAULT 'recorded' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_space_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid,
	"port_rotation_id" uuid,
	"booking_reference" varchar(50) NOT NULL,
	"container_type" varchar(20) NOT NULL,
	"container_size" varchar(10) NOT NULL,
	"quantity_teu" integer NOT NULL,
	"weight_mt" integer,
	"shipper_name" varchar(255),
	"consignee_name" varchar(255),
	"commodity" varchar(255),
	"hazmat_class" varchar(10),
	"reefer_temp" numeric(5, 1),
	"oog_dimensions" jsonb,
	"booking_date" timestamp with time zone,
	"cut_off_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_stowage_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid,
	"bay_plan_id" uuid,
	"container_number" varchar(20) NOT NULL,
	"container_type" varchar(20),
	"container_size" varchar(10),
	"iso_code" varchar(10),
	"weight_kg" integer,
	"bay_number" integer,
	"row_number" integer,
	"tier_number" integer,
	"is_hazmat" boolean DEFAULT false,
	"hazmat_class" varchar(10),
	"is_reefer" boolean DEFAULT false,
	"reefer_temp" numeric(5, 1),
	"is_oog" boolean DEFAULT false,
	"oog_height_cm" integer,
	"oog_width_cm" integer,
	"pol" varchar(10),
	"pod" varchar(10),
	"stacking_order" integer,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_trade_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_schedule_id" uuid,
	"trade_lane" varchar(100) NOT NULL,
	"origin_region" varchar(100),
	"destination_region" varchar(100),
	"allocated_teu" integer NOT NULL,
	"allocated_weight_mt" integer,
	"utilized_teu" integer DEFAULT 0,
	"utilized_weight_mt" integer DEFAULT 0,
	"allocation_type" varchar(20) DEFAULT 'contract' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"priority" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_transshipment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_reference" varchar(50),
	"container_number" varchar(20),
	"origin_port" varchar(255) NOT NULL,
	"transshipment_port" varchar(255) NOT NULL,
	"destination_port" varchar(255) NOT NULL,
	"first_vessel_schedule_id" uuid,
	"second_vessel_schedule_id" uuid,
	"expected_arrival" timestamp with time zone,
	"expected_connection" timestamp with time zone,
	"dwell_days" integer,
	"connection_type" varchar(20) DEFAULT 'direct',
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"coordination_notes" text,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_vessel_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(10),
	"service_name" varchar(255) NOT NULL,
	"trade_lane" varchar(100),
	"schedule_type" varchar(30) DEFAULT 'regular' NOT NULL,
	"validity_from" timestamp with time zone NOT NULL,
	"validity_to" timestamp with time zone,
	"frequency" varchar(20) DEFAULT 'weekly',
	"total_capacity_teu" integer,
	"total_weight_mt" integer,
	"operator_name" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cap_bay_plans" ADD CONSTRAINT "cap_bay_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_bay_plans" ADD CONSTRAINT "cap_bay_plans_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_bay_plans" ADD CONSTRAINT "cap_bay_plans_port_rotation_id_cap_port_rotations_id_fk" FOREIGN KEY ("port_rotation_id") REFERENCES "public"."cap_port_rotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_demand_forecasts" ADD CONSTRAINT "cap_demand_forecasts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_load_optimizations" ADD CONSTRAINT "cap_load_optimizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_load_optimizations" ADD CONSTRAINT "cap_load_optimizations_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_loading_lists" ADD CONSTRAINT "cap_loading_lists_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_loading_lists" ADD CONSTRAINT "cap_loading_lists_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_loading_lists" ADD CONSTRAINT "cap_loading_lists_port_rotation_id_cap_port_rotations_id_fk" FOREIGN KEY ("port_rotation_id") REFERENCES "public"."cap_port_rotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_port_rotations" ADD CONSTRAINT "cap_port_rotations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_port_rotations" ADD CONSTRAINT "cap_port_rotations_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_revenue_analytics" ADD CONSTRAINT "cap_revenue_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_revenue_analytics" ADD CONSTRAINT "cap_revenue_analytics_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_schedule_performances" ADD CONSTRAINT "cap_schedule_performances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_schedule_performances" ADD CONSTRAINT "cap_schedule_performances_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_schedule_performances" ADD CONSTRAINT "cap_schedule_performances_port_rotation_id_cap_port_rotations_id_fk" FOREIGN KEY ("port_rotation_id") REFERENCES "public"."cap_port_rotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_space_controls" ADD CONSTRAINT "cap_space_controls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_space_controls" ADD CONSTRAINT "cap_space_controls_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_space_controls" ADD CONSTRAINT "cap_space_controls_port_rotation_id_cap_port_rotations_id_fk" FOREIGN KEY ("port_rotation_id") REFERENCES "public"."cap_port_rotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_stowage_plans" ADD CONSTRAINT "cap_stowage_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_stowage_plans" ADD CONSTRAINT "cap_stowage_plans_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_stowage_plans" ADD CONSTRAINT "cap_stowage_plans_bay_plan_id_cap_bay_plans_id_fk" FOREIGN KEY ("bay_plan_id") REFERENCES "public"."cap_bay_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_trade_allocations" ADD CONSTRAINT "cap_trade_allocations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_trade_allocations" ADD CONSTRAINT "cap_trade_allocations_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_transshipment_plans" ADD CONSTRAINT "cap_transshipment_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_transshipment_plans" ADD CONSTRAINT "cap_transshipment_plans_first_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("first_vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_transshipment_plans" ADD CONSTRAINT "cap_transshipment_plans_second_vessel_schedule_id_cap_vessel_schedules_id_fk" FOREIGN KEY ("second_vessel_schedule_id") REFERENCES "public"."cap_vessel_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cap_vessel_schedules" ADD CONSTRAINT "cap_vessel_schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cap_bay_plans_tenant_id_idx" ON "cap_bay_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_bay_plans_schedule_idx" ON "cap_bay_plans" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_bay_plans_port_idx" ON "cap_bay_plans" USING btree ("port_rotation_id");--> statement-breakpoint
CREATE INDEX "cap_bay_plans_status_idx" ON "cap_bay_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_bay_plans_type_idx" ON "cap_bay_plans" USING btree ("plan_type");--> statement-breakpoint
CREATE INDEX "cap_demand_forecasts_tenant_id_idx" ON "cap_demand_forecasts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_demand_forecasts_trade_lane_idx" ON "cap_demand_forecasts" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cap_demand_forecasts_period_idx" ON "cap_demand_forecasts" USING btree ("forecast_period_start","forecast_period_end");--> statement-breakpoint
CREATE INDEX "cap_demand_forecasts_methodology_idx" ON "cap_demand_forecasts" USING btree ("methodology");--> statement-breakpoint
CREATE INDEX "cap_demand_forecasts_status_idx" ON "cap_demand_forecasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_load_optimizations_tenant_id_idx" ON "cap_load_optimizations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_load_optimizations_schedule_idx" ON "cap_load_optimizations" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_load_optimizations_status_idx" ON "cap_load_optimizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_load_optimizations_objective_idx" ON "cap_load_optimizations" USING btree ("objective");--> statement-breakpoint
CREATE INDEX "cap_load_optimizations_run_idx" ON "cap_load_optimizations" USING btree ("optimization_run_id");--> statement-breakpoint
CREATE INDEX "cap_loading_lists_tenant_id_idx" ON "cap_loading_lists" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_loading_lists_schedule_idx" ON "cap_loading_lists" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_loading_lists_port_idx" ON "cap_loading_lists" USING btree ("port_rotation_id");--> statement-breakpoint
CREATE INDEX "cap_loading_lists_ref_idx" ON "cap_loading_lists" USING btree ("list_reference");--> statement-breakpoint
CREATE INDEX "cap_loading_lists_status_idx" ON "cap_loading_lists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_loading_lists_type_idx" ON "cap_loading_lists" USING btree ("list_type");--> statement-breakpoint
CREATE INDEX "cap_port_rotations_tenant_id_idx" ON "cap_port_rotations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_port_rotations_schedule_idx" ON "cap_port_rotations" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_port_rotations_port_code_idx" ON "cap_port_rotations" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "cap_port_rotations_status_idx" ON "cap_port_rotations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_port_rotations_sequence_idx" ON "cap_port_rotations" USING btree ("vessel_schedule_id","sequence_number");--> statement-breakpoint
CREATE INDEX "cap_revenue_analytics_tenant_id_idx" ON "cap_revenue_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_revenue_analytics_schedule_idx" ON "cap_revenue_analytics" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_revenue_analytics_trade_lane_idx" ON "cap_revenue_analytics" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cap_revenue_analytics_period_idx" ON "cap_revenue_analytics" USING btree ("period_from","period_to");--> statement-breakpoint
CREATE INDEX "cap_revenue_analytics_status_idx" ON "cap_revenue_analytics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_schedule_performances_tenant_id_idx" ON "cap_schedule_performances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_schedule_performances_schedule_idx" ON "cap_schedule_performances" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_schedule_performances_port_idx" ON "cap_schedule_performances" USING btree ("port_rotation_id");--> statement-breakpoint
CREATE INDEX "cap_schedule_performances_status_idx" ON "cap_schedule_performances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_schedule_performances_period_idx" ON "cap_schedule_performances" USING btree ("period_from","period_to");--> statement-breakpoint
CREATE INDEX "cap_space_controls_tenant_id_idx" ON "cap_space_controls" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_space_controls_schedule_idx" ON "cap_space_controls" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_space_controls_port_idx" ON "cap_space_controls" USING btree ("port_rotation_id");--> statement-breakpoint
CREATE INDEX "cap_space_controls_booking_ref_idx" ON "cap_space_controls" USING btree ("booking_reference");--> statement-breakpoint
CREATE INDEX "cap_space_controls_status_idx" ON "cap_space_controls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_space_controls_container_type_idx" ON "cap_space_controls" USING btree ("container_type");--> statement-breakpoint
CREATE INDEX "cap_stowage_plans_tenant_id_idx" ON "cap_stowage_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_stowage_plans_schedule_idx" ON "cap_stowage_plans" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_stowage_plans_bay_plan_idx" ON "cap_stowage_plans" USING btree ("bay_plan_id");--> statement-breakpoint
CREATE INDEX "cap_stowage_plans_container_idx" ON "cap_stowage_plans" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "cap_stowage_plans_status_idx" ON "cap_stowage_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_stowage_plans_position_idx" ON "cap_stowage_plans" USING btree ("bay_number","row_number","tier_number");--> statement-breakpoint
CREATE INDEX "cap_trade_allocations_tenant_id_idx" ON "cap_trade_allocations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_trade_allocations_schedule_idx" ON "cap_trade_allocations" USING btree ("vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_trade_allocations_trade_lane_idx" ON "cap_trade_allocations" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cap_trade_allocations_type_idx" ON "cap_trade_allocations" USING btree ("allocation_type");--> statement-breakpoint
CREATE INDEX "cap_trade_allocations_status_idx" ON "cap_trade_allocations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_transshipment_plans_tenant_id_idx" ON "cap_transshipment_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_transshipment_plans_first_vessel_idx" ON "cap_transshipment_plans" USING btree ("first_vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_transshipment_plans_second_vessel_idx" ON "cap_transshipment_plans" USING btree ("second_vessel_schedule_id");--> statement-breakpoint
CREATE INDEX "cap_transshipment_plans_ts_port_idx" ON "cap_transshipment_plans" USING btree ("transshipment_port");--> statement-breakpoint
CREATE INDEX "cap_transshipment_plans_status_idx" ON "cap_transshipment_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_transshipment_plans_container_idx" ON "cap_transshipment_plans" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "cap_vessel_schedules_tenant_id_idx" ON "cap_vessel_schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cap_vessel_schedules_service_idx" ON "cap_vessel_schedules" USING btree ("service_name");--> statement-breakpoint
CREATE INDEX "cap_vessel_schedules_trade_lane_idx" ON "cap_vessel_schedules" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cap_vessel_schedules_status_idx" ON "cap_vessel_schedules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cap_vessel_schedules_vessel_imo_idx" ON "cap_vessel_schedules" USING btree ("vessel_imo");--> statement-breakpoint
CREATE INDEX "cap_vessel_schedules_validity_idx" ON "cap_vessel_schedules" USING btree ("validity_from","validity_to");