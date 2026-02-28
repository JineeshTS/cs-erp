CREATE TABLE "cvm_charter_parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cp_reference" varchar(50) NOT NULL,
	"charter_type" varchar(30) DEFAULT 'time_charter' NOT NULL,
	"vessel_name" varchar(255),
	"vessel_imo" varchar(10),
	"charterer_name" varchar(255) NOT NULL,
	"owner_name" varchar(255),
	"broker_name" varchar(255),
	"hire_rate" integer,
	"hire_currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"hire_period_unit" varchar(10) DEFAULT 'day' NOT NULL,
	"delivery_port" varchar(255),
	"redelivery_port" varchar(255),
	"laycan_from" timestamp with time zone,
	"laycan_to" timestamp with time zone,
	"commenced_at" timestamp with time zone,
	"terminated_at" timestamp with time zone,
	"duration_days" integer,
	"commission_percent" numeric(5, 2),
	"cp_terms" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_coa_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_reference" varchar(50) NOT NULL,
	"charterer_name" varchar(255) NOT NULL,
	"cargo_type" varchar(100) NOT NULL,
	"cargo_description" text,
	"quantity_min" integer,
	"quantity_max" integer,
	"quantity_unit" varchar(10) DEFAULT 'MT' NOT NULL,
	"liftings_per_period" integer,
	"period_from" timestamp with time zone NOT NULL,
	"period_to" timestamp with time zone NOT NULL,
	"rate" integer NOT NULL,
	"rate_basis" varchar(20) DEFAULT 'per_mt' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_delivery_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_party_id" uuid NOT NULL,
	"vessel_name" varchar(255),
	"report_type" varchar(20) DEFAULT 'delivery' NOT NULL,
	"port_name" varchar(255),
	"report_date" timestamp with time zone NOT NULL,
	"bunker_rob" jsonb,
	"vessel_condition" text,
	"survey_reference" varchar(100),
	"remarks" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_fixtures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"fixture_reference" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"fixture_type" varchar(30) DEFAULT 'voyage' NOT NULL,
	"counterparty_name" varchar(255) NOT NULL,
	"broker_name" varchar(255),
	"cargo_type" varchar(100),
	"cargo_quantity" integer,
	"laycan_from" timestamp with time zone,
	"laycan_to" timestamp with time zone,
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"freight_rate" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"commission_percent" numeric(5, 2),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"subject_details" text,
	"terms" text,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_hire_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_party_id" uuid NOT NULL,
	"statement_number" varchar(30) NOT NULL,
	"period_from" timestamp with time zone NOT NULL,
	"period_to" timestamp with time zone NOT NULL,
	"hire_days" numeric(8, 4) NOT NULL,
	"hire_rate" integer NOT NULL,
	"gross_hire" integer NOT NULL,
	"off_hire_deductions" integer DEFAULT 0,
	"bunker_adjustments" integer DEFAULT 0,
	"other_deductions" integer DEFAULT 0,
	"net_hire" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_laytime_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_party_id" uuid,
	"voyage_estimate_id" uuid,
	"port_name" varchar(255) NOT NULL,
	"operation_type" varchar(20) DEFAULT 'loading' NOT NULL,
	"allowed_hours" numeric(10, 2) NOT NULL,
	"used_hours" numeric(10, 2) NOT NULL,
	"excess_hours" numeric(10, 2),
	"demurrage_rate" integer,
	"despatch_rate" integer,
	"demurrage_amount" integer,
	"despatch_amount" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"commenced_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'calculating' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_off_hire_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_party_id" uuid NOT NULL,
	"vessel_name" varchar(255),
	"event_type" varchar(30) DEFAULT 'breakdown' NOT NULL,
	"reason" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"off_hire_days" numeric(8, 4),
	"hire_rate" integer,
	"off_hire_amount" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"claim_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"claim_reference" varchar(50),
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_tc_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"direction" varchar(10) NOT NULL,
	"contract_reference" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"counterparty_name" varchar(255) NOT NULL,
	"broker_name" varchar(255),
	"hire_rate" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"hire_period_unit" varchar(10) DEFAULT 'day' NOT NULL,
	"delivery_port" varchar(255),
	"redelivery_port" varchar(255),
	"delivery_date" timestamp with time zone,
	"redelivery_date" timestamp with time zone,
	"min_duration" integer,
	"max_duration" integer,
	"duration_unit" varchar(10) DEFAULT 'days',
	"commission_percent" numeric(5, 2),
	"status" varchar(20) DEFAULT 'negotiating' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_utilization_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"analysis_date" timestamp with time zone NOT NULL,
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"current_utilization_percent" numeric(5, 2),
	"projected_utilization_percent" numeric(5, 2),
	"recommended_action" text,
	"recommended_route" varchar(255),
	"projected_revenue_impact" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"ai_model" varchar(100),
	"parameters" jsonb,
	"results" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_vessel_performances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"voyage_estimate_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"report_date" timestamp with time zone NOT NULL,
	"report_type" varchar(20) DEFAULT 'noon' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"speed_knots" numeric(6, 2),
	"consumption_mt" numeric(8, 2),
	"fuel_type" varchar(30),
	"wind_force" integer,
	"sea_state" integer,
	"weather_conditions" varchar(100),
	"distance_nm" numeric(10, 1),
	"slip_percent" numeric(5, 2),
	"remarks" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_voyage_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_party_id" uuid,
	"voyage_number" varchar(30) NOT NULL,
	"vessel_name" varchar(255),
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"cargo_type" varchar(100),
	"cargo_quantity" integer,
	"cargo_unit" varchar(20) DEFAULT 'MT',
	"estimated_revenue" integer,
	"bunker_cost" integer,
	"port_cost" integer,
	"canal_cost" integer,
	"other_costs" integer,
	"total_cost" integer,
	"net_result" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"voyage_days" integer,
	"sea_days" integer,
	"port_days" integer,
	"distance_nm" numeric(10, 1),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvm_voyage_pnl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"voyage_estimate_id" uuid,
	"voyage_number" varchar(30) NOT NULL,
	"vessel_name" varchar(255),
	"revenue" integer DEFAULT 0 NOT NULL,
	"hire_cost" integer DEFAULT 0,
	"bunker_cost" integer DEFAULT 0,
	"port_cost" integer DEFAULT 0,
	"canal_cost" integer DEFAULT 0,
	"agency_cost" integer DEFAULT 0,
	"insurance_cost" integer DEFAULT 0,
	"other_costs" integer DEFAULT 0,
	"total_costs" integer DEFAULT 0,
	"net_result" integer DEFAULT 0,
	"tce_rate" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"status" varchar(20) DEFAULT 'provisional' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cvm_charter_parties" ADD CONSTRAINT "cvm_charter_parties_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_coa_contracts" ADD CONSTRAINT "cvm_coa_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_delivery_reports" ADD CONSTRAINT "cvm_delivery_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_delivery_reports" ADD CONSTRAINT "cvm_delivery_reports_charter_party_id_cvm_charter_parties_id_fk" FOREIGN KEY ("charter_party_id") REFERENCES "public"."cvm_charter_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_fixtures" ADD CONSTRAINT "cvm_fixtures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_hire_statements" ADD CONSTRAINT "cvm_hire_statements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_hire_statements" ADD CONSTRAINT "cvm_hire_statements_charter_party_id_cvm_charter_parties_id_fk" FOREIGN KEY ("charter_party_id") REFERENCES "public"."cvm_charter_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_laytime_calculations" ADD CONSTRAINT "cvm_laytime_calculations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_laytime_calculations" ADD CONSTRAINT "cvm_laytime_calculations_charter_party_id_cvm_charter_parties_id_fk" FOREIGN KEY ("charter_party_id") REFERENCES "public"."cvm_charter_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_laytime_calculations" ADD CONSTRAINT "cvm_laytime_calculations_voyage_estimate_id_cvm_voyage_estimates_id_fk" FOREIGN KEY ("voyage_estimate_id") REFERENCES "public"."cvm_voyage_estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_off_hire_events" ADD CONSTRAINT "cvm_off_hire_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_off_hire_events" ADD CONSTRAINT "cvm_off_hire_events_charter_party_id_cvm_charter_parties_id_fk" FOREIGN KEY ("charter_party_id") REFERENCES "public"."cvm_charter_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_tc_contracts" ADD CONSTRAINT "cvm_tc_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_utilization_analyses" ADD CONSTRAINT "cvm_utilization_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_vessel_performances" ADD CONSTRAINT "cvm_vessel_performances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_vessel_performances" ADD CONSTRAINT "cvm_vessel_performances_voyage_estimate_id_cvm_voyage_estimates_id_fk" FOREIGN KEY ("voyage_estimate_id") REFERENCES "public"."cvm_voyage_estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_voyage_estimates" ADD CONSTRAINT "cvm_voyage_estimates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_voyage_estimates" ADD CONSTRAINT "cvm_voyage_estimates_charter_party_id_cvm_charter_parties_id_fk" FOREIGN KEY ("charter_party_id") REFERENCES "public"."cvm_charter_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_voyage_pnl" ADD CONSTRAINT "cvm_voyage_pnl_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvm_voyage_pnl" ADD CONSTRAINT "cvm_voyage_pnl_voyage_estimate_id_cvm_voyage_estimates_id_fk" FOREIGN KEY ("voyage_estimate_id") REFERENCES "public"."cvm_voyage_estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cvm_charter_parties_tenant_id_idx" ON "cvm_charter_parties" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_charter_parties_tenant_ref_idx" ON "cvm_charter_parties" USING btree ("tenant_id","cp_reference");--> statement-breakpoint
