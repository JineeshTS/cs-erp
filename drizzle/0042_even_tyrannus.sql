CREATE TABLE "glfr_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"budget_ref" varchar(50) NOT NULL,
	"budget_type" varchar(30) NOT NULL,
	"budget_name" varchar(255),
	"fiscal_year" integer,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'QAR',
	"department" varchar(255),
	"cost_center" varchar(100),
	"total_budgeted" numeric(18, 2),
	"total_actual" numeric(18, 2),
	"total_variance" numeric(18, 2),
	"variance_percentage" numeric(8, 2),
	"line_items" jsonb,
	"revision_history" jsonb,
	"current_revision" integer,
	"prepared_by" varchar(255),
	"approved_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_chart_of_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_ref" varchar(50) NOT NULL,
	"account_type" varchar(30) NOT NULL,
	"account_code" varchar(50) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"parent_account_id" varchar(100),
	"account_level" integer,
	"currency" varchar(3) DEFAULT 'QAR',
	"normal_balance" varchar(10),
	"is_control_account" boolean,
	"is_reconcilable" boolean,
	"is_bank_account" boolean,
	"segment" varchar(100),
	"cost_center" varchar(100),
	"department" varchar(255),
	"tax_code" varchar(50),
	"opening_balance" numeric(18, 2),
	"current_balance" numeric(18, 2),
	"description" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_consolidated_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"consolidation_ref" varchar(50) NOT NULL,
	"consolidation_type" varchar(30) NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"fiscal_year" integer,
	"currency" varchar(3) DEFAULT 'QAR',
	"parent_entity" varchar(255),
	"subsidiaries" jsonb,
	"elimination_entries" jsonb,
	"translation_adjustments" jsonb,
	"minority_interest" numeric(18, 2),
	"consolidated_revenue" numeric(18, 2),
	"consolidated_net_income" numeric(18, 2),
	"consolidated_assets" numeric(18, 2),
	"consolidated_liabilities" numeric(18, 2),
	"consolidated_equity" numeric(18, 2),
	"prepared_by" varchar(255),
	"approved_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_financial_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"statement_ref" varchar(50) NOT NULL,
	"statement_type" varchar(30) NOT NULL,
	"reporting_standard" varchar(30),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"fiscal_year" integer,
	"currency" varchar(3) DEFAULT 'QAR',
	"entity_id" varchar(100),
	"line_items" jsonb,
	"comparative_period" jsonb,
	"total_assets" numeric(18, 2),
	"total_liabilities" numeric(18, 2),
	"total_equity" numeric(18, 2),
	"net_income" numeric(18, 2),
	"generated_by" varchar(255),
	"generated_at" timestamp with time zone,
	"approved_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entry_ref" varchar(50) NOT NULL,
	"entry_type" varchar(30) NOT NULL,
	"entry_date" timestamp with time zone,
	"posting_date" timestamp with time zone,
	"period_id" varchar(100),
	"description" text,
	"currency" varchar(3) DEFAULT 'QAR',
	"total_debit" numeric(18, 2),
	"total_credit" numeric(18, 2),
	"line_items" jsonb,
	"source_module" varchar(100),
	"source_document_ref" varchar(100),
	"reversal_entry_id" varchar(100),
	"is_auto_generated" boolean,
	"prepared_by" varchar(255),
	"reviewed_by" varchar(255),
	"approved_by" varchar(255),
	"posted_by" varchar(255),
	"posted_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_period_closures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"closure_ref" varchar(50) NOT NULL,
	"closure_type" varchar(30) NOT NULL,
	"period_name" varchar(100),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"fiscal_year" integer,
	"fiscal_month" integer,
	"checklist_items" jsonb,
	"completed_steps" integer,
	"total_steps" integer,
	"accrual_entries" jsonb,
	"reclassifications" jsonb,
	"closed_by" varchar(255),
	"closed_at" timestamp with time zone,
	"reopened_by" varchar(255),
	"reopened_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_segment_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"segment_name" varchar(255),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"fiscal_year" integer,
	"currency" varchar(3) DEFAULT 'QAR',
	"revenue" numeric(18, 2),
	"cost_of_revenue" numeric(18, 2),
	"gross_profit" numeric(18, 2),
	"operating_expenses" numeric(18, 2),
	"operating_income" numeric(18, 2),
	"segment_assets" numeric(18, 2),
	"segment_liabilities" numeric(18, 2),
	"inter_segment_revenue" numeric(18, 2),
	"breakdown_items" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "glfr_variance_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analysis_ref" varchar(50) NOT NULL,
	"analysis_type" varchar(30) NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"fiscal_year" integer,
	"currency" varchar(3) DEFAULT 'QAR',
	"budget_amount" numeric(18, 2),
	"actual_amount" numeric(18, 2),
	"variance_amount" numeric(18, 2),
	"variance_percentage" numeric(8, 2),
	"favorable_unfavorable" varchar(20),
	"department" varchar(255),
	"cost_center" varchar(100),
	"account_code" varchar(50),
	"line_items" jsonb,
	"commentary" text,
	"action_items" jsonb,
	"prepared_by" varchar(255),
	"reviewed_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "glfr_budgets" ADD CONSTRAINT "glfr_budgets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_chart_of_accounts" ADD CONSTRAINT "glfr_chart_of_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_consolidated_statements" ADD CONSTRAINT "glfr_consolidated_statements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_financial_statements" ADD CONSTRAINT "glfr_financial_statements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_journal_entries" ADD CONSTRAINT "glfr_journal_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_period_closures" ADD CONSTRAINT "glfr_period_closures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_segment_reports" ADD CONSTRAINT "glfr_segment_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glfr_variance_analyses" ADD CONSTRAINT "glfr_variance_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "glfr_bgt_tenant_idx" ON "glfr_budgets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_bgt_ref_idx" ON "glfr_budgets" USING btree ("budget_ref");--> statement-breakpoint
