CREATE TABLE "cfm_agency_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"commission_ref" varchar(50) NOT NULL,
	"agent_name" varchar(255) NOT NULL,
	"agent_code" varchar(50),
	"voyage_ref" varchar(50),
	"port" varchar(50),
	"commission_type" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"base_amount" integer NOT NULL,
	"commission_rate" integer NOT NULL,
	"commission_amount" integer NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"net_payable" integer NOT NULL,
	"invoice_ref" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_anomaly_detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"anomaly_ref" varchar(50) NOT NULL,
	"detected_entity" varchar(50) NOT NULL,
	"entity_ref" varchar(50),
	"anomaly_type" varchar(30) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"expected_amount" integer,
	"actual_amount" integer,
	"deviation_percent" integer,
	"description" text NOT NULL,
	"ai_confidence" integer,
	"model_version" varchar(20),
	"suggested_action" text,
	"status" varchar(20) DEFAULT 'detected' NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" uuid,
	"resolved_at" timestamp with time zone,
	"resolution_notes" text,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_capex_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"capex_ref" varchar(50) NOT NULL,
	"asset_name" varchar(255) NOT NULL,
	"asset_category" varchar(50) NOT NULL,
	"cost_centre" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"acquisition_cost" integer NOT NULL,
	"residual_value" integer DEFAULT 0 NOT NULL,
	"useful_life_months" integer NOT NULL,
	"depreciation_method" varchar(30) NOT NULL,
	"monthly_depreciation" integer,
	"accumulated_depreciation" integer DEFAULT 0 NOT NULL,
	"net_book_value" integer NOT NULL,
	"acquisition_date" timestamp with time zone NOT NULL,
	"in_service_date" timestamp with time zone,
	"disposal_date" timestamp with time zone,
	"disposal_amount" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_container_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cost_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_type" varchar(30),
	"voyage_ref" varchar(50),
	"booking_ref" varchar(50),
	"cost_category" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"lease_cost" integer DEFAULT 0 NOT NULL,
	"handling_cost" integer DEFAULT 0 NOT NULL,
	"repositioning_cost" integer DEFAULT 0 NOT NULL,
	"maintenance_cost" integer DEFAULT 0 NOT NULL,
	"insurance_cost" integer DEFAULT 0 NOT NULL,
	"other_cost" integer DEFAULT 0 NOT NULL,
	"total_cost" integer NOT NULL,
	"allocation_method" varchar(30),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_cost_centres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"centre_code" varchar(30) NOT NULL,
	"centre_name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"centre_type" varchar(30) NOT NULL,
	"department" varchar(100),
	"manager_id" uuid,
	"manager_name" varchar(255),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"annual_budget" integer,
	"ytd_actual" integer,
	"ytd_budget" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"gl_account_code" varchar(30),
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_kpi_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_name" varchar(255) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"report_period" varchar(20) NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_revenue" integer,
	"total_cost" integer,
	"gross_profit" integer,
	"net_profit" integer,
	"ebitda" integer,
	"operating_ratio" integer,
	"revenue_per_teu" integer,
	"cost_per_teu" integer,
	"kpi_data" jsonb,
	"charts" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_overhead_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"allocation_ref" varchar(50) NOT NULL,
	"cost_centre" varchar(50) NOT NULL,
	"allocation_period" varchar(20) NOT NULL,
	"allocation_method" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_overhead" integer NOT NULL,
	"allocated_amount" integer NOT NULL,
	"allocation_base" varchar(50),
	"allocation_factor" integer,
	"target_entity" varchar(50),
	"target_ref" varchar(50),
	"breakdown_items" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_port_disbursements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"disbursement_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50),
	"vessel_name" varchar(255) NOT NULL,
	"port" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"disbursement_type" varchar(20) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"pda_amount" integer,
	"fda_amount" integer,
	"variance_amount" integer,
	"line_items" jsonb,
	"port_dues" integer DEFAULT 0 NOT NULL,
	"pilotage" integer DEFAULT 0 NOT NULL,
	"towage" integer DEFAULT 0 NOT NULL,
	"berth" integer DEFAULT 0 NOT NULL,
	"cargo_handling" integer DEFAULT 0 NOT NULL,
	"agency_fee" integer DEFAULT 0 NOT NULL,
	"other_charges" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_revenue_recognitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"recognition_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50),
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"customer_name" varchar(255),
	"revenue_type" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"gross_revenue" integer NOT NULL,
	"deductions" integer DEFAULT 0 NOT NULL,
	"net_revenue" integer NOT NULL,
	"recognition_method" varchar(30) NOT NULL,
	"performance_obligation" varchar(100),
	"completion_percent" integer,
	"recognized_amount" integer NOT NULL,
	"deferred_amount" integer DEFAULT 0 NOT NULL,
	"recognition_period" varchar(20),
	"journal_entry_ref" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"recognized_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_variance_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analysis_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50),
	"vessel_name" varchar(255),
	"cost_centre" varchar(50),
	"analysis_period" varchar(20) NOT NULL,
	"analysis_type" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"budget_amount" integer NOT NULL,
	"actual_amount" integer NOT NULL,
	"variance_amount" integer NOT NULL,
	"variance_percent" integer,
	"variance_type" varchar(20),
	"root_causes" jsonb,
	"corrective_actions" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfm_voyage_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"budget_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"vessel_imo" varchar(20),
	"service_route" varchar(100),
	"budget_type" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"bunker_cost" integer DEFAULT 0 NOT NULL,
	"port_cost" integer DEFAULT 0 NOT NULL,
	"canal_cost" integer DEFAULT 0 NOT NULL,
	"crew_cost" integer DEFAULT 0 NOT NULL,
	"insurance_cost" integer DEFAULT 0 NOT NULL,
	"other_cost" integer DEFAULT 0 NOT NULL,
	"total_budget" integer NOT NULL,
	"total_actual" integer,
	"variance" integer,
	"variance_percent" integer,
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
CREATE TABLE "cfm_voyage_pnl_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"service_route" varchar(100),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"freight_revenue" integer DEFAULT 0 NOT NULL,
	"demurrage_revenue" integer DEFAULT 0 NOT NULL,
	"other_revenue" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer NOT NULL,
	"bunker_cost" integer DEFAULT 0 NOT NULL,
	"port_cost" integer DEFAULT 0 NOT NULL,
	"commission_cost" integer DEFAULT 0 NOT NULL,
	"charter_cost" integer DEFAULT 0 NOT NULL,
	"overhead_cost" integer DEFAULT 0 NOT NULL,
	"other_cost" integer DEFAULT 0 NOT NULL,
	"total_cost" integer NOT NULL,
	"gross_profit" integer NOT NULL,
	"net_profit" integer NOT NULL,
	"profit_margin" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cfm_agency_commissions" ADD CONSTRAINT "cfm_agency_commissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_anomaly_detections" ADD CONSTRAINT "cfm_anomaly_detections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_capex_items" ADD CONSTRAINT "cfm_capex_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_container_costs" ADD CONSTRAINT "cfm_container_costs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_cost_centres" ADD CONSTRAINT "cfm_cost_centres_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_kpi_reports" ADD CONSTRAINT "cfm_kpi_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_overhead_allocations" ADD CONSTRAINT "cfm_overhead_allocations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_port_disbursements" ADD CONSTRAINT "cfm_port_disbursements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_revenue_recognitions" ADD CONSTRAINT "cfm_revenue_recognitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_variance_analyses" ADD CONSTRAINT "cfm_variance_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_voyage_budgets" ADD CONSTRAINT "cfm_voyage_budgets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_voyage_pnl_reports" ADD CONSTRAINT "cfm_voyage_pnl_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cfm_comm_tenant_id_idx" ON "cfm_agency_commissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_comm_tenant_ref_idx" ON "cfm_agency_commissions" USING btree ("tenant_id","commission_ref");--> statement-breakpoint
