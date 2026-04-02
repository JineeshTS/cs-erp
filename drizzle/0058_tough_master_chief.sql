CREATE TABLE "fdp_deployment_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_ref" varchar(100) NOT NULL,
	"contract_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"counterparty" varchar(255),
	"vessel_name" varchar(255),
	"trade_lane" varchar(255),
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"contract_value" numeric(14, 2),
	"slot_capacity" integer,
	"renewal_date" timestamp with time zone,
	"is_auto_renew" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fdp_deployment_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"decision_ref" varchar(100) NOT NULL,
	"decision_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"current_trade" varchar(255),
	"proposed_trade" varchar(255),
	"effective_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"expected_tce" numeric(14, 2),
	"decision_score" numeric(5, 2),
	"approved_by" varchar(255),
	"approved_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fdp_deployment_optimizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"optimizer_ref" varchar(100) NOT NULL,
	"optimizer_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"scenario_name" varchar(255),
	"objective_function" varchar(100),
	"constraints" text,
	"vessel_count" integer,
	"trade_count" integer,
	"optimal_tce" numeric(14, 2),
	"improvement_pct" numeric(5, 2),
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
CREATE TABLE "fdp_fleet_financials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"financial_ref" varchar(100) NOT NULL,
	"financial_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"vessel_type" varchar(100),
	"capacity_teu" integer,
	"acquisition_cost" numeric(14, 2),
	"current_value" numeric(14, 2),
	"annual_opex" numeric(14, 2),
	"npv_result" numeric(14, 2),
	"irr_pct" numeric(5, 2),
	"payback_years" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fdp_fleet_utilizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"utilization_ref" varchar(100) NOT NULL,
	"utilization_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"total_capacity_teu" integer,
	"utilized_capacity_teu" integer,
	"utilization_pct" numeric(5, 2),
	"idle_days" numeric(8, 2),
	"vessel_count" integer,
	"trade_lane" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fdp_market_intelligence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"intel_ref" varchar(100) NOT NULL,
	"intel_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"trade_lane" varchar(255),
	"source" varchar(255),
	"report_date" timestamp with time zone,
	"current_rate" numeric(14, 2),
	"forecast_rate" numeric(14, 2),
	"change_percent" numeric(5, 2),
	"market_sentiment" varchar(50),
	"summary" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fdp_network_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"network_ref" varchar(100) NOT NULL,
	"network_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"service_name" varchar(255),
	"port_rotation" text,
	"round_trip_days" integer,
	"vessel_count" integer,
	"weekly_frequency" numeric(5, 2),
	"estimated_revenue" numeric(14, 2),
	"estimated_cost" numeric(14, 2),
	"net_contribution" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fdp_vessel_swaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"swap_ref" varchar(100) NOT NULL,
	"swap_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"outgoing_vessel" varchar(255),
	"incoming_vessel" varchar(255),
	"trade_lane" varchar(255),
	"swap_date" timestamp with time zone,
	"reason" text,
	"cost_impact" numeric(14, 2),
	"capacity_change" integer,
	"is_approved" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "fdp_deployment_contracts" ADD CONSTRAINT "fdp_deployment_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_deployment_decisions" ADD CONSTRAINT "fdp_deployment_decisions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_deployment_optimizers" ADD CONSTRAINT "fdp_deployment_optimizers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_fleet_financials" ADD CONSTRAINT "fdp_fleet_financials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_fleet_utilizations" ADD CONSTRAINT "fdp_fleet_utilizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_market_intelligence" ADD CONSTRAINT "fdp_market_intelligence_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_network_designs" ADD CONSTRAINT "fdp_network_designs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fdp_vessel_swaps" ADD CONSTRAINT "fdp_vessel_swaps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;