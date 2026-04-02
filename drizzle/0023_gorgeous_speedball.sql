CREATE TABLE "pda_agent_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"statement_ref" varchar(50) NOT NULL,
	"agent_id" uuid,
	"agent_name" varchar(255) NOT NULL,
	"agent_code" varchar(50),
	"port_code" varchar(10),
	"port_name" varchar(255),
	"statement_date" timestamp with time zone NOT NULL,
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"opening_balance" integer DEFAULT 0 NOT NULL,
	"total_debits" integer DEFAULT 0 NOT NULL,
	"total_credits" integer DEFAULT 0 NOT NULL,
	"closing_balance" integer NOT NULL,
	"transaction_count" integer DEFAULT 0 NOT NULL,
	"line_items" jsonb,
	"advance_paid" integer DEFAULT 0 NOT NULL,
	"balance_due" integer DEFAULT 0 NOT NULL,
	"due_date" timestamp with time zone,
	"reconciled_by" uuid,
	"reconciled_by_name" varchar(255),
	"reconciled_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda_consolidated_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"report_period" varchar(10) NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_ports" integer DEFAULT 0 NOT NULL,
	"total_voyages" integer DEFAULT 0 NOT NULL,
	"total_proformas" integer DEFAULT 0 NOT NULL,
	"total_finals" integer DEFAULT 0 NOT NULL,
	"total_estimated_cost" integer DEFAULT 0 NOT NULL,
	"total_actual_cost" integer DEFAULT 0 NOT NULL,
	"total_variance" integer DEFAULT 0 NOT NULL,
	"average_variance_percent" integer,
	"port_breakdown" jsonb,
	"category_breakdown" jsonb,
	"voyage_breakdown" jsonb,
	"top_expense_ports" jsonb,
	"savings_opportunities" jsonb,
	"ai_insights" jsonb,
	"ai_model_version" varchar(50),
	"generated_by" uuid,
	"generated_by_name" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda_cost_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"benchmark_ref" varchar(50) NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"cost_category" varchar(50) NOT NULL,
	"benchmark_period" varchar(10) NOT NULL,
	"benchmark_year" integer NOT NULL,
	"benchmark_month" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"average_cost" integer NOT NULL,
	"median_cost" integer,
	"minimum_cost" integer,
	"maximum_cost" integer,
	"standard_deviation" integer,
	"sample_size" integer DEFAULT 0 NOT NULL,
	"percentile_25" integer,
	"percentile_75" integer,
	"industry_average" integer,
	"our_average" integer,
	"cost_position" varchar(20),
	"trend_direction" varchar(20),
	"trend_percent" integer,
	"ai_insights" jsonb,
	"ai_model_version" varchar(50),
	"confidence_score" integer,
	"data_source" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda_expense_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"allocation_ref" varchar(50) NOT NULL,
	"voyage_id" uuid,
	"voyage_ref" varchar(50),
	"vessel_name" varchar(255) NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"fda_id" uuid,
	"fda_ref" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_port_cost" integer NOT NULL,
	"allocation_method" varchar(30) NOT NULL,
	"allocation_basis" varchar(30),
	"allocated_to_cargo" integer DEFAULT 0 NOT NULL,
	"allocated_to_vessel" integer DEFAULT 0 NOT NULL,
	"allocated_to_overhead" integer DEFAULT 0 NOT NULL,
	"allocation_details" jsonb,
	"cost_centre" varchar(50),
	"gl_account_code" varchar(50),
	"journal_entry_ref" varchar(100),
	"posted_at" timestamp with time zone,
	"allocated_by" uuid,
	"allocated_by_name" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda_final_das" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"fda_ref" varchar(50) NOT NULL,
	"proforma_id" uuid,
	"proforma_ref" varchar(50),
	"voyage_id" uuid,
	"voyage_ref" varchar(50),
	"vessel_name" varchar(255) NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"agent_id" uuid,
	"agent_name" varchar(255),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"port_dues" integer DEFAULT 0 NOT NULL,
	"pilotage" integer DEFAULT 0 NOT NULL,
	"towage" integer DEFAULT 0 NOT NULL,
	"berth_hire" integer DEFAULT 0 NOT NULL,
	"cargo_handling" integer DEFAULT 0 NOT NULL,
	"agency_fees" integer DEFAULT 0 NOT NULL,
	"customs" integer DEFAULT 0 NOT NULL,
	"miscellaneous" integer DEFAULT 0 NOT NULL,
	"total_actual" integer NOT NULL,
	"total_estimate" integer DEFAULT 0 NOT NULL,
	"variance_amount" integer DEFAULT 0 NOT NULL,
	"variance_percent" integer DEFAULT 0 NOT NULL,
	"line_items" jsonb,
	"exchange_rate" integer,
	"base_currency_amount" integer,
	"invoice_ref" varchar(100),
	"invoice_date" timestamp with time zone,
	"received_date" timestamp with time zone,
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda_port_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cost_ref" varchar(50) NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"cost_category" varchar(50) NOT NULL,
	"cost_type" varchar(30) NOT NULL,
	"description" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"unit_rate" integer NOT NULL,
	"unit_of_measure" varchar(30),
	"minimum_charge" integer,
	"maximum_charge" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"vessel_size_from" integer,
	"vessel_size_to" integer,
	"cargo_type_applicable" varchar(50),
	"rate_schedule" jsonb,
	"source_document" varchar(255),
	"last_verified_date" timestamp with time zone,
	"last_verified_by" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda_proforma_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"estimate_ref" varchar(50) NOT NULL,
	"voyage_id" uuid,
	"voyage_ref" varchar(50),
	"vessel_name" varchar(255) NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"call_purpose" varchar(30) NOT NULL,
	"agent_id" uuid,
	"agent_name" varchar(255),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"port_dues" integer DEFAULT 0 NOT NULL,
	"pilotage" integer DEFAULT 0 NOT NULL,
	"towage" integer DEFAULT 0 NOT NULL,
	"berth_hire" integer DEFAULT 0 NOT NULL,
	"cargo_handling" integer DEFAULT 0 NOT NULL,
	"agency_fees" integer DEFAULT 0 NOT NULL,
	"customs" integer DEFAULT 0 NOT NULL,
	"miscellaneous" integer DEFAULT 0 NOT NULL,
	"total_estimate" integer NOT NULL,
	"line_items" jsonb,
	"exchange_rate" integer,
	"base_currency_amount" integer,
	"estimate_date" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone,
	"requested_by" uuid,
	"requested_by_name" varchar(255),
	"approved_by" uuid,
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
CREATE TABLE "pda_variance_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analysis_ref" varchar(50) NOT NULL,
	"proforma_id" uuid,
	"proforma_ref" varchar(50),
	"fda_id" uuid,
	"fda_ref" varchar(50),
	"vessel_name" varchar(255) NOT NULL,
	"port_code" varchar(10) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"pda_total" integer NOT NULL,
	"fda_total" integer NOT NULL,
	"total_variance" integer DEFAULT 0 NOT NULL,
	"variance_percent" integer DEFAULT 0 NOT NULL,
	"line_variances" jsonb,
	"major_deviations" jsonb,
	"deviation_threshold" integer DEFAULT 10 NOT NULL,
	"within_threshold" boolean DEFAULT true NOT NULL,
	"root_cause_analysis" text,
	"recommendations" text,
	"analysed_by" uuid,
	"analysed_by_name" varchar(255),
	"reviewed_by" uuid,
	"reviewed_by_name" varchar(255),
	"reviewed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pda_agent_statements" ADD CONSTRAINT "pda_agent_statements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_consolidated_reports" ADD CONSTRAINT "pda_consolidated_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_cost_benchmarks" ADD CONSTRAINT "pda_cost_benchmarks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_expense_allocations" ADD CONSTRAINT "pda_expense_allocations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_expense_allocations" ADD CONSTRAINT "pda_expense_allocations_fda_id_pda_final_das_id_fk" FOREIGN KEY ("fda_id") REFERENCES "public"."pda_final_das"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_final_das" ADD CONSTRAINT "pda_final_das_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_final_das" ADD CONSTRAINT "pda_final_das_proforma_id_pda_proforma_estimates_id_fk" FOREIGN KEY ("proforma_id") REFERENCES "public"."pda_proforma_estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_port_costs" ADD CONSTRAINT "pda_port_costs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_proforma_estimates" ADD CONSTRAINT "pda_proforma_estimates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_variance_analyses" ADD CONSTRAINT "pda_variance_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_variance_analyses" ADD CONSTRAINT "pda_variance_analyses_proforma_id_pda_proforma_estimates_id_fk" FOREIGN KEY ("proforma_id") REFERENCES "public"."pda_proforma_estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda_variance_analyses" ADD CONSTRAINT "pda_variance_analyses_fda_id_pda_final_das_id_fk" FOREIGN KEY ("fda_id") REFERENCES "public"."pda_final_das"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pda_as_tenant_id_idx" ON "pda_agent_statements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_as_tenant_ref_idx" ON "pda_agent_statements" USING btree ("tenant_id","statement_ref");--> statement-breakpoint
