CREATE TABLE "cpm_ai_pricing_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"model_name" varchar(255) NOT NULL,
	"model_code" varchar(50) NOT NULL,
	"model_type" varchar(30) NOT NULL,
	"trade_lane" varchar(100),
	"input_features" jsonb,
	"output_format" jsonb,
	"training_data_from" date,
	"training_data_to" date,
	"accuracy" integer,
	"confidence_threshold" integer,
	"last_trained_at" timestamp with time zone,
	"last_prediction_at" timestamp with time zone,
	"predicted_rate" integer,
	"suggested_rate" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"is_active" boolean DEFAULT true,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_dead_freight_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_reference" varchar(50) NOT NULL,
	"voyage_reference" varchar(50),
	"booking_reference" varchar(50),
	"customer_id" uuid,
	"trade_lane" varchar(100),
	"booked_teu" integer NOT NULL,
	"actual_teu" integer NOT NULL,
	"short_shipped_teu" integer NOT NULL,
	"rate_per_teu" integer NOT NULL,
	"dead_freight_amount" integer NOT NULL,
	"recovered_amount" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'USD',
	"waiver_reason" varchar(255),
	"waived_amount" integer DEFAULT 0,
	"invoice_id" uuid,
	"status" varchar(20) DEFAULT 'calculated' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_detention_demurrage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tariff_code" varchar(50) NOT NULL,
	"tariff_name" varchar(255) NOT NULL,
	"charge_type" varchar(20) NOT NULL,
	"port_code" varchar(10),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"free_time_days" integer DEFAULT 0 NOT NULL,
	"daily_rate" integer NOT NULL,
	"escalation_rate" integer,
	"escalation_after_days" integer,
	"maximum_days" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"customer_segment" varchar(50),
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_pricing_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"approval_reference" varchar(50) NOT NULL,
	"approval_type" varchar(30) NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"current_level" integer DEFAULT 1,
	"max_level" integer DEFAULT 1,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejected_by" uuid,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"deviation_percent" integer,
	"original_amount" integer,
	"requested_amount" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"urgency" varchar(20) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_profitability_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analysis_name" varchar(255) NOT NULL,
	"analysis_type" varchar(30) NOT NULL,
	"trade_lane" varchar(100),
	"customer_id" uuid,
	"voyage_id" uuid,
	"period_from" date NOT NULL,
	"period_to" date NOT NULL,
	"total_revenue" integer,
	"total_cost" integer,
	"gross_profit" integer,
	"margin_percent" integer,
	"teu_count" integer,
	"revenue_per_teu" integer,
	"cost_per_teu" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"recommendations" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_rate_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"benchmark_name" varchar(255) NOT NULL,
	"trade_lane" varchar(100) NOT NULL,
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"market_rate" integer NOT NULL,
	"our_rate" integer,
	"competitor_rate" integer,
	"competitor_name" varchar(255),
	"benchmark_source" varchar(100),
	"benchmark_date" date NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"variance_percent" integer,
	"trend" varchar(20),
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_revenue_leakages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"leakage_reference" varchar(50) NOT NULL,
	"leakage_type" varchar(30) NOT NULL,
	"detected_date" date NOT NULL,
	"booking_reference" varchar(50),
	"invoice_reference" varchar(50),
	"customer_id" uuid,
	"trade_lane" varchar(100),
	"expected_amount" integer NOT NULL,
	"actual_amount" integer NOT NULL,
	"leakage_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"root_cause" varchar(255),
	"correction_action" text,
	"recovered_amount" integer DEFAULT 0,
	"assigned_to" uuid,
	"resolved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'detected' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_special_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rate_code" varchar(50) NOT NULL,
	"rate_name" varchar(255) NOT NULL,
	"rate_type" varchar(30) DEFAULT 'contract' NOT NULL,
	"customer_id" uuid,
	"customer_segment" varchar(50),
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"trade_lane" varchar(100),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"base_rate" integer NOT NULL,
	"discount_percent" integer,
	"final_rate" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"minimum_commitment_teu" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_surcharges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"surcharge_code" varchar(30) NOT NULL,
	"surcharge_name" varchar(255) NOT NULL,
	"surcharge_type" varchar(30) NOT NULL,
	"calculation_basis" varchar(20) NOT NULL,
	"amount" integer,
	"percentage" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"applicable_to" varchar(30) DEFAULT 'all',
	"trade_lane" varchar(100),
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"is_mandatory" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_tariff_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tariff_id" uuid NOT NULL,
	"charge_code" varchar(30) NOT NULL,
	"charge_name" varchar(255) NOT NULL,
	"charge_type" varchar(30) NOT NULL,
	"basis" varchar(20) NOT NULL,
	"container_type" varchar(20),
	"container_size" varchar(10),
	"unit_price" integer NOT NULL,
	"minimum_charge" integer,
	"maximum_charge" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_tariffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tariff_code" varchar(50) NOT NULL,
	"tariff_name" varchar(255) NOT NULL,
	"tariff_type" varchar(30) DEFAULT 'standard' NOT NULL,
	"trade_lane" varchar(100),
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"service_type" varchar(30),
	"currency" varchar(3) DEFAULT 'USD',
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_vsa_slot_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vsa_partner" varchar(255) NOT NULL,
	"agreement_reference" varchar(50) NOT NULL,
	"trade_lane" varchar(100) NOT NULL,
	"service_name" varchar(255),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"slot_allocation_teu" integer,
	"slot_cost_per_teu" integer NOT NULL,
	"utilization_percent" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpm_yield_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"target_name" varchar(255) NOT NULL,
	"trade_lane" varchar(100) NOT NULL,
	"service_type" varchar(30),
	"fiscal_year" integer NOT NULL,
	"fiscal_quarter" integer,
	"target_revenue_per_teu" integer,
	"actual_revenue_per_teu" integer,
	"target_utilization_percent" integer,
	"actual_utilization_percent" integer,
	"target_teu" integer,
	"actual_teu" integer,
	"minimum_rate_threshold" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cpm_ai_pricing_models" ADD CONSTRAINT "cpm_ai_pricing_models_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_dead_freight_records" ADD CONSTRAINT "cpm_dead_freight_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_detention_demurrage" ADD CONSTRAINT "cpm_detention_demurrage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_pricing_approvals" ADD CONSTRAINT "cpm_pricing_approvals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_profitability_analyses" ADD CONSTRAINT "cpm_profitability_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_rate_benchmarks" ADD CONSTRAINT "cpm_rate_benchmarks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_revenue_leakages" ADD CONSTRAINT "cpm_revenue_leakages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_special_rates" ADD CONSTRAINT "cpm_special_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_surcharges" ADD CONSTRAINT "cpm_surcharges_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_tariff_rates" ADD CONSTRAINT "cpm_tariff_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_tariff_rates" ADD CONSTRAINT "cpm_tariff_rates_tariff_id_cpm_tariffs_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."cpm_tariffs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_tariffs" ADD CONSTRAINT "cpm_tariffs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_vsa_slot_rates" ADD CONSTRAINT "cpm_vsa_slot_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_yield_targets" ADD CONSTRAINT "cpm_yield_targets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cpm_ai_pricing_models_tenant_id_idx" ON "cpm_ai_pricing_models" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_ai_pricing_models_tenant_code_idx" ON "cpm_ai_pricing_models" USING btree ("tenant_id","model_code");--> statement-breakpoint
