CREATE TABLE "lrm_cargo_mixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"mix_ref" varchar(100) NOT NULL,
	"mix_type" varchar(50) NOT NULL,
	"trade_lane" varchar(100),
	"commodity_group" varchar(100),
	"dry_cargo_teu" integer,
	"reefer_teu" integer,
	"special_cargo_teu" integer,
	"total_teu" integer,
	"revenue_contribution" numeric(14, 2),
	"margin_pct" numeric(5, 2),
	"currency" varchar(3),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_demand_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"forecast_ref" varchar(100) NOT NULL,
	"forecast_type" varchar(50) NOT NULL,
	"trade_lane" varchar(100),
	"origin_region" varchar(100),
	"destination_region" varchar(100),
	"forecast_period" varchar(20),
	"predicted_teu" integer,
	"actual_teu" integer,
	"confidence_pct" numeric(5, 2),
	"accuracy_pct" numeric(5, 2),
	"model_version" varchar(50),
	"forecast_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_freight_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_ref" varchar(100) NOT NULL,
	"contract_type" varchar(50) NOT NULL,
	"counterparty" varchar(255),
	"trade_lane" varchar(100),
	"contracted_rate" numeric(14, 2),
	"spot_rate" numeric(14, 2),
	"currency" varchar(3),
	"volume_teu" integer,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"settlement_basis" varchar(50),
	"index_reference" varchar(100),
	"mark_to_market_value" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_leakage_detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"leakage_ref" varchar(100) NOT NULL,
	"leakage_type" varchar(50) NOT NULL,
	"booking_ref" varchar(100),
	"customer_name" varchar(255),
	"expected_amount" numeric(14, 2),
	"actual_amount" numeric(14, 2),
	"leakage_amount" numeric(14, 2),
	"currency" varchar(3),
	"detected_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"root_cause" text,
	"recovery_action" varchar(100),
	"recovered" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_maximization_engines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"engine_ref" varchar(100) NOT NULL,
	"engine_type" varchar(50) NOT NULL,
	"trade_lane" varchar(100),
	"model_name" varchar(100),
	"model_version" varchar(50),
	"recommended_rate" numeric(14, 2),
	"current_rate" numeric(14, 2),
	"uplift_pct" numeric(5, 2),
	"confidence_score" numeric(5, 2),
	"currency" varchar(3),
	"simulation_run_at" timestamp with time zone,
	"accepted_recommendation" boolean,
	"revenue_impact" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_rate_integrities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"integrity_ref" varchar(100) NOT NULL,
	"integrity_type" varchar(50) NOT NULL,
	"trade_lane" varchar(100),
	"customer_name" varchar(255),
	"published_rate" numeric(14, 2),
	"applied_rate" numeric(14, 2),
	"discount_pct" numeric(5, 2),
	"max_allowed_discount" numeric(5, 2),
	"currency" varchar(3),
	"authorized" boolean,
	"authorized_by" varchar(255),
	"violation_severity" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_revenue_accruals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"accrual_ref" varchar(100) NOT NULL,
	"accrual_type" varchar(50) NOT NULL,
	"voyage_ref" varchar(100),
	"customer_name" varchar(255),
	"accrual_amount" numeric(14, 2),
	"billed_amount" numeric(14, 2),
	"variance_amount" numeric(14, 2),
	"currency" varchar(3),
	"accrual_period" varchar(20),
	"recognition_date" timestamp with time zone,
	"reversal_date" timestamp with time zone,
	"gl_account_code" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lrm_teu_maximizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"strategy_ref" varchar(100) NOT NULL,
	"strategy_type" varchar(50) NOT NULL,
	"trade_lane" varchar(100),
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"current_revenue_teu" numeric(14, 2),
	"target_revenue_teu" numeric(14, 2),
	"achieved_revenue_teu" numeric(14, 2),
	"currency" varchar(3),
	"teu_volume" integer,
	"utilization_pct" numeric(5, 2),
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"approved_by" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "lrm_cargo_mixes" ADD CONSTRAINT "lrm_cargo_mixes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_demand_forecasts" ADD CONSTRAINT "lrm_demand_forecasts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_freight_contracts" ADD CONSTRAINT "lrm_freight_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_leakage_detections" ADD CONSTRAINT "lrm_leakage_detections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_maximization_engines" ADD CONSTRAINT "lrm_maximization_engines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_rate_integrities" ADD CONSTRAINT "lrm_rate_integrities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_revenue_accruals" ADD CONSTRAINT "lrm_revenue_accruals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lrm_teu_maximizations" ADD CONSTRAINT "lrm_teu_maximizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;