CREATE INDEX "cvm_charter_parties_type_idx" ON "cvm_charter_parties" USING btree ("charter_type");--> statement-breakpoint
CREATE INDEX "cvm_charter_parties_status_idx" ON "cvm_charter_parties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_charter_parties_charterer_idx" ON "cvm_charter_parties" USING btree ("charterer_name");--> statement-breakpoint
CREATE INDEX "cvm_coa_contracts_tenant_id_idx" ON "cvm_coa_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_coa_contracts_tenant_ref_idx" ON "cvm_coa_contracts" USING btree ("tenant_id","contract_reference");--> statement-breakpoint
CREATE INDEX "cvm_coa_contracts_charterer_idx" ON "cvm_coa_contracts" USING btree ("charterer_name");--> statement-breakpoint
CREATE INDEX "cvm_coa_contracts_status_idx" ON "cvm_coa_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_delivery_reports_tenant_id_idx" ON "cvm_delivery_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cvm_delivery_reports_cp_id_idx" ON "cvm_delivery_reports" USING btree ("charter_party_id");--> statement-breakpoint
CREATE INDEX "cvm_delivery_reports_type_idx" ON "cvm_delivery_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "cvm_delivery_reports_status_idx" ON "cvm_delivery_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_fixtures_tenant_id_idx" ON "cvm_fixtures" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_fixtures_tenant_ref_idx" ON "cvm_fixtures" USING btree ("tenant_id","fixture_reference");--> statement-breakpoint
CREATE INDEX "cvm_fixtures_type_idx" ON "cvm_fixtures" USING btree ("fixture_type");--> statement-breakpoint
CREATE INDEX "cvm_fixtures_status_idx" ON "cvm_fixtures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_fixtures_counterparty_idx" ON "cvm_fixtures" USING btree ("counterparty_name");--> statement-breakpoint
CREATE INDEX "cvm_hire_statements_tenant_id_idx" ON "cvm_hire_statements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_hire_statements_tenant_num_idx" ON "cvm_hire_statements" USING btree ("tenant_id","statement_number");--> statement-breakpoint
CREATE INDEX "cvm_hire_statements_cp_id_idx" ON "cvm_hire_statements" USING btree ("charter_party_id");--> statement-breakpoint
CREATE INDEX "cvm_hire_statements_status_idx" ON "cvm_hire_statements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_laytime_calculations_tenant_id_idx" ON "cvm_laytime_calculations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cvm_laytime_calculations_cp_id_idx" ON "cvm_laytime_calculations" USING btree ("charter_party_id");--> statement-breakpoint
CREATE INDEX "cvm_laytime_calculations_voyage_id_idx" ON "cvm_laytime_calculations" USING btree ("voyage_estimate_id");--> statement-breakpoint
CREATE INDEX "cvm_laytime_calculations_status_idx" ON "cvm_laytime_calculations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_off_hire_events_tenant_id_idx" ON "cvm_off_hire_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cvm_off_hire_events_cp_id_idx" ON "cvm_off_hire_events" USING btree ("charter_party_id");--> statement-breakpoint
CREATE INDEX "cvm_off_hire_events_claim_status_idx" ON "cvm_off_hire_events" USING btree ("claim_status");--> statement-breakpoint
CREATE INDEX "cvm_off_hire_events_event_type_idx" ON "cvm_off_hire_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "cvm_tc_contracts_tenant_id_idx" ON "cvm_tc_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_tc_contracts_tenant_ref_idx" ON "cvm_tc_contracts" USING btree ("tenant_id","contract_reference");--> statement-breakpoint
CREATE INDEX "cvm_tc_contracts_direction_idx" ON "cvm_tc_contracts" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "cvm_tc_contracts_status_idx" ON "cvm_tc_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_utilization_analyses_tenant_id_idx" ON "cvm_utilization_analyses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cvm_utilization_analyses_vessel_idx" ON "cvm_utilization_analyses" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "cvm_utilization_analyses_date_idx" ON "cvm_utilization_analyses" USING btree ("analysis_date");--> statement-breakpoint
CREATE INDEX "cvm_utilization_analyses_status_idx" ON "cvm_utilization_analyses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_vessel_performances_tenant_id_idx" ON "cvm_vessel_performances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cvm_vessel_performances_voyage_id_idx" ON "cvm_vessel_performances" USING btree ("voyage_estimate_id");--> statement-breakpoint
CREATE INDEX "cvm_vessel_performances_report_date_idx" ON "cvm_vessel_performances" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "cvm_vessel_performances_report_type_idx" ON "cvm_vessel_performances" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "cvm_voyage_estimates_tenant_id_idx" ON "cvm_voyage_estimates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_voyage_estimates_tenant_voyage_idx" ON "cvm_voyage_estimates" USING btree ("tenant_id","voyage_number");--> statement-breakpoint
CREATE INDEX "cvm_voyage_estimates_cp_id_idx" ON "cvm_voyage_estimates" USING btree ("charter_party_id");--> statement-breakpoint
CREATE INDEX "cvm_voyage_estimates_status_idx" ON "cvm_voyage_estimates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cvm_voyage_pnl_tenant_id_idx" ON "cvm_voyage_pnl" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cvm_voyage_pnl_voyage_est_id_idx" ON "cvm_voyage_pnl" USING btree ("voyage_estimate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cvm_voyage_pnl_tenant_voyage_idx" ON "cvm_voyage_pnl" USING btree ("tenant_id","voyage_number");--> statement-breakpoint
CREATE INDEX "cvm_voyage_pnl_status_idx" ON "cvm_voyage_pnl" USING btree ("status");