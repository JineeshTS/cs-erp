CREATE TABLE "bfm_bunker_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"voyage_ref" varchar(50),
	"supplier_name" varchar(255) NOT NULL,
	"supplier_code" varchar(50),
	"port" varchar(50) NOT NULL,
	"delivery_date" timestamp with time zone,
	"fuel_type" varchar(30) NOT NULL,
	"fuel_grade" varchar(30),
	"quantity_ordered" integer NOT NULL,
	"quantity_delivered" integer,
	"unit" varchar(10) DEFAULT 'MT' NOT NULL,
	"price_per_unit" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_amount" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"payment_terms" varchar(100),
	"confirmed_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_bunker_stems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"stem_ref" varchar(50) NOT NULL,
	"order_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"port" varchar(50) NOT NULL,
	"berth" varchar(50),
	"supplier_name" varchar(255),
	"barge_name" varchar(255),
	"fuel_type" varchar(30) NOT NULL,
	"fuel_grade" varchar(30),
	"quantity_nominated" integer NOT NULL,
	"quantity_delivered" integer,
	"unit" varchar(10) DEFAULT 'MT' NOT NULL,
	"delivery_window_start" timestamp with time zone,
	"delivery_window_end" timestamp with time zone,
	"actual_delivery_start" timestamp with time zone,
	"actual_delivery_end" timestamp with time zone,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"pumping_rate" integer,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_cost_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"allocation_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"order_id" uuid,
	"fuel_type" varchar(30) NOT NULL,
	"quantity_allocated" integer NOT NULL,
	"unit" varchar(10) DEFAULT 'MT' NOT NULL,
	"cost_per_unit" integer NOT NULL,
	"total_cost" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"allocation_method" varchar(30) NOT NULL,
	"leg_from" varchar(50),
	"leg_to" varchar(50),
	"percentage_of_voyage" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_emissions_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"voyage_ref" varchar(50),
	"reporting_period" varchar(20) NOT NULL,
	"report_year" integer NOT NULL,
	"co2_emissions" integer,
	"nox_emissions" integer,
	"sox_emissions" integer,
	"eexi_value" integer,
	"eexi_required" integer,
	"eexi_compliant" boolean,
	"cii_rating" varchar(5),
	"cii_value" integer,
	"cii_required" integer,
	"distance_travelled" integer,
	"cargo_carried" integer,
	"fuel_consumed" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_fuel_reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reconciliation_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"voyage_ref" varchar(50),
	"fuel_type" varchar(30) NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"opening_rob" integer NOT NULL,
	"closing_rob" integer NOT NULL,
	"total_received" integer DEFAULT 0 NOT NULL,
	"total_consumed" integer DEFAULT 0 NOT NULL,
	"total_transferred" integer DEFAULT 0 NOT NULL,
	"variance" integer,
	"variance_percent" integer,
	"unit" varchar(10) DEFAULT 'MT' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"reconciled_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_fuel_rob_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"voyage_ref" varchar(50),
	"report_date" timestamp with time zone NOT NULL,
	"fuel_type" varchar(30) NOT NULL,
	"rob_quantity" integer NOT NULL,
	"unit" varchar(10) DEFAULT 'MT' NOT NULL,
	"consumption_daily" integer,
	"consumption_voyage" integer,
	"received_quantity" integer,
	"transferred_quantity" integer,
	"location" varchar(100),
	"port_code" varchar(20),
	"report_type" varchar(20) DEFAULT 'noon' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_optimization_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"run_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"voyage_ref" varchar(50),
	"optimization_type" varchar(30) NOT NULL,
	"input_parameters" jsonb NOT NULL,
	"constraints" jsonb,
	"recommendations" jsonb,
	"potential_savings" integer,
	"savings_currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"optimal_port" varchar(50),
	"optimal_fuel_type" varchar(30),
	"optimal_quantity" integer,
	"optimal_supplier" varchar(255),
	"confidence_score" integer,
	"model_version" varchar(20),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"accepted_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_quality_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"claim_ref" varchar(50) NOT NULL,
	"test_id" uuid,
	"order_id" uuid,
	"supplier_name" varchar(255) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"claim_type" varchar(30) NOT NULL,
	"claim_description" text NOT NULL,
	"claim_amount" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"quantity_disputed" integer,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"filed_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"resolution_notes" text,
	"settlement_amount" integer,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_quality_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"test_ref" varchar(50) NOT NULL,
	"stem_id" uuid,
	"order_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"sample_date" timestamp with time zone NOT NULL,
	"lab_name" varchar(255),
	"fuel_type" varchar(30) NOT NULL,
	"density" integer,
	"viscosity" integer,
	"sulphur_content" integer,
	"flash_point" integer,
	"water_content" integer,
	"ash_content" integer,
	"calorific_value" integer,
	"test_results" jsonb,
	"iso_compliant" boolean,
	"marpol_compliant" boolean,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bfm_sulphur_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"port" varchar(50),
	"fuel_type" varchar(30) NOT NULL,
	"sulphur_content_actual" integer NOT NULL,
	"sulphur_limit" integer NOT NULL,
	"is_compliant" boolean NOT NULL,
	"eca_zone" varchar(50),
	"scrubber_equipped" boolean DEFAULT false NOT NULL,
	"scrubber_operational" boolean,
	"changeover_date" timestamp with time zone,
	"changeover_port" varchar(50),
	"changeover_from_fuel" varchar(30),
	"changeover_to_fuel" varchar(30),
	"bdn" jsonb,
	"status" varchar(20) DEFAULT 'recorded' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bfm_bunker_orders" ADD CONSTRAINT "bfm_bunker_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_bunker_stems" ADD CONSTRAINT "bfm_bunker_stems_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_bunker_stems" ADD CONSTRAINT "bfm_bunker_stems_order_id_bfm_bunker_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."bfm_bunker_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_cost_allocations" ADD CONSTRAINT "bfm_cost_allocations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_cost_allocations" ADD CONSTRAINT "bfm_cost_allocations_order_id_bfm_bunker_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."bfm_bunker_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_emissions_records" ADD CONSTRAINT "bfm_emissions_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_fuel_reconciliations" ADD CONSTRAINT "bfm_fuel_reconciliations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_fuel_rob_records" ADD CONSTRAINT "bfm_fuel_rob_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_optimization_runs" ADD CONSTRAINT "bfm_optimization_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_quality_claims" ADD CONSTRAINT "bfm_quality_claims_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_quality_claims" ADD CONSTRAINT "bfm_quality_claims_test_id_bfm_quality_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."bfm_quality_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_quality_claims" ADD CONSTRAINT "bfm_quality_claims_order_id_bfm_bunker_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."bfm_bunker_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_quality_tests" ADD CONSTRAINT "bfm_quality_tests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_quality_tests" ADD CONSTRAINT "bfm_quality_tests_stem_id_bfm_bunker_stems_id_fk" FOREIGN KEY ("stem_id") REFERENCES "public"."bfm_bunker_stems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_quality_tests" ADD CONSTRAINT "bfm_quality_tests_order_id_bfm_bunker_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."bfm_bunker_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bfm_sulphur_records" ADD CONSTRAINT "bfm_sulphur_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bfm_orders_tenant_id_idx" ON "bfm_bunker_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_orders_tenant_ref_idx" ON "bfm_bunker_orders" USING btree ("tenant_id","order_ref");--> statement-breakpoint