CREATE INDEX "glfr_bgt_status_idx" ON "glfr_budgets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_bgt_year_idx" ON "glfr_budgets" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "glfr_coa_tenant_idx" ON "glfr_chart_of_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_coa_ref_idx" ON "glfr_chart_of_accounts" USING btree ("account_ref");--> statement-breakpoint
CREATE INDEX "glfr_coa_code_idx" ON "glfr_chart_of_accounts" USING btree ("account_code");--> statement-breakpoint
CREATE INDEX "glfr_coa_status_idx" ON "glfr_chart_of_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_coa_type_idx" ON "glfr_chart_of_accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "glfr_cs_tenant_idx" ON "glfr_consolidated_statements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_cs_ref_idx" ON "glfr_consolidated_statements" USING btree ("consolidation_ref");--> statement-breakpoint
CREATE INDEX "glfr_cs_status_idx" ON "glfr_consolidated_statements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_cs_type_idx" ON "glfr_consolidated_statements" USING btree ("consolidation_type");--> statement-breakpoint
CREATE INDEX "glfr_fs_tenant_idx" ON "glfr_financial_statements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_fs_ref_idx" ON "glfr_financial_statements" USING btree ("statement_ref");--> statement-breakpoint
CREATE INDEX "glfr_fs_status_idx" ON "glfr_financial_statements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_fs_type_idx" ON "glfr_financial_statements" USING btree ("statement_type");--> statement-breakpoint
CREATE INDEX "glfr_je_tenant_idx" ON "glfr_journal_entries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_je_ref_idx" ON "glfr_journal_entries" USING btree ("entry_ref");--> statement-breakpoint
CREATE INDEX "glfr_je_status_idx" ON "glfr_journal_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_je_date_idx" ON "glfr_journal_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "glfr_pc_tenant_idx" ON "glfr_period_closures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_pc_ref_idx" ON "glfr_period_closures" USING btree ("closure_ref");--> statement-breakpoint
CREATE INDEX "glfr_pc_status_idx" ON "glfr_period_closures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_pc_year_idx" ON "glfr_period_closures" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "glfr_sr_tenant_idx" ON "glfr_segment_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_sr_ref_idx" ON "glfr_segment_reports" USING btree ("report_ref");--> statement-breakpoint
CREATE INDEX "glfr_sr_status_idx" ON "glfr_segment_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_sr_type_idx" ON "glfr_segment_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "glfr_va_tenant_idx" ON "glfr_variance_analyses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "glfr_va_ref_idx" ON "glfr_variance_analyses" USING btree ("analysis_ref");--> statement-breakpoint
CREATE INDEX "glfr_va_status_idx" ON "glfr_variance_analyses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "glfr_va_type_idx" ON "glfr_variance_analyses" USING btree ("analysis_type");