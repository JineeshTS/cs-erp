CREATE TABLE "arcc_aging_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"report_date" timestamp with time zone NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_receivables" integer DEFAULT 0 NOT NULL,
	"current_amount" integer DEFAULT 0 NOT NULL,
	"days_1_to_30" integer DEFAULT 0 NOT NULL,
	"days_31_to_60" integer DEFAULT 0 NOT NULL,
	"days_61_to_90" integer DEFAULT 0 NOT NULL,
	"days_91_to_120" integer DEFAULT 0 NOT NULL,
	"over_120_days" integer DEFAULT 0 NOT NULL,
	"total_customers" integer DEFAULT 0 NOT NULL,
	"overdue_customers" integer DEFAULT 0 NOT NULL,
	"overdue_percent" integer DEFAULT 0 NOT NULL,
	"weighted_avg_days_sales" integer,
	"aging_details" jsonb,
	"filter_criteria" jsonb,
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
CREATE TABLE "arcc_bad_debt_provisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provision_ref" varchar(50) NOT NULL,
	"provision_type" varchar(30) NOT NULL,
	"account_id" uuid,
	"account_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"invoice_ref" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"original_amount" integer NOT NULL,
	"provision_amount" integer NOT NULL,
	"write_off_amount" integer DEFAULT 0 NOT NULL,
	"recovered_amount" integer DEFAULT 0 NOT NULL,
	"net_provision" integer NOT NULL,
	"provision_percent" integer DEFAULT 0 NOT NULL,
	"aging_bucket" varchar(30),
	"reason" text,
	"journal_entry_ref" varchar(50),
	"gl_account_code" varchar(20),
	"accounting_period" varchar(10),
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"write_off_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arcc_cash_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"application_ref" varchar(50) NOT NULL,
	"account_id" uuid,
	"account_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"payment_reference" varchar(100) NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_amount" integer NOT NULL,
	"applied_amount" integer DEFAULT 0 NOT NULL,
	"unapplied_amount" integer NOT NULL,
	"bank_reference" varchar(100),
	"bank_account" varchar(50),
	"exchange_rate" integer,
	"base_currency_amount" integer,
	"allocations" jsonb,
	"auto_matched" boolean DEFAULT false NOT NULL,
	"match_confidence" integer,
	"applied_by" uuid,
	"applied_by_name" varchar(255),
	"applied_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arcc_cash_flow_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"forecast_ref" varchar(50) NOT NULL,
	"forecast_period" varchar(10) NOT NULL,
	"forecast_year" integer NOT NULL,
	"forecast_month" integer NOT NULL,
	"forecast_week" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"opening_balance" integer DEFAULT 0 NOT NULL,
	"expected_inflows" integer DEFAULT 0 NOT NULL,
	"confirmed_inflows" integer DEFAULT 0 NOT NULL,
	"probable_inflows" integer DEFAULT 0 NOT NULL,
	"at_risk_inflows" integer DEFAULT 0 NOT NULL,
	"expected_outflows" integer DEFAULT 0 NOT NULL,
	"net_cash_flow" integer DEFAULT 0 NOT NULL,
	"closing_balance" integer DEFAULT 0 NOT NULL,
	"actual_inflows" integer,
	"actual_outflows" integer,
	"variance_amount" integer,
	"variance_percent" integer,
	"forecast_method" varchar(30) NOT NULL,
	"ai_model_version" varchar(50),
	"confidence_score" integer,
	"assumptions" jsonb,
	"scenario_type" varchar(20) DEFAULT 'base' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arcc_collection_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_ref" varchar(50) NOT NULL,
	"account_id" uuid,
	"account_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_outstanding" integer NOT NULL,
	"total_overdue" integer DEFAULT 0 NOT NULL,
	"oldest_overdue_days" integer DEFAULT 0 NOT NULL,
	"invoice_count" integer DEFAULT 0 NOT NULL,
	"escalation_level" integer DEFAULT 1 NOT NULL,
	"escalation_type" varchar(30) NOT NULL,
	"assigned_to" uuid,
	"assigned_to_name" varchar(255),
	"last_contact_date" timestamp with time zone,
	"last_contact_method" varchar(30),
	"next_action_date" timestamp with time zone,
	"next_action_type" varchar(30),
	"promised_date" timestamp with time zone,
	"promised_amount" integer,
	"collected_amount" integer DEFAULT 0 NOT NULL,
	"action_history" jsonb,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arcc_credit_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"credit_limit" integer NOT NULL,
	"current_exposure" integer DEFAULT 0 NOT NULL,
	"available_credit" integer NOT NULL,
	"utilization_percent" integer DEFAULT 0 NOT NULL,
	"risk_category" varchar(20) DEFAULT 'standard' NOT NULL,
	"risk_score" integer,
	"risk_factors" jsonb,
	"credit_insured" boolean DEFAULT false NOT NULL,
	"insurer_name" varchar(255),
	"insured_amount" integer,
	"insurance_policy_ref" varchar(100),
	"insurance_expiry_date" timestamp with time zone,
	"last_review_date" timestamp with time zone,
	"next_review_date" timestamp with time zone,
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arcc_customer_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"trading_name" varchar(255),
	"registration_number" varchar(100),
	"tax_id" varchar(50),
	"industry" varchar(100),
	"segment" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_terms" varchar(50),
	"billing_address" text,
	"billing_email" varchar(255),
	"billing_phone" varchar(50),
	"primary_contact" varchar(255),
	"account_manager_id" uuid,
	"account_manager_name" varchar(255),
	"total_outstanding" integer DEFAULT 0 NOT NULL,
	"total_overdue" integer DEFAULT 0 NOT NULL,
	"last_payment_date" timestamp with time zone,
	"last_payment_amount" integer,
	"last_invoice_date" timestamp with time zone,
	"account_status" varchar(20) DEFAULT 'active' NOT NULL,
	"on_hold" boolean DEFAULT false NOT NULL,
	"hold_reason" text,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arcc_payment_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prediction_ref" varchar(50) NOT NULL,
	"account_id" uuid,
	"account_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"invoice_ref" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"invoice_amount" integer NOT NULL,
	"outstanding_amount" integer NOT NULL,
	"predicted_payment_date" timestamp with time zone,
	"predicted_amount" integer,
	"payment_probability" integer,
	"default_probability" integer,
	"payment_score" integer,
	"risk_score" integer,
	"behavior_score" integer,
	"ai_model_version" varchar(50),
	"confidence_score" integer,
	"features" jsonb,
	"prediction_factors" jsonb,
	"actual_payment_date" timestamp with time zone,
	"actual_amount" integer,
	"prediction_accuracy" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arcc_aging_reports" ADD CONSTRAINT "arcc_aging_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_bad_debt_provisions" ADD CONSTRAINT "arcc_bad_debt_provisions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_bad_debt_provisions" ADD CONSTRAINT "arcc_bad_debt_provisions_account_id_arcc_customer_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."arcc_customer_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_cash_applications" ADD CONSTRAINT "arcc_cash_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_cash_applications" ADD CONSTRAINT "arcc_cash_applications_account_id_arcc_customer_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."arcc_customer_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_cash_flow_forecasts" ADD CONSTRAINT "arcc_cash_flow_forecasts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_collection_workflows" ADD CONSTRAINT "arcc_collection_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_collection_workflows" ADD CONSTRAINT "arcc_collection_workflows_account_id_arcc_customer_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."arcc_customer_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_credit_limits" ADD CONSTRAINT "arcc_credit_limits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_credit_limits" ADD CONSTRAINT "arcc_credit_limits_account_id_arcc_customer_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."arcc_customer_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_customer_accounts" ADD CONSTRAINT "arcc_customer_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_payment_predictions" ADD CONSTRAINT "arcc_payment_predictions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_payment_predictions" ADD CONSTRAINT "arcc_payment_predictions_account_id_arcc_customer_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."arcc_customer_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "arcc_ar_tenant_id_idx" ON "arcc_aging_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_ar_tenant_ref_idx" ON "arcc_aging_reports" USING btree ("tenant_id","report_ref");--> statement-breakpoint
