CREATE TABLE "firm_debit_credit_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"note_number" varchar(50) NOT NULL,
	"note_type" varchar(20) NOT NULL,
	"invoice_id" uuid,
	"invoice_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"reason" varchar(100) NOT NULL,
	"description" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"amount" integer NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"line_items" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"issued_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_dunning_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"action_ref" varchar(50) NOT NULL,
	"run_id" uuid,
	"invoice_id" uuid,
	"invoice_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"action_type" varchar(30) NOT NULL,
	"dunning_level" integer DEFAULT 1 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"outstanding_amount" integer NOT NULL,
	"days_past_due" integer DEFAULT 0 NOT NULL,
	"contact_method" varchar(20),
	"contact_details" text,
	"message_template" varchar(100),
	"sent_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"promised_date" timestamp with time zone,
	"promised_amount" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_dunning_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"run_ref" varchar(50) NOT NULL,
	"run_type" varchar(30) NOT NULL,
	"target_segment" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_outstanding" integer DEFAULT 0 NOT NULL,
	"invoices_targeted" integer DEFAULT 0 NOT NULL,
	"customers_targeted" integer DEFAULT 0 NOT NULL,
	"actions_generated" integer DEFAULT 0 NOT NULL,
	"actions_completed" integer DEFAULT 0 NOT NULL,
	"amount_collected" integer DEFAULT 0 NOT NULL,
	"ai_recommendations" jsonb,
	"ai_model_version" varchar(20),
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_freight_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_type" varchar(30) NOT NULL,
	"voyage_ref" varchar(50),
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"billing_address" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"outstanding_amount" integer NOT NULL,
	"exchange_rate" integer,
	"base_currency_amount" integer,
	"payment_terms" varchar(50),
	"due_date" timestamp with time zone,
	"issued_at" timestamp with time zone,
	"dispatched_at" timestamp with time zone,
	"dispatch_method" varchar(30),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_invoice_amendments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"amendment_ref" varchar(50) NOT NULL,
	"original_invoice_id" uuid NOT NULL,
	"original_invoice_number" varchar(50) NOT NULL,
	"amendment_type" varchar(30) NOT NULL,
	"reason" varchar(255) NOT NULL,
	"description" text,
	"previous_amount" integer NOT NULL,
	"new_amount" integer NOT NULL,
	"adjustment_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"changed_fields" jsonb,
	"new_invoice_id" uuid,
	"new_invoice_number" varchar(50),
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
CREATE TABLE "firm_invoice_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dispute_ref" varchar(50) NOT NULL,
	"invoice_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"dispute_type" varchar(30) NOT NULL,
	"disputed_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"reason" text NOT NULL,
	"customer_evidence" jsonb,
	"assigned_to" uuid,
	"assigned_to_name" varchar(255),
	"resolution_type" varchar(30),
	"resolved_amount" integer,
	"resolution_notes" text,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"escalated_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"sla_deadline" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"charge_code" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"container_number" varchar(20),
	"container_type" varchar(30),
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"amount" integer NOT NULL,
	"tax_rate" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"tariff_ref" varchar(50),
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_proforma_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proforma_number" varchar(50) NOT NULL,
	"voyage_ref" varchar(50),
	"booking_ref" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"line_items" jsonb,
	"valid_until" timestamp with time zone,
	"converted_to_invoice_id" uuid,
	"converted_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"issued_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_revenue_accruals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"accrual_ref" varchar(50) NOT NULL,
	"voyage_ref" varchar(50),
	"invoice_id" uuid,
	"accrual_type" varchar(30) NOT NULL,
	"accounting_period" varchar(20) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"accrual_amount" integer NOT NULL,
	"deferral_amount" integer DEFAULT 0 NOT NULL,
	"recognized_amount" integer DEFAULT 0 NOT NULL,
	"remaining_amount" integer NOT NULL,
	"journal_entry_ref" varchar(50),
	"gl_account_code" varchar(30),
	"reversal_date" timestamp with time zone,
	"reversal_ref" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"posted_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_revenue_forecast_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"forecast_ref" varchar(50) NOT NULL,
	"forecast_period" varchar(20) NOT NULL,
	"forecast_year" integer NOT NULL,
	"forecast_month" integer,
	"service_route" varchar(100),
	"customer_segment" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"forecast_revenue" integer NOT NULL,
	"actual_revenue" integer,
	"variance" integer,
	"variance_percent" integer,
	"pipeline_value" integer DEFAULT 0 NOT NULL,
	"confirmed_value" integer DEFAULT 0 NOT NULL,
	"probability_percent" integer,
	"forecast_method" varchar(30),
	"ai_model_version" varchar(20),
	"confidence_score" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "firm_debit_credit_notes" ADD CONSTRAINT "firm_debit_credit_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_debit_credit_notes" ADD CONSTRAINT "firm_debit_credit_notes_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_dunning_actions" ADD CONSTRAINT "firm_dunning_actions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_dunning_actions" ADD CONSTRAINT "firm_dunning_actions_run_id_firm_dunning_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."firm_dunning_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_dunning_actions" ADD CONSTRAINT "firm_dunning_actions_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_dunning_runs" ADD CONSTRAINT "firm_dunning_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_freight_invoices" ADD CONSTRAINT "firm_freight_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_amendments" ADD CONSTRAINT "firm_invoice_amendments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_amendments" ADD CONSTRAINT "firm_invoice_amendments_original_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("original_invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_amendments" ADD CONSTRAINT "firm_invoice_amendments_new_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("new_invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_disputes" ADD CONSTRAINT "firm_invoice_disputes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_disputes" ADD CONSTRAINT "firm_invoice_disputes_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_line_items" ADD CONSTRAINT "firm_invoice_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_line_items" ADD CONSTRAINT "firm_invoice_line_items_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_proforma_invoices" ADD CONSTRAINT "firm_proforma_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_proforma_invoices" ADD CONSTRAINT "firm_proforma_invoices_converted_to_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("converted_to_invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_revenue_accruals" ADD CONSTRAINT "firm_revenue_accruals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_revenue_accruals" ADD CONSTRAINT "firm_revenue_accruals_invoice_id_firm_freight_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."firm_freight_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_revenue_forecast_entries" ADD CONSTRAINT "firm_revenue_forecast_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "firm_dcn_tenant_id_idx" ON "firm_debit_credit_notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_dcn_tenant_number_idx" ON "firm_debit_credit_notes" USING btree ("tenant_id","note_number");--> statement-breakpoint
CREATE INDEX "firm_dcn_type_idx" ON "firm_debit_credit_notes" USING btree ("note_type");--> statement-breakpoint
CREATE INDEX "firm_dcn_invoice_idx" ON "firm_debit_credit_notes" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "firm_dcn_customer_idx" ON "firm_debit_credit_notes" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "firm_dcn_status_idx" ON "firm_debit_credit_notes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_da_tenant_id_idx" ON "firm_dunning_actions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_da_tenant_ref_idx" ON "firm_dunning_actions" USING btree ("tenant_id","action_ref");--> statement-breakpoint
CREATE INDEX "firm_da_run_idx" ON "firm_dunning_actions" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "firm_da_invoice_idx" ON "firm_dunning_actions" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "firm_da_customer_idx" ON "firm_dunning_actions" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "firm_da_type_idx" ON "firm_dunning_actions" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "firm_da_level_idx" ON "firm_dunning_actions" USING btree ("dunning_level");--> statement-breakpoint
CREATE INDEX "firm_da_status_idx" ON "firm_dunning_actions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_dunn_tenant_id_idx" ON "firm_dunning_runs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_dunn_tenant_ref_idx" ON "firm_dunning_runs" USING btree ("tenant_id","run_ref");--> statement-breakpoint
CREATE INDEX "firm_dunn_type_idx" ON "firm_dunning_runs" USING btree ("run_type");--> statement-breakpoint
CREATE INDEX "firm_dunn_status_idx" ON "firm_dunning_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_inv_tenant_id_idx" ON "firm_freight_invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_inv_tenant_number_idx" ON "firm_freight_invoices" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "firm_inv_type_idx" ON "firm_freight_invoices" USING btree ("invoice_type");--> statement-breakpoint
CREATE INDEX "firm_inv_customer_idx" ON "firm_freight_invoices" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "firm_inv_voyage_idx" ON "firm_freight_invoices" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "firm_inv_bl_idx" ON "firm_freight_invoices" USING btree ("bl_number");--> statement-breakpoint
CREATE INDEX "firm_inv_status_idx" ON "firm_freight_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_inv_due_date_idx" ON "firm_freight_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "firm_amend_tenant_id_idx" ON "firm_invoice_amendments" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_amend_tenant_ref_idx" ON "firm_invoice_amendments" USING btree ("tenant_id","amendment_ref");--> statement-breakpoint
CREATE INDEX "firm_amend_orig_inv_idx" ON "firm_invoice_amendments" USING btree ("original_invoice_id");--> statement-breakpoint
CREATE INDEX "firm_amend_type_idx" ON "firm_invoice_amendments" USING btree ("amendment_type");--> statement-breakpoint
CREATE INDEX "firm_amend_status_idx" ON "firm_invoice_amendments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_disp_tenant_id_idx" ON "firm_invoice_disputes" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_disp_tenant_ref_idx" ON "firm_invoice_disputes" USING btree ("tenant_id","dispute_ref");--> statement-breakpoint
CREATE INDEX "firm_disp_invoice_idx" ON "firm_invoice_disputes" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "firm_disp_customer_idx" ON "firm_invoice_disputes" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "firm_disp_type_idx" ON "firm_invoice_disputes" USING btree ("dispute_type");--> statement-breakpoint
CREATE INDEX "firm_disp_status_idx" ON "firm_invoice_disputes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_disp_assigned_idx" ON "firm_invoice_disputes" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "firm_li_tenant_id_idx" ON "firm_invoice_line_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "firm_li_invoice_idx" ON "firm_invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "firm_li_charge_code_idx" ON "firm_invoice_line_items" USING btree ("charge_code");--> statement-breakpoint
CREATE INDEX "firm_li_container_idx" ON "firm_invoice_line_items" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "firm_proforma_tenant_id_idx" ON "firm_proforma_invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_proforma_tenant_number_idx" ON "firm_proforma_invoices" USING btree ("tenant_id","proforma_number");--> statement-breakpoint
CREATE INDEX "firm_proforma_customer_idx" ON "firm_proforma_invoices" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "firm_proforma_voyage_idx" ON "firm_proforma_invoices" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "firm_proforma_status_idx" ON "firm_proforma_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_accr_tenant_id_idx" ON "firm_revenue_accruals" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_accr_tenant_ref_idx" ON "firm_revenue_accruals" USING btree ("tenant_id","accrual_ref");--> statement-breakpoint
CREATE INDEX "firm_accr_voyage_idx" ON "firm_revenue_accruals" USING btree ("voyage_ref");--> statement-breakpoint
CREATE INDEX "firm_accr_invoice_idx" ON "firm_revenue_accruals" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "firm_accr_type_idx" ON "firm_revenue_accruals" USING btree ("accrual_type");--> statement-breakpoint
CREATE INDEX "firm_accr_period_idx" ON "firm_revenue_accruals" USING btree ("accounting_period");--> statement-breakpoint
CREATE INDEX "firm_accr_status_idx" ON "firm_revenue_accruals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_fcst_tenant_id_idx" ON "firm_revenue_forecast_entries" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_fcst_tenant_ref_idx" ON "firm_revenue_forecast_entries" USING btree ("tenant_id","forecast_ref");--> statement-breakpoint
CREATE INDEX "firm_fcst_period_idx" ON "firm_revenue_forecast_entries" USING btree ("forecast_period");--> statement-breakpoint
CREATE INDEX "firm_fcst_year_idx" ON "firm_revenue_forecast_entries" USING btree ("forecast_year");--> statement-breakpoint
CREATE INDEX "firm_fcst_route_idx" ON "firm_revenue_forecast_entries" USING btree ("service_route");--> statement-breakpoint
CREATE INDEX "firm_fcst_status_idx" ON "firm_revenue_forecast_entries" USING btree ("status");