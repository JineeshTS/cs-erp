CREATE TABLE "ecr_cost_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cost_ref" varchar(100) NOT NULL,
	"cost_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"plan_ref" varchar(100),
	"container_type" varchar(50),
	"quantity" integer,
	"unit_cost" numeric(14, 2),
	"total_cost" numeric(14, 2),
	"currency" varchar(3),
	"approved_by" varchar(255),
	"approved_date" timestamp with time zone,
	"is_approved" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_demand_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"forecast_ref" varchar(100) NOT NULL,
	"forecast_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"trade_lane" varchar(255),
	"container_type" varchar(50),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"forecasted_demand" integer,
	"actual_demand" integer,
	"accuracy_pct" numeric(5, 2),
	"confidence_level" numeric(5, 2),
	"ai_model_version" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_inventory_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"snapshot_ref" varchar(100) NOT NULL,
	"snapshot_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"location_code" varchar(100),
	"location_name" varchar(255),
	"container_type" varchar(50),
	"available_count" integer,
	"damaged_count" integer,
	"total_count" integer,
	"avg_dwell_days" numeric(8, 2),
	"surplus_deficit" integer,
	"snapshot_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_leasing_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"decision_ref" varchar(100) NOT NULL,
	"decision_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"location_code" varchar(100),
	"container_type" varchar(50),
	"quantity" integer,
	"reposition_cost" numeric(14, 2),
	"leasing_cost" numeric(14, 2),
	"break_even_days" integer,
	"recommended_action" varchar(50),
	"savings_amount" numeric(14, 2),
	"ai_recommendation" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_pnl_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"attribution_ref" varchar(100) NOT NULL,
	"attribution_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"trade_lane" varchar(255),
	"repositioning_revenue" numeric(14, 2),
	"repositioning_cost" numeric(14, 2),
	"net_pnl" numeric(14, 2),
	"total_moves" integer,
	"cost_per_move" numeric(14, 2),
	"revenue_per_move" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_repositioning_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(100) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"container_type" varchar(50),
	"quantity" integer,
	"etd" timestamp with time zone,
	"eta" timestamp with time zone,
	"vessel_name" varchar(255),
	"voyage_ref" varchar(100),
	"estimated_cost" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_return_incentives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"incentive_ref" varchar(100) NOT NULL,
	"incentive_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"customer_name" varchar(255),
	"trade_lane" varchar(255),
	"container_type" varchar(50),
	"target_location" varchar(255),
	"incentive_value" numeric(14, 2),
	"currency" varchar(3),
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"utilization_count" integer,
	"is_active" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ecr_route_optimizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"optimizer_ref" varchar(100) NOT NULL,
	"optimizer_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"scenario_name" varchar(255),
	"origin_ports" text,
	"destination_ports" text,
	"container_types" text,
	"objective_function" varchar(100),
	"total_savings" numeric(14, 2),
	"route_count" integer,
	"ai_recommendation" text,
	"run_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ecr_cost_trackings" ADD CONSTRAINT "ecr_cost_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_demand_forecasts" ADD CONSTRAINT "ecr_demand_forecasts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_inventory_snapshots" ADD CONSTRAINT "ecr_inventory_snapshots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_leasing_decisions" ADD CONSTRAINT "ecr_leasing_decisions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_pnl_attributions" ADD CONSTRAINT "ecr_pnl_attributions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_repositioning_plans" ADD CONSTRAINT "ecr_repositioning_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_return_incentives" ADD CONSTRAINT "ecr_return_incentives_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecr_route_optimizers" ADD CONSTRAINT "ecr_route_optimizers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;