CREATE INDEX "bfm_orders_vessel_idx" ON "bfm_bunker_orders" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_orders_supplier_idx" ON "bfm_bunker_orders" USING btree ("supplier_name");--> statement-breakpoint
CREATE INDEX "bfm_orders_port_idx" ON "bfm_bunker_orders" USING btree ("port");--> statement-breakpoint
CREATE INDEX "bfm_orders_fuel_type_idx" ON "bfm_bunker_orders" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_orders_status_idx" ON "bfm_bunker_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_orders_delivery_date_idx" ON "bfm_bunker_orders" USING btree ("delivery_date");--> statement-breakpoint
CREATE INDEX "bfm_stems_tenant_id_idx" ON "bfm_bunker_stems" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_stems_tenant_ref_idx" ON "bfm_bunker_stems" USING btree ("tenant_id","stem_ref");--> statement-breakpoint
CREATE INDEX "bfm_stems_order_id_idx" ON "bfm_bunker_stems" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "bfm_stems_vessel_idx" ON "bfm_bunker_stems" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_stems_port_idx" ON "bfm_bunker_stems" USING btree ("port");--> statement-breakpoint
CREATE INDEX "bfm_stems_fuel_type_idx" ON "bfm_bunker_stems" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_stems_status_idx" ON "bfm_bunker_stems" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_alloc_tenant_id_idx" ON "bfm_cost_allocations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_alloc_tenant_ref_idx" ON "bfm_cost_allocations" USING btree ("tenant_id","allocation_ref");--> statement-breakpoint
CREATE INDEX "bfm_alloc_voyage_idx" ON "bfm_cost_allocations" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "bfm_alloc_vessel_idx" ON "bfm_cost_allocations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_alloc_order_id_idx" ON "bfm_cost_allocations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "bfm_alloc_fuel_type_idx" ON "bfm_cost_allocations" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_alloc_method_idx" ON "bfm_cost_allocations" USING btree ("allocation_method");--> statement-breakpoint
CREATE INDEX "bfm_alloc_status_idx" ON "bfm_cost_allocations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_emissions_tenant_id_idx" ON "bfm_emissions_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_emissions_tenant_ref_idx" ON "bfm_emissions_records" USING btree ("tenant_id","record_ref");--> statement-breakpoint
CREATE INDEX "bfm_emissions_vessel_idx" ON "bfm_emissions_records" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_emissions_voyage_idx" ON "bfm_emissions_records" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "bfm_emissions_year_idx" ON "bfm_emissions_records" USING btree ("report_year");--> statement-breakpoint
CREATE INDEX "bfm_emissions_cii_idx" ON "bfm_emissions_records" USING btree ("cii_rating");--> statement-breakpoint
CREATE INDEX "bfm_emissions_status_idx" ON "bfm_emissions_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_recon_tenant_id_idx" ON "bfm_fuel_reconciliations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_recon_tenant_ref_idx" ON "bfm_fuel_reconciliations" USING btree ("tenant_id","reconciliation_ref");--> statement-breakpoint
CREATE INDEX "bfm_recon_vessel_idx" ON "bfm_fuel_reconciliations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_recon_voyage_idx" ON "bfm_fuel_reconciliations" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "bfm_recon_fuel_type_idx" ON "bfm_fuel_reconciliations" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_recon_status_idx" ON "bfm_fuel_reconciliations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_rob_tenant_id_idx" ON "bfm_fuel_rob_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "bfm_rob_vessel_idx" ON "bfm_fuel_rob_records" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_rob_voyage_idx" ON "bfm_fuel_rob_records" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "bfm_rob_fuel_type_idx" ON "bfm_fuel_rob_records" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_rob_report_date_idx" ON "bfm_fuel_rob_records" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "bfm_rob_report_type_idx" ON "bfm_fuel_rob_records" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "bfm_optim_tenant_id_idx" ON "bfm_optimization_runs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_optim_tenant_ref_idx" ON "bfm_optimization_runs" USING btree ("tenant_id","run_ref");--> statement-breakpoint
CREATE INDEX "bfm_optim_vessel_idx" ON "bfm_optimization_runs" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_optim_voyage_idx" ON "bfm_optimization_runs" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "bfm_optim_type_idx" ON "bfm_optimization_runs" USING btree ("optimization_type");--> statement-breakpoint
CREATE INDEX "bfm_optim_status_idx" ON "bfm_optimization_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_claims_tenant_id_idx" ON "bfm_quality_claims" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_claims_tenant_ref_idx" ON "bfm_quality_claims" USING btree ("tenant_id","claim_ref");--> statement-breakpoint
CREATE INDEX "bfm_claims_test_id_idx" ON "bfm_quality_claims" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "bfm_claims_order_id_idx" ON "bfm_quality_claims" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "bfm_claims_supplier_idx" ON "bfm_quality_claims" USING btree ("supplier_name");--> statement-breakpoint
CREATE INDEX "bfm_claims_type_idx" ON "bfm_quality_claims" USING btree ("claim_type");--> statement-breakpoint
CREATE INDEX "bfm_claims_status_idx" ON "bfm_quality_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_quality_tenant_id_idx" ON "bfm_quality_tests" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_quality_tenant_ref_idx" ON "bfm_quality_tests" USING btree ("tenant_id","test_ref");--> statement-breakpoint
CREATE INDEX "bfm_quality_stem_id_idx" ON "bfm_quality_tests" USING btree ("stem_id");--> statement-breakpoint
CREATE INDEX "bfm_quality_order_id_idx" ON "bfm_quality_tests" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "bfm_quality_vessel_idx" ON "bfm_quality_tests" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_quality_fuel_type_idx" ON "bfm_quality_tests" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_quality_status_idx" ON "bfm_quality_tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bfm_sulphur_tenant_id_idx" ON "bfm_sulphur_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bfm_sulphur_tenant_ref_idx" ON "bfm_sulphur_records" USING btree ("tenant_id","record_ref");--> statement-breakpoint
CREATE INDEX "bfm_sulphur_vessel_idx" ON "bfm_sulphur_records" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "bfm_sulphur_fuel_type_idx" ON "bfm_sulphur_records" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "bfm_sulphur_compliant_idx" ON "bfm_sulphur_records" USING btree ("is_compliant");--> statement-breakpoint
CREATE INDEX "bfm_sulphur_eca_idx" ON "bfm_sulphur_records" USING btree ("eca_zone");--> statement-breakpoint
CREATE INDEX "bfm_sulphur_status_idx" ON "bfm_sulphur_records" USING btree ("status");