CREATE INDEX "pda_as_agent_id_idx" ON "pda_agent_statements" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "pda_as_agent_name_idx" ON "pda_agent_statements" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "pda_as_port_code_idx" ON "pda_agent_statements" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_as_statement_date_idx" ON "pda_agent_statements" USING btree ("statement_date");--> statement-breakpoint
CREATE INDEX "pda_as_status_idx" ON "pda_agent_statements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_cr_tenant_id_idx" ON "pda_consolidated_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_cr_tenant_ref_idx" ON "pda_consolidated_reports" USING btree ("tenant_id","report_ref");--> statement-breakpoint
CREATE INDEX "pda_cr_type_idx" ON "pda_consolidated_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "pda_cr_year_month_idx" ON "pda_consolidated_reports" USING btree ("report_year","report_month");--> statement-breakpoint
CREATE INDEX "pda_cr_status_idx" ON "pda_consolidated_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_cb_tenant_id_idx" ON "pda_cost_benchmarks" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_cb_tenant_ref_idx" ON "pda_cost_benchmarks" USING btree ("tenant_id","benchmark_ref");--> statement-breakpoint
CREATE INDEX "pda_cb_port_code_idx" ON "pda_cost_benchmarks" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_cb_category_idx" ON "pda_cost_benchmarks" USING btree ("cost_category");--> statement-breakpoint
CREATE INDEX "pda_cb_year_month_idx" ON "pda_cost_benchmarks" USING btree ("benchmark_year","benchmark_month");--> statement-breakpoint
CREATE INDEX "pda_cb_cost_position_idx" ON "pda_cost_benchmarks" USING btree ("cost_position");--> statement-breakpoint
CREATE INDEX "pda_cb_status_idx" ON "pda_cost_benchmarks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_ea_tenant_id_idx" ON "pda_expense_allocations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_ea_tenant_ref_idx" ON "pda_expense_allocations" USING btree ("tenant_id","allocation_ref");--> statement-breakpoint
CREATE INDEX "pda_ea_voyage_id_idx" ON "pda_expense_allocations" USING btree ("voyage_id");--> statement-breakpoint
CREATE INDEX "pda_ea_vessel_name_idx" ON "pda_expense_allocations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pda_ea_port_code_idx" ON "pda_expense_allocations" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_ea_fda_id_idx" ON "pda_expense_allocations" USING btree ("fda_id");--> statement-breakpoint
CREATE INDEX "pda_ea_cost_centre_idx" ON "pda_expense_allocations" USING btree ("cost_centre");--> statement-breakpoint
CREATE INDEX "pda_ea_status_idx" ON "pda_expense_allocations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_fd_tenant_id_idx" ON "pda_final_das" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_fd_tenant_ref_idx" ON "pda_final_das" USING btree ("tenant_id","fda_ref");--> statement-breakpoint
CREATE INDEX "pda_fd_proforma_id_idx" ON "pda_final_das" USING btree ("proforma_id");--> statement-breakpoint
CREATE INDEX "pda_fd_voyage_id_idx" ON "pda_final_das" USING btree ("voyage_id");--> statement-breakpoint
CREATE INDEX "pda_fd_vessel_name_idx" ON "pda_final_das" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pda_fd_port_code_idx" ON "pda_final_das" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_fd_agent_id_idx" ON "pda_final_das" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "pda_fd_status_idx" ON "pda_final_das" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_pc_tenant_id_idx" ON "pda_port_costs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_pc_tenant_ref_idx" ON "pda_port_costs" USING btree ("tenant_id","cost_ref");--> statement-breakpoint
CREATE INDEX "pda_pc_port_code_idx" ON "pda_port_costs" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_pc_category_idx" ON "pda_port_costs" USING btree ("cost_category");--> statement-breakpoint
CREATE INDEX "pda_pc_cost_type_idx" ON "pda_port_costs" USING btree ("cost_type");--> statement-breakpoint
CREATE INDEX "pda_pc_effective_from_idx" ON "pda_port_costs" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "pda_pc_status_idx" ON "pda_port_costs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_pe_tenant_id_idx" ON "pda_proforma_estimates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_pe_tenant_ref_idx" ON "pda_proforma_estimates" USING btree ("tenant_id","estimate_ref");--> statement-breakpoint
CREATE INDEX "pda_pe_voyage_id_idx" ON "pda_proforma_estimates" USING btree ("voyage_id");--> statement-breakpoint
CREATE INDEX "pda_pe_vessel_name_idx" ON "pda_proforma_estimates" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pda_pe_port_code_idx" ON "pda_proforma_estimates" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_pe_agent_id_idx" ON "pda_proforma_estimates" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "pda_pe_estimate_date_idx" ON "pda_proforma_estimates" USING btree ("estimate_date");--> statement-breakpoint
CREATE INDEX "pda_pe_status_idx" ON "pda_proforma_estimates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pda_va_tenant_id_idx" ON "pda_variance_analyses" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pda_va_tenant_ref_idx" ON "pda_variance_analyses" USING btree ("tenant_id","analysis_ref");--> statement-breakpoint
CREATE INDEX "pda_va_proforma_id_idx" ON "pda_variance_analyses" USING btree ("proforma_id");--> statement-breakpoint
CREATE INDEX "pda_va_fda_id_idx" ON "pda_variance_analyses" USING btree ("fda_id");--> statement-breakpoint
CREATE INDEX "pda_va_vessel_name_idx" ON "pda_variance_analyses" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pda_va_port_code_idx" ON "pda_variance_analyses" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "pda_va_within_threshold_idx" ON "pda_variance_analyses" USING btree ("within_threshold");--> statement-breakpoint
CREATE INDEX "pda_va_status_idx" ON "pda_variance_analyses" USING btree ("status");