CREATE INDEX "cpm_ai_pricing_models_model_type_idx" ON "cpm_ai_pricing_models" USING btree ("model_type");--> statement-breakpoint
CREATE INDEX "cpm_ai_pricing_models_trade_lane_idx" ON "cpm_ai_pricing_models" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_dead_freight_records_tenant_id_idx" ON "cpm_dead_freight_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_dead_freight_records_tenant_ref_idx" ON "cpm_dead_freight_records" USING btree ("tenant_id","record_reference");--> statement-breakpoint
CREATE INDEX "cpm_dead_freight_records_customer_id_idx" ON "cpm_dead_freight_records" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cpm_dead_freight_records_voyage_ref_idx" ON "cpm_dead_freight_records" USING btree ("voyage_reference");--> statement-breakpoint
CREATE INDEX "cpm_dead_freight_records_status_idx" ON "cpm_dead_freight_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_detention_demurrage_tenant_id_idx" ON "cpm_detention_demurrage" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_detention_demurrage_tenant_code_idx" ON "cpm_detention_demurrage" USING btree ("tenant_id","tariff_code");--> statement-breakpoint
CREATE INDEX "cpm_detention_demurrage_charge_type_idx" ON "cpm_detention_demurrage" USING btree ("charge_type");--> statement-breakpoint
CREATE INDEX "cpm_detention_demurrage_port_code_idx" ON "cpm_detention_demurrage" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "cpm_detention_demurrage_status_idx" ON "cpm_detention_demurrage" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_pricing_approvals_tenant_id_idx" ON "cpm_pricing_approvals" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_pricing_approvals_tenant_ref_idx" ON "cpm_pricing_approvals" USING btree ("tenant_id","approval_reference");--> statement-breakpoint
CREATE INDEX "cpm_pricing_approvals_approval_type_idx" ON "cpm_pricing_approvals" USING btree ("approval_type");--> statement-breakpoint
CREATE INDEX "cpm_pricing_approvals_entity_id_idx" ON "cpm_pricing_approvals" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cpm_pricing_approvals_requested_by_idx" ON "cpm_pricing_approvals" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "cpm_pricing_approvals_status_idx" ON "cpm_pricing_approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_profitability_analyses_tenant_id_idx" ON "cpm_profitability_analyses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cpm_profitability_analyses_analysis_type_idx" ON "cpm_profitability_analyses" USING btree ("analysis_type");--> statement-breakpoint
CREATE INDEX "cpm_profitability_analyses_trade_lane_idx" ON "cpm_profitability_analyses" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_profitability_analyses_customer_id_idx" ON "cpm_profitability_analyses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cpm_profitability_analyses_status_idx" ON "cpm_profitability_analyses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_rate_benchmarks_tenant_id_idx" ON "cpm_rate_benchmarks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cpm_rate_benchmarks_trade_lane_idx" ON "cpm_rate_benchmarks" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_rate_benchmarks_benchmark_date_idx" ON "cpm_rate_benchmarks" USING btree ("benchmark_date");--> statement-breakpoint
CREATE INDEX "cpm_rate_benchmarks_container_type_idx" ON "cpm_rate_benchmarks" USING btree ("container_type");--> statement-breakpoint
CREATE INDEX "cpm_revenue_leakages_tenant_id_idx" ON "cpm_revenue_leakages" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_revenue_leakages_tenant_ref_idx" ON "cpm_revenue_leakages" USING btree ("tenant_id","leakage_reference");--> statement-breakpoint
CREATE INDEX "cpm_revenue_leakages_leakage_type_idx" ON "cpm_revenue_leakages" USING btree ("leakage_type");--> statement-breakpoint
CREATE INDEX "cpm_revenue_leakages_customer_id_idx" ON "cpm_revenue_leakages" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cpm_revenue_leakages_status_idx" ON "cpm_revenue_leakages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_revenue_leakages_detected_date_idx" ON "cpm_revenue_leakages" USING btree ("detected_date");--> statement-breakpoint
CREATE INDEX "cpm_special_rates_tenant_id_idx" ON "cpm_special_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_special_rates_tenant_code_idx" ON "cpm_special_rates" USING btree ("tenant_id","rate_code");--> statement-breakpoint
CREATE INDEX "cpm_special_rates_customer_id_idx" ON "cpm_special_rates" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cpm_special_rates_rate_type_idx" ON "cpm_special_rates" USING btree ("rate_type");--> statement-breakpoint
CREATE INDEX "cpm_special_rates_trade_lane_idx" ON "cpm_special_rates" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_special_rates_status_idx" ON "cpm_special_rates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_special_rates_effective_from_idx" ON "cpm_special_rates" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "cpm_surcharges_tenant_id_idx" ON "cpm_surcharges" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_surcharges_tenant_code_idx" ON "cpm_surcharges" USING btree ("tenant_id","surcharge_code");--> statement-breakpoint
CREATE INDEX "cpm_surcharges_surcharge_type_idx" ON "cpm_surcharges" USING btree ("surcharge_type");--> statement-breakpoint
CREATE INDEX "cpm_surcharges_trade_lane_idx" ON "cpm_surcharges" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_surcharges_effective_from_idx" ON "cpm_surcharges" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "cpm_tariff_rates_tenant_id_idx" ON "cpm_tariff_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cpm_tariff_rates_tariff_id_idx" ON "cpm_tariff_rates" USING btree ("tariff_id");--> statement-breakpoint
CREATE INDEX "cpm_tariff_rates_charge_code_idx" ON "cpm_tariff_rates" USING btree ("charge_code");--> statement-breakpoint
CREATE INDEX "cpm_tariffs_tenant_id_idx" ON "cpm_tariffs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_tariffs_tenant_code_idx" ON "cpm_tariffs" USING btree ("tenant_id","tariff_code");--> statement-breakpoint
CREATE INDEX "cpm_tariffs_tariff_type_idx" ON "cpm_tariffs" USING btree ("tariff_type");--> statement-breakpoint
CREATE INDEX "cpm_tariffs_trade_lane_idx" ON "cpm_tariffs" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_tariffs_status_idx" ON "cpm_tariffs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_tariffs_effective_from_idx" ON "cpm_tariffs" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "cpm_vsa_slot_rates_tenant_id_idx" ON "cpm_vsa_slot_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpm_vsa_slot_rates_tenant_ref_idx" ON "cpm_vsa_slot_rates" USING btree ("tenant_id","agreement_reference");--> statement-breakpoint
CREATE INDEX "cpm_vsa_slot_rates_vsa_partner_idx" ON "cpm_vsa_slot_rates" USING btree ("vsa_partner");--> statement-breakpoint
CREATE INDEX "cpm_vsa_slot_rates_trade_lane_idx" ON "cpm_vsa_slot_rates" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_vsa_slot_rates_status_idx" ON "cpm_vsa_slot_rates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpm_yield_targets_tenant_id_idx" ON "cpm_yield_targets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cpm_yield_targets_trade_lane_idx" ON "cpm_yield_targets" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "cpm_yield_targets_fiscal_year_idx" ON "cpm_yield_targets" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "cpm_yield_targets_status_idx" ON "cpm_yield_targets" USING btree ("status");