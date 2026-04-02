CREATE TABLE "apvm_ocr_extractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"extraction_ref" varchar(50) NOT NULL,
	"document_id" varchar(100),
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(20) NOT NULL,
	"file_size" integer,
	"vendor_name" varchar(255),
	"extracted_vendor_code" varchar(50),
	"extracted_invoice_number" varchar(100),
	"extracted_invoice_date" timestamp with time zone,
	"extracted_due_date" timestamp with time zone,
	"extracted_currency" varchar(3),
	"extracted_subtotal" integer,
	"extracted_tax_amount" integer,
	"extracted_total_amount" integer,
	"extracted_line_items" jsonb,
	"extracted_fields" jsonb,
	"confidence_score" integer,
	"ai_model_version" varchar(50),
	"processing_time_ms" integer,
	"validation_errors" jsonb,
	"linked_invoice_id" uuid,
	"reviewed_by" uuid,
	"reviewed_by_name" varchar(255),
	"reviewed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'processing' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apvm_payment_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"schedule_ref" varchar(50) NOT NULL,
	"vendor_id" uuid,
	"vendor_name" varchar(255) NOT NULL,
	"invoice_id" uuid,
	"invoice_number" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_amount" integer NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"bank_account" varchar(50),
	"beneficiary_account" varchar(50),
	"payment_reference" varchar(100),
	"exchange_rate" integer,
	"base_currency_amount" integer,
	"batch_id" varchar(50),
	"priority_level" varchar(20) DEFAULT 'normal' NOT NULL,
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"executed_at" timestamp with time zone,
	"confirmation_ref" varchar(100),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apvm_purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"po_number" varchar(50) NOT NULL,
	"vendor_id" uuid,
	"vendor_code" varchar(50),
	"vendor_name" varchar(255) NOT NULL,
	"po_type" varchar(30) NOT NULL,
	"description" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"delivery_date" timestamp with time zone,
	"delivery_address" text,
	"line_items" jsonb,
	"payment_terms" varchar(50),
	"budget_code" varchar(50),
	"cost_centre" varchar(50),
	"requested_by" uuid,
	"requested_by_name" varchar(255),
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"received_amount" integer DEFAULT 0 NOT NULL,
	"invoiced_amount" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apvm_spend_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"report_period" varchar(10) NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_spend" integer DEFAULT 0 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"total_payments" integer DEFAULT 0 NOT NULL,
	"average_payment_days" integer,
	"on_time_payment_percent" integer,
	"top_vendors" jsonb,
	"spend_by_category" jsonb,
	"spend_by_department" jsonb,
	"savings_identified" integer,
	"contract_compliance" integer,
	"maverick_spend" integer,
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
CREATE TABLE "apvm_three_way_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"match_ref" varchar(50) NOT NULL,
	"invoice_id" uuid,
	"invoice_number" varchar(50),
	"po_id" uuid,
	"po_number" varchar(50),
	"vendor_name" varchar(255) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"po_amount" integer NOT NULL,
	"gr_amount" integer NOT NULL,
	"invoice_amount" integer NOT NULL,
	"variance_amount" integer DEFAULT 0 NOT NULL,
	"variance_percent" integer DEFAULT 0 NOT NULL,
	"tolerance_percent" integer DEFAULT 5 NOT NULL,
	"within_tolerance" boolean DEFAULT false NOT NULL,
	"price_match" boolean DEFAULT false NOT NULL,
	"quantity_match" boolean DEFAULT false NOT NULL,
	"line_match_details" jsonb,
	"auto_matched" boolean DEFAULT false NOT NULL,
	"matched_by" uuid,
	"matched_by_name" varchar(255),
	"matched_at" timestamp with time zone,
	"exception_reason" text,
	"resolved_by" uuid,
	"resolved_by_name" varchar(255),
	"resolved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apvm_vendor_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"vendor_invoice_ref" varchar(100),
	"vendor_id" uuid,
	"vendor_code" varchar(50),
	"vendor_name" varchar(255) NOT NULL,
	"po_id" uuid,
	"po_number" varchar(50),
	"invoice_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"outstanding_amount" integer NOT NULL,
	"line_items" jsonb,
	"exchange_rate" integer,
	"base_currency_amount" integer,
	"match_status" varchar(20) DEFAULT 'unmatched' NOT NULL,
	"matched_at" timestamp with time zone,
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
CREATE TABLE "apvm_vendor_masters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vendor_code" varchar(50) NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"trading_name" varchar(255),
	"vendor_type" varchar(30) NOT NULL,
	"registration_number" varchar(100),
	"tax_id" varchar(50),
	"industry" varchar(100),
	"country" varchar(3),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_terms" varchar(50),
	"bank_name" varchar(255),
	"bank_account_number" varchar(50),
	"bank_swift_code" varchar(20),
	"bank_iban" varchar(50),
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"address" text,
	"onboarding_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"onboarding_checklist" jsonb,
	"approved_by" uuid,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"risk_rating" varchar(20),
	"performance_score" integer,
	"total_spend" integer DEFAULT 0 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apvm_vendor_reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reconciliation_ref" varchar(50) NOT NULL,
	"vendor_id" uuid,
	"vendor_name" varchar(255) NOT NULL,
	"reconciliation_date" timestamp with time zone NOT NULL,
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"our_balance" integer NOT NULL,
	"vendor_balance" integer NOT NULL,
	"difference_amount" integer DEFAULT 0 NOT NULL,
	"reconciled_amount" integer DEFAULT 0 NOT NULL,
	"unreconciled_amount" integer DEFAULT 0 NOT NULL,
	"unreconciled_items" jsonb,
	"adjustment_entries" jsonb,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"total_payments" integer DEFAULT 0 NOT NULL,
	"matched_items" integer DEFAULT 0 NOT NULL,
	"unmatched_items" integer DEFAULT 0 NOT NULL,
	"performed_by" uuid,
	"performed_by_name" varchar(255),
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
ALTER TABLE "apvm_ocr_extractions" ADD CONSTRAINT "apvm_ocr_extractions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_ocr_extractions" ADD CONSTRAINT "apvm_ocr_extractions_linked_invoice_id_apvm_vendor_invoices_id_fk" FOREIGN KEY ("linked_invoice_id") REFERENCES "public"."apvm_vendor_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_payment_schedules" ADD CONSTRAINT "apvm_payment_schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_payment_schedules" ADD CONSTRAINT "apvm_payment_schedules_vendor_id_apvm_vendor_masters_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."apvm_vendor_masters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_payment_schedules" ADD CONSTRAINT "apvm_payment_schedules_invoice_id_apvm_vendor_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."apvm_vendor_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_purchase_orders" ADD CONSTRAINT "apvm_purchase_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_purchase_orders" ADD CONSTRAINT "apvm_purchase_orders_vendor_id_apvm_vendor_masters_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."apvm_vendor_masters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_spend_analytics" ADD CONSTRAINT "apvm_spend_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_three_way_matches" ADD CONSTRAINT "apvm_three_way_matches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_three_way_matches" ADD CONSTRAINT "apvm_three_way_matches_invoice_id_apvm_vendor_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."apvm_vendor_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_three_way_matches" ADD CONSTRAINT "apvm_three_way_matches_po_id_apvm_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."apvm_purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_vendor_invoices" ADD CONSTRAINT "apvm_vendor_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_vendor_invoices" ADD CONSTRAINT "apvm_vendor_invoices_vendor_id_apvm_vendor_masters_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."apvm_vendor_masters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_vendor_invoices" ADD CONSTRAINT "apvm_vendor_invoices_po_id_apvm_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."apvm_purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_vendor_masters" ADD CONSTRAINT "apvm_vendor_masters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_vendor_reconciliations" ADD CONSTRAINT "apvm_vendor_reconciliations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apvm_vendor_reconciliations" ADD CONSTRAINT "apvm_vendor_reconciliations_vendor_id_apvm_vendor_masters_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."apvm_vendor_masters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apvm_ocr_tenant_id_idx" ON "apvm_ocr_extractions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_ocr_tenant_ref_idx" ON "apvm_ocr_extractions" USING btree ("tenant_id","extraction_ref");--> statement-breakpoint
CREATE INDEX "apvm_ocr_vendor_name_idx" ON "apvm_ocr_extractions" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "apvm_ocr_file_type_idx" ON "apvm_ocr_extractions" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "apvm_ocr_confidence_idx" ON "apvm_ocr_extractions" USING btree ("confidence_score");--> statement-breakpoint
CREATE INDEX "apvm_ocr_linked_invoice_idx" ON "apvm_ocr_extractions" USING btree ("linked_invoice_id");--> statement-breakpoint
CREATE INDEX "apvm_ocr_status_idx" ON "apvm_ocr_extractions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_ps_tenant_id_idx" ON "apvm_payment_schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_ps_tenant_ref_idx" ON "apvm_payment_schedules" USING btree ("tenant_id","schedule_ref");--> statement-breakpoint
CREATE INDEX "apvm_ps_vendor_id_idx" ON "apvm_payment_schedules" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "apvm_ps_invoice_id_idx" ON "apvm_payment_schedules" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "apvm_ps_scheduled_date_idx" ON "apvm_payment_schedules" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "apvm_ps_payment_method_idx" ON "apvm_payment_schedules" USING btree ("payment_method");--> statement-breakpoint
CREATE INDEX "apvm_ps_batch_id_idx" ON "apvm_payment_schedules" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "apvm_ps_priority_idx" ON "apvm_payment_schedules" USING btree ("priority_level");--> statement-breakpoint
CREATE INDEX "apvm_ps_status_idx" ON "apvm_payment_schedules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_po_tenant_id_idx" ON "apvm_purchase_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_po_tenant_number_idx" ON "apvm_purchase_orders" USING btree ("tenant_id","po_number");--> statement-breakpoint
CREATE INDEX "apvm_po_vendor_id_idx" ON "apvm_purchase_orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "apvm_po_vendor_name_idx" ON "apvm_purchase_orders" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "apvm_po_type_idx" ON "apvm_purchase_orders" USING btree ("po_type");--> statement-breakpoint
CREATE INDEX "apvm_po_delivery_date_idx" ON "apvm_purchase_orders" USING btree ("delivery_date");--> statement-breakpoint
CREATE INDEX "apvm_po_budget_code_idx" ON "apvm_purchase_orders" USING btree ("budget_code");--> statement-breakpoint
CREATE INDEX "apvm_po_status_idx" ON "apvm_purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_sa_tenant_id_idx" ON "apvm_spend_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_sa_tenant_ref_idx" ON "apvm_spend_analytics" USING btree ("tenant_id","report_ref");--> statement-breakpoint
CREATE INDEX "apvm_sa_type_idx" ON "apvm_spend_analytics" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "apvm_sa_year_month_idx" ON "apvm_spend_analytics" USING btree ("report_year","report_month");--> statement-breakpoint
CREATE INDEX "apvm_sa_status_idx" ON "apvm_spend_analytics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_twm_tenant_id_idx" ON "apvm_three_way_matches" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_twm_tenant_ref_idx" ON "apvm_three_way_matches" USING btree ("tenant_id","match_ref");--> statement-breakpoint
CREATE INDEX "apvm_twm_invoice_id_idx" ON "apvm_three_way_matches" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "apvm_twm_po_id_idx" ON "apvm_three_way_matches" USING btree ("po_id");--> statement-breakpoint
CREATE INDEX "apvm_twm_vendor_name_idx" ON "apvm_three_way_matches" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "apvm_twm_within_tolerance_idx" ON "apvm_three_way_matches" USING btree ("within_tolerance");--> statement-breakpoint
CREATE INDEX "apvm_twm_auto_matched_idx" ON "apvm_three_way_matches" USING btree ("auto_matched");--> statement-breakpoint
CREATE INDEX "apvm_twm_status_idx" ON "apvm_three_way_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_vi_tenant_id_idx" ON "apvm_vendor_invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_vi_tenant_number_idx" ON "apvm_vendor_invoices" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "apvm_vi_vendor_id_idx" ON "apvm_vendor_invoices" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "apvm_vi_vendor_name_idx" ON "apvm_vendor_invoices" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "apvm_vi_po_id_idx" ON "apvm_vendor_invoices" USING btree ("po_id");--> statement-breakpoint
CREATE INDEX "apvm_vi_due_date_idx" ON "apvm_vendor_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "apvm_vi_match_status_idx" ON "apvm_vendor_invoices" USING btree ("match_status");--> statement-breakpoint
CREATE INDEX "apvm_vi_status_idx" ON "apvm_vendor_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_vm_tenant_id_idx" ON "apvm_vendor_masters" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_vm_tenant_code_idx" ON "apvm_vendor_masters" USING btree ("tenant_id","vendor_code");--> statement-breakpoint
CREATE INDEX "apvm_vm_vendor_name_idx" ON "apvm_vendor_masters" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "apvm_vm_vendor_type_idx" ON "apvm_vendor_masters" USING btree ("vendor_type");--> statement-breakpoint
CREATE INDEX "apvm_vm_country_idx" ON "apvm_vendor_masters" USING btree ("country");--> statement-breakpoint
CREATE INDEX "apvm_vm_onboarding_idx" ON "apvm_vendor_masters" USING btree ("onboarding_status");--> statement-breakpoint
CREATE INDEX "apvm_vm_status_idx" ON "apvm_vendor_masters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apvm_vr_tenant_id_idx" ON "apvm_vendor_reconciliations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apvm_vr_tenant_ref_idx" ON "apvm_vendor_reconciliations" USING btree ("tenant_id","reconciliation_ref");--> statement-breakpoint
CREATE INDEX "apvm_vr_vendor_id_idx" ON "apvm_vendor_reconciliations" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "apvm_vr_vendor_name_idx" ON "apvm_vendor_reconciliations" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "apvm_vr_recon_date_idx" ON "apvm_vendor_reconciliations" USING btree ("reconciliation_date");--> statement-breakpoint
CREATE INDEX "apvm_vr_status_idx" ON "apvm_vendor_reconciliations" USING btree ("status");