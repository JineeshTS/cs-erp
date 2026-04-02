CREATE TABLE "svp_canal_transits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transit_ref" varchar(100) NOT NULL,
	"transit_type" varchar(50) NOT NULL,
	"canal_name" varchar(100),
	"vessel_name" varchar(255),
	"booking_number" varchar(50),
	"scheduled_date" timestamp with time zone,
	"actual_date" timestamp with time zone,
	"transit_fee" numeric(14, 2),
	"currency" varchar(3),
	"convoy_position" integer,
	"pilot_required" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_deployment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(100) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"trade_route" varchar(100),
	"deployment_start" timestamp with time zone,
	"deployment_end" timestamp with time zone,
	"vessel_capacity_teu" integer,
	"expected_utilization_pct" numeric(5, 2),
	"daily_cost_usd" numeric(14, 2),
	"revenue_projection" numeric(14, 2),
	"currency" varchar(3),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_eta_managements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"eta_ref" varchar(100) NOT NULL,
	"eta_type" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"port_code" varchar(10),
	"port_name" varchar(255),
	"original_eta" timestamp with time zone,
	"revised_eta" timestamp with time zone,
	"actual_arrival" timestamp with time zone,
	"delay_hours" numeric(8, 2),
	"delay_reason" varchar(255),
	"notification_sent" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_port_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sequence_ref" varchar(100) NOT NULL,
	"sequence_type" varchar(50) NOT NULL,
	"port_code" varchar(10),
	"port_name" varchar(255),
	"terminal_name" varchar(255),
	"berth_number" varchar(20),
	"window_start" timestamp with time zone,
	"window_end" timestamp with time zone,
	"sequence_order" integer,
	"dwell_hours" numeric(8, 2),
	"cargo_moves_planned" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_service_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"schedule_ref" varchar(100) NOT NULL,
	"schedule_type" varchar(50) NOT NULL,
	"service_name" varchar(255),
	"service_code" varchar(20),
	"trade_route" varchar(100),
	"vessel_name" varchar(255),
	"frequency_days" integer,
	"port_count" integer,
	"transit_time_days" integer,
	"published_at" timestamp with time zone,
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_speed_fuel_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analysis_ref" varchar(100) NOT NULL,
	"analysis_type" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_ref" varchar(100),
	"speed_knots" numeric(6, 2),
	"fuel_consumption_mt" numeric(10, 2),
	"fuel_cost_per_day" numeric(14, 2),
	"time_saving_hours" numeric(8, 2),
	"co2_emissions_mt" numeric(10, 2),
	"currency" varchar(3),
	"optimal_speed" numeric(6, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_voyage_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"optimization_ref" varchar(100) NOT NULL,
	"optimization_type" varchar(50) NOT NULL,
	"voyage_ref" varchar(100),
	"vessel_name" varchar(255),
	"original_cost" numeric(14, 2),
	"optimized_cost" numeric(14, 2),
	"savings_amount" numeric(14, 2),
	"savings_pct" numeric(5, 2),
	"currency" varchar(3),
	"model_version" varchar(50),
	"confidence_score" numeric(5, 2),
	"accepted" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "svp_weather_routings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"routing_ref" varchar(100) NOT NULL,
	"routing_type" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_ref" varchar(100),
	"departure_port" varchar(10),
	"arrival_port" varchar(10),
	"recommended_route" text,
	"distance_nm" numeric(10, 2),
	"weather_severity" varchar(20),
	"wave_height_m" numeric(5, 2),
	"wind_speed_knots" numeric(6, 2),
	"route_provider" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "svp_canal_transits" ADD CONSTRAINT "svp_canal_transits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_deployment_plans" ADD CONSTRAINT "svp_deployment_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_eta_managements" ADD CONSTRAINT "svp_eta_managements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_port_sequences" ADD CONSTRAINT "svp_port_sequences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_service_schedules" ADD CONSTRAINT "svp_service_schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_speed_fuel_analyses" ADD CONSTRAINT "svp_speed_fuel_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_voyage_optimizations" ADD CONSTRAINT "svp_voyage_optimizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "svp_weather_routings" ADD CONSTRAINT "svp_weather_routings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;