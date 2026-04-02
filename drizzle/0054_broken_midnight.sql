CREATE TABLE "thm_cargo_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(100) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"hub_port" varchar(100),
	"origin_port" varchar(100),
	"destination_port" varchar(100),
	"mother_vessel" varchar(255),
	"feeder_vessel" varchar(255),
	"container_count" integer,
	"teu_volume" numeric(10, 2),
	"planned_transfer_date" timestamp with time zone,
	"dwell_time_days" numeric(8, 2),
	"priority" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thm_cargo_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tracking_ref" varchar(100) NOT NULL,
	"tracking_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"booking_ref" varchar(100),
	"hub_port" varchar(100),
	"current_location" varchar(255),
	"inbound_vessel" varchar(255),
	"outbound_vessel" varchar(255),
	"discharge_time" timestamp with time zone,
	"load_time" timestamp with time zone,
	"yard_position" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thm_feeder_coordinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"coordination_ref" varchar(100) NOT NULL,
	"coordination_type" varchar(50) NOT NULL,
	"feeder_vessel" varchar(255),
	"feeder_service" varchar(100),
	"mother_vessel" varchar(255),
	"hub_port" varchar(100),
	"eta_feeder" timestamp with time zone,
	"etd_feeder" timestamp with time zone,
	"connection_window_hours" numeric(8, 2),
	"cargo_units" integer,
	"buffer_hours" numeric(8, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thm_hub_efficiencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"efficiency_ref" varchar(100) NOT NULL,
	"efficiency_type" varchar(50) NOT NULL,
	"hub_port" varchar(100),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"throughput_teu" numeric(12, 2),
	"avg_dwell_hours" numeric(8, 2),
	"crane_moves_per_hour" numeric(8, 2),
	"berth_utilization_pct" numeric(5, 2),
	"yard_occupancy_pct" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thm_missed_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connection_ref" varchar(100) NOT NULL,
	"connection_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"hub_port" varchar(100),
	"original_vessel" varchar(255),
	"recovery_vessel" varchar(255),
	"missed_date" timestamp with time zone,
	"recovery_date" timestamp with time zone,
	"delay_days" numeric(8, 2),
	"additional_cost" numeric(14, 2),
	"currency" varchar(3),
	"recovered" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thm_optimization_engines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"engine_ref" varchar(100) NOT NULL,
	"engine_type" varchar(50) NOT NULL,
	"hub_port" varchar(100),
	"scenario_name" varchar(255),
	"current_cost" numeric(14, 2),
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
CREATE TABLE "thm_penalty_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"penalty_ref" varchar(100) NOT NULL,
	"penalty_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"booking_ref" varchar(100),
	"hub_port" varchar(100),
	"dwell_days" numeric(8, 2),
	"threshold_days" numeric(8, 2),
	"penalty_amount" numeric(14, 2),
	"currency" varchar(3),
	"charged_to" varchar(255),
	"waived" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thm_revenue_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"attribution_ref" varchar(100) NOT NULL,
	"attribution_type" varchar(50) NOT NULL,
	"booking_ref" varchar(100),
	"hub_port" varchar(100),
	"leg_from" varchar(100),
	"leg_to" varchar(100),
	"freight_revenue" numeric(14, 2),
	"handling_cost" numeric(14, 2),
	"hub_cost" numeric(14, 2),
	"net_margin" numeric(14, 2),
	"currency" varchar(3),
	"margin_pct" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "thm_cargo_plans" ADD CONSTRAINT "thm_cargo_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_cargo_trackings" ADD CONSTRAINT "thm_cargo_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_feeder_coordinations" ADD CONSTRAINT "thm_feeder_coordinations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_hub_efficiencies" ADD CONSTRAINT "thm_hub_efficiencies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_missed_connections" ADD CONSTRAINT "thm_missed_connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_optimization_engines" ADD CONSTRAINT "thm_optimization_engines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_penalty_trackings" ADD CONSTRAINT "thm_penalty_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thm_revenue_attributions" ADD CONSTRAINT "thm_revenue_attributions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;