CREATE INDEX "arcc_ar_type_idx" ON "arcc_aging_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "arcc_ar_date_idx" ON "arcc_aging_reports" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "arcc_ar_status_idx" ON "arcc_aging_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "arcc_bdp_tenant_id_idx" ON "arcc_bad_debt_provisions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_bdp_tenant_ref_idx" ON "arcc_bad_debt_provisions" USING btree ("tenant_id","provision_ref");--> statement-breakpoint
CREATE INDEX "arcc_bdp_type_idx" ON "arcc_bad_debt_provisions" USING btree ("provision_type");--> statement-breakpoint
CREATE INDEX "arcc_bdp_account_id_idx" ON "arcc_bad_debt_provisions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "arcc_bdp_aging_bucket_idx" ON "arcc_bad_debt_provisions" USING btree ("aging_bucket");--> statement-breakpoint
CREATE INDEX "arcc_bdp_period_idx" ON "arcc_bad_debt_provisions" USING btree ("accounting_period");--> statement-breakpoint
CREATE INDEX "arcc_bdp_status_idx" ON "arcc_bad_debt_provisions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "arcc_cash_tenant_id_idx" ON "arcc_cash_applications" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_cash_tenant_ref_idx" ON "arcc_cash_applications" USING btree ("tenant_id","application_ref");--> statement-breakpoint
CREATE INDEX "arcc_cash_account_id_idx" ON "arcc_cash_applications" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "arcc_cash_payment_ref_idx" ON "arcc_cash_applications" USING btree ("payment_reference");--> statement-breakpoint
CREATE INDEX "arcc_cash_payment_method_idx" ON "arcc_cash_applications" USING btree ("payment_method");--> statement-breakpoint
CREATE INDEX "arcc_cash_payment_date_idx" ON "arcc_cash_applications" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "arcc_cash_status_idx" ON "arcc_cash_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "arcc_cash_auto_matched_idx" ON "arcc_cash_applications" USING btree ("auto_matched");--> statement-breakpoint
CREATE INDEX "arcc_cff_tenant_id_idx" ON "arcc_cash_flow_forecasts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_cff_tenant_ref_idx" ON "arcc_cash_flow_forecasts" USING btree ("tenant_id","forecast_ref");--> statement-breakpoint
CREATE INDEX "arcc_cff_period_idx" ON "arcc_cash_flow_forecasts" USING btree ("forecast_period");--> statement-breakpoint
CREATE INDEX "arcc_cff_year_month_idx" ON "arcc_cash_flow_forecasts" USING btree ("forecast_year","forecast_month");--> statement-breakpoint
CREATE INDEX "arcc_cff_method_idx" ON "arcc_cash_flow_forecasts" USING btree ("forecast_method");--> statement-breakpoint
CREATE INDEX "arcc_cff_scenario_idx" ON "arcc_cash_flow_forecasts" USING btree ("scenario_type");--> statement-breakpoint
CREATE INDEX "arcc_cff_status_idx" ON "arcc_cash_flow_forecasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "arcc_cw_tenant_id_idx" ON "arcc_collection_workflows" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_cw_tenant_ref_idx" ON "arcc_collection_workflows" USING btree ("tenant_id","workflow_ref");--> statement-breakpoint
CREATE INDEX "arcc_cw_account_id_idx" ON "arcc_collection_workflows" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "arcc_cw_escalation_level_idx" ON "arcc_collection_workflows" USING btree ("escalation_level");--> statement-breakpoint
CREATE INDEX "arcc_cw_escalation_type_idx" ON "arcc_collection_workflows" USING btree ("escalation_type");--> statement-breakpoint
CREATE INDEX "arcc_cw_assigned_to_idx" ON "arcc_collection_workflows" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "arcc_cw_next_action_idx" ON "arcc_collection_workflows" USING btree ("next_action_date");--> statement-breakpoint
CREATE INDEX "arcc_cw_status_idx" ON "arcc_collection_workflows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "arcc_cl_tenant_id_idx" ON "arcc_credit_limits" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "arcc_cl_account_id_idx" ON "arcc_credit_limits" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "arcc_cl_risk_category_idx" ON "arcc_credit_limits" USING btree ("risk_category");--> statement-breakpoint
CREATE INDEX "arcc_cl_status_idx" ON "arcc_credit_limits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "arcc_cl_next_review_idx" ON "arcc_credit_limits" USING btree ("next_review_date");--> statement-breakpoint
CREATE INDEX "arcc_cl_insured_idx" ON "arcc_credit_limits" USING btree ("credit_insured");--> statement-breakpoint
CREATE INDEX "arcc_ca_tenant_id_idx" ON "arcc_customer_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_ca_tenant_account_idx" ON "arcc_customer_accounts" USING btree ("tenant_id","account_number");--> statement-breakpoint
CREATE INDEX "arcc_ca_customer_name_idx" ON "arcc_customer_accounts" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "arcc_ca_customer_code_idx" ON "arcc_customer_accounts" USING btree ("customer_code");--> statement-breakpoint
CREATE INDEX "arcc_ca_segment_idx" ON "arcc_customer_accounts" USING btree ("segment");--> statement-breakpoint
CREATE INDEX "arcc_ca_status_idx" ON "arcc_customer_accounts" USING btree ("account_status");--> statement-breakpoint
CREATE INDEX "arcc_ca_on_hold_idx" ON "arcc_customer_accounts" USING btree ("on_hold");--> statement-breakpoint
CREATE INDEX "arcc_pp_tenant_id_idx" ON "arcc_payment_predictions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "arcc_pp_tenant_ref_idx" ON "arcc_payment_predictions" USING btree ("tenant_id","prediction_ref");--> statement-breakpoint
CREATE INDEX "arcc_pp_account_id_idx" ON "arcc_payment_predictions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "arcc_pp_predicted_date_idx" ON "arcc_payment_predictions" USING btree ("predicted_payment_date");--> statement-breakpoint
CREATE INDEX "arcc_pp_payment_score_idx" ON "arcc_payment_predictions" USING btree ("payment_score");--> statement-breakpoint
CREATE INDEX "arcc_pp_risk_score_idx" ON "arcc_payment_predictions" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "arcc_pp_status_idx" ON "arcc_payment_predictions" USING btree ("status");