CREATE INDEX "cfm_comm_agent_idx" ON "cfm_agency_commissions" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "cfm_comm_voyage_idx" ON "cfm_agency_commissions" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_comm_type_idx" ON "cfm_agency_commissions" USING btree ("commission_type");--> statement-breakpoint
CREATE INDEX "cfm_comm_status_idx" ON "cfm_agency_commissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_anom_tenant_id_idx" ON "cfm_anomaly_detections" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_anom_tenant_ref_idx" ON "cfm_anomaly_detections" USING btree ("tenant_id","anomaly_ref");--> statement-breakpoint
CREATE INDEX "cfm_anom_entity_idx" ON "cfm_anomaly_detections" USING btree ("detected_entity");--> statement-breakpoint
CREATE INDEX "cfm_anom_type_idx" ON "cfm_anomaly_detections" USING btree ("anomaly_type");--> statement-breakpoint
CREATE INDEX "cfm_anom_severity_idx" ON "cfm_anomaly_detections" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "cfm_anom_status_idx" ON "cfm_anomaly_detections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_capex_tenant_id_idx" ON "cfm_capex_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_capex_tenant_ref_idx" ON "cfm_capex_items" USING btree ("tenant_id","capex_ref");--> statement-breakpoint
CREATE INDEX "cfm_capex_category_idx" ON "cfm_capex_items" USING btree ("asset_category");--> statement-breakpoint
CREATE INDEX "cfm_capex_centre_idx" ON "cfm_capex_items" USING btree ("cost_centre");--> statement-breakpoint
CREATE INDEX "cfm_capex_method_idx" ON "cfm_capex_items" USING btree ("depreciation_method");--> statement-breakpoint
CREATE INDEX "cfm_capex_status_idx" ON "cfm_capex_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_ccost_tenant_id_idx" ON "cfm_container_costs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_ccost_tenant_ref_idx" ON "cfm_container_costs" USING btree ("tenant_id","cost_ref");--> statement-breakpoint
CREATE INDEX "cfm_ccost_container_idx" ON "cfm_container_costs" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "cfm_ccost_voyage_idx" ON "cfm_container_costs" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_ccost_category_idx" ON "cfm_container_costs" USING btree ("cost_category");--> statement-breakpoint
CREATE INDEX "cfm_ccost_status_idx" ON "cfm_container_costs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_cc_tenant_id_idx" ON "cfm_cost_centres" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_cc_tenant_code_idx" ON "cfm_cost_centres" USING btree ("tenant_id","centre_code");--> statement-breakpoint
CREATE INDEX "cfm_cc_parent_idx" ON "cfm_cost_centres" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "cfm_cc_type_idx" ON "cfm_cost_centres" USING btree ("centre_type");--> statement-breakpoint
CREATE INDEX "cfm_cc_dept_idx" ON "cfm_cost_centres" USING btree ("department");--> statement-breakpoint
CREATE INDEX "cfm_cc_active_idx" ON "cfm_cost_centres" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cfm_kpi_tenant_id_idx" ON "cfm_kpi_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_kpi_tenant_ref_idx" ON "cfm_kpi_reports" USING btree ("tenant_id","report_ref");--> statement-breakpoint
CREATE INDEX "cfm_kpi_type_idx" ON "cfm_kpi_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "cfm_kpi_period_idx" ON "cfm_kpi_reports" USING btree ("report_period");--> statement-breakpoint
CREATE INDEX "cfm_kpi_year_idx" ON "cfm_kpi_reports" USING btree ("report_year");--> statement-breakpoint
CREATE INDEX "cfm_kpi_status_idx" ON "cfm_kpi_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_ovhd_tenant_id_idx" ON "cfm_overhead_allocations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_ovhd_tenant_ref_idx" ON "cfm_overhead_allocations" USING btree ("tenant_id","allocation_ref");--> statement-breakpoint
CREATE INDEX "cfm_ovhd_centre_idx" ON "cfm_overhead_allocations" USING btree ("cost_centre");--> statement-breakpoint
CREATE INDEX "cfm_ovhd_period_idx" ON "cfm_overhead_allocations" USING btree ("allocation_period");--> statement-breakpoint
CREATE INDEX "cfm_ovhd_method_idx" ON "cfm_overhead_allocations" USING btree ("allocation_method");--> statement-breakpoint
CREATE INDEX "cfm_ovhd_status_idx" ON "cfm_overhead_allocations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_disb_tenant_id_idx" ON "cfm_port_disbursements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_disb_tenant_ref_idx" ON "cfm_port_disbursements" USING btree ("tenant_id","disbursement_ref");--> statement-breakpoint
CREATE INDEX "cfm_disb_voyage_idx" ON "cfm_port_disbursements" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_disb_vessel_idx" ON "cfm_port_disbursements" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "cfm_disb_port_idx" ON "cfm_port_disbursements" USING btree ("port");--> statement-breakpoint
CREATE INDEX "cfm_disb_type_idx" ON "cfm_port_disbursements" USING btree ("disbursement_type");--> statement-breakpoint
CREATE INDEX "cfm_disb_status_idx" ON "cfm_port_disbursements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_rev_tenant_id_idx" ON "cfm_revenue_recognitions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_rev_tenant_ref_idx" ON "cfm_revenue_recognitions" USING btree ("tenant_id","recognition_ref");--> statement-breakpoint
CREATE INDEX "cfm_rev_voyage_idx" ON "cfm_revenue_recognitions" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_rev_booking_idx" ON "cfm_revenue_recognitions" USING btree ("booking_ref");--> statement-breakpoint
CREATE INDEX "cfm_rev_type_idx" ON "cfm_revenue_recognitions" USING btree ("revenue_type");--> statement-breakpoint
CREATE INDEX "cfm_rev_method_idx" ON "cfm_revenue_recognitions" USING btree ("recognition_method");--> statement-breakpoint
CREATE INDEX "cfm_rev_status_idx" ON "cfm_revenue_recognitions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_var_tenant_id_idx" ON "cfm_variance_analyses" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_var_tenant_ref_idx" ON "cfm_variance_analyses" USING btree ("tenant_id","analysis_ref");--> statement-breakpoint
CREATE INDEX "cfm_var_voyage_idx" ON "cfm_variance_analyses" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_var_centre_idx" ON "cfm_variance_analyses" USING btree ("cost_centre");--> statement-breakpoint
CREATE INDEX "cfm_var_period_idx" ON "cfm_variance_analyses" USING btree ("analysis_period");--> statement-breakpoint
CREATE INDEX "cfm_var_type_idx" ON "cfm_variance_analyses" USING btree ("analysis_type");--> statement-breakpoint
CREATE INDEX "cfm_var_status_idx" ON "cfm_variance_analyses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_budgets_tenant_id_idx" ON "cfm_voyage_budgets" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_budgets_tenant_ref_idx" ON "cfm_voyage_budgets" USING btree ("tenant_id","budget_ref");--> statement-breakpoint
CREATE INDEX "cfm_budgets_voyage_idx" ON "cfm_voyage_budgets" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_budgets_vessel_idx" ON "cfm_voyage_budgets" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "cfm_budgets_type_idx" ON "cfm_voyage_budgets" USING btree ("budget_type");--> statement-breakpoint
CREATE INDEX "cfm_budgets_status_idx" ON "cfm_voyage_budgets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cfm_pnl_tenant_id_idx" ON "cfm_voyage_pnl_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfm_pnl_tenant_ref_idx" ON "cfm_voyage_pnl_reports" USING btree ("tenant_id","report_ref");--> statement-breakpoint
CREATE INDEX "cfm_pnl_voyage_idx" ON "cfm_voyage_pnl_reports" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "cfm_pnl_vessel_idx" ON "cfm_voyage_pnl_reports" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "cfm_pnl_service_idx" ON "cfm_voyage_pnl_reports" USING btree ("service_route");--> statement-breakpoint
CREATE INDEX "cfm_pnl_status_idx" ON "cfm_voyage_pnl_reports" USING btree ("status");