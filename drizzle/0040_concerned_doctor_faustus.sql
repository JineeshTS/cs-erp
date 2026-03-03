CREATE TABLE "fam_asset_disposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"disposal_ref" varchar(50) NOT NULL,
	"disposal_type" varchar(30) NOT NULL,
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"disposal_date" timestamp with time zone,
	"book_value_at_disposal" numeric(14, 2),
	"sale_proceeds" numeric(14, 2),
	"gain_loss" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"buyer_name" varchar(255),
	"buyer_contact" varchar(255),
	"disposal_reason" text,
	"approved_by" varchar(255),
	"approval_date" timestamp with time zone,
	"certificate_ref" varchar(100),
	"environmental_compliance" boolean DEFAULT false,
	"journal_entry_ref" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_asset_registries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"asset_ref" varchar(50) NOT NULL,
	"asset_type" varchar(30) NOT NULL,
	"asset_name" varchar(255) NOT NULL,
	"description" text,
	"serial_number" varchar(100),
	"barcode" varchar(100),
	"category" varchar(255),
	"sub_category" varchar(255),
	"location" varchar(255),
	"department" varchar(255),
	"custodian" varchar(255),
	"acquisition_date" timestamp with time zone,
	"acquisition_cost" numeric(14, 2),
	"residual_value" numeric(14, 2),
	"useful_life_months" integer,
	"current_book_value" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"depreciation_method" varchar(30),
	"warranty_expiry" timestamp with time zone,
	"condition" varchar(30),
	"tags" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_capex_opex_classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"classification_ref" varchar(50) NOT NULL,
	"classification_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"expenditure_date" timestamp with time zone,
	"amount" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"cost_center" varchar(100),
	"gl_account_code" varchar(50),
	"justification" text,
	"capitalization_threshold" numeric(14, 2),
	"useful_life_extension" integer,
	"improvement_value" numeric(14, 2),
	"classified_by" varchar(255),
	"approved_by" varchar(255),
	"approval_date" timestamp with time zone,
	"journal_entry_ref" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_depreciation_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"schedule_ref" varchar(50) NOT NULL,
	"schedule_type" varchar(30) NOT NULL,
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"original_cost" numeric(14, 2),
	"residual_value" numeric(14, 2),
	"depreciable_amount" numeric(14, 2),
	"useful_life_months" integer,
	"monthly_depreciation" numeric(14, 2),
	"annual_depreciation" numeric(14, 2),
	"accumulated_depreciation" numeric(14, 2),
	"current_book_value" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"depreciation_rate" numeric(6, 4),
	"last_calculated_date" timestamp with time zone,
	"entries" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_impairment_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"test_ref" varchar(50) NOT NULL,
	"test_type" varchar(30) NOT NULL,
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"test_date" timestamp with time zone,
	"carrying_amount" numeric(14, 2),
	"recoverable_amount" numeric(14, 2),
	"fair_value_less_costs" numeric(14, 2),
	"value_in_use" numeric(14, 2),
	"impairment_loss" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"discount_rate" numeric(6, 4),
	"cash_flow_projections" jsonb,
	"trigger_indicators" jsonb,
	"reversal_amount" numeric(14, 2),
	"tested_by" varchar(255),
	"reviewed_by" varchar(255),
	"journal_entry_ref" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_insurance_valuations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"record_type" varchar(30) NOT NULL,
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"insurer" varchar(255),
	"policy_number" varchar(100),
	"coverage_type" varchar(100),
	"coverage_amount" numeric(14, 2),
	"premium_amount" numeric(14, 2),
	"deductible" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"policy_start_date" timestamp with time zone,
	"policy_end_date" timestamp with time zone,
	"valuation_date" timestamp with time zone,
	"valuation_amount" numeric(14, 2),
	"valued_by" varchar(255),
	"valuation_method" varchar(100),
	"next_review_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_lease_accounting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lease_ref" varchar(50) NOT NULL,
	"lease_type" varchar(30) NOT NULL,
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"lessor_name" varchar(255),
	"lease_start_date" timestamp with time zone,
	"lease_end_date" timestamp with time zone,
	"lease_term_months" integer,
	"monthly_payment" numeric(14, 2),
	"annual_payment" numeric(14, 2),
	"total_lease_payments" numeric(14, 2),
	"discount_rate" numeric(6, 4),
	"rou_asset_value" numeric(14, 2),
	"lease_liability" numeric(14, 2),
	"accumulated_depreciation" numeric(14, 2),
	"interest_expense" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"renewal_option" boolean DEFAULT false,
	"purchase_option" boolean DEFAULT false,
	"termination_option" boolean DEFAULT false,
	"payment_schedule" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fam_maintenance_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"maintenance_ref" varchar(50) NOT NULL,
	"maintenance_type" varchar(30) NOT NULL,
	"asset_ref" varchar(50),
	"asset_name" varchar(255),
	"scheduled_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"frequency" varchar(30),
	"assigned_to" varchar(255),
	"vendor" varchar(255),
	"estimated_cost" numeric(14, 2),
	"actual_cost" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"work_description" text,
	"parts_used" jsonb,
	"downtime" numeric(8, 2),
	"next_scheduled_date" timestamp with time zone,
	"priority" varchar(20),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "fam_asset_disposals" ADD CONSTRAINT "fam_asset_disposals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_asset_registries" ADD CONSTRAINT "fam_asset_registries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_capex_opex_classifications" ADD CONSTRAINT "fam_capex_opex_classifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_depreciation_schedules" ADD CONSTRAINT "fam_depreciation_schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_impairment_tests" ADD CONSTRAINT "fam_impairment_tests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_insurance_valuations" ADD CONSTRAINT "fam_insurance_valuations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_lease_accounting" ADD CONSTRAINT "fam_lease_accounting_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fam_maintenance_schedules" ADD CONSTRAINT "fam_maintenance_schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fam_disposal_tenant_idx" ON "fam_asset_disposals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_disposal_ref_idx" ON "fam_asset_disposals" USING btree ("disposal_ref");--> statement-breakpoint
CREATE INDEX "fam_disposal_status_idx" ON "fam_asset_disposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_disposal_asset_idx" ON "fam_asset_disposals" USING btree ("asset_ref");--> statement-breakpoint
CREATE INDEX "fam_registry_tenant_idx" ON "fam_asset_registries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_registry_ref_idx" ON "fam_asset_registries" USING btree ("asset_ref");--> statement-breakpoint
CREATE INDEX "fam_registry_status_idx" ON "fam_asset_registries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_registry_type_idx" ON "fam_asset_registries" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "fam_registry_category_idx" ON "fam_asset_registries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "fam_capex_opex_tenant_idx" ON "fam_capex_opex_classifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_capex_opex_ref_idx" ON "fam_capex_opex_classifications" USING btree ("classification_ref");--> statement-breakpoint
CREATE INDEX "fam_capex_opex_status_idx" ON "fam_capex_opex_classifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_capex_opex_type_idx" ON "fam_capex_opex_classifications" USING btree ("classification_type");--> statement-breakpoint
CREATE INDEX "fam_depreciation_tenant_idx" ON "fam_depreciation_schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_depreciation_ref_idx" ON "fam_depreciation_schedules" USING btree ("schedule_ref");--> statement-breakpoint
CREATE INDEX "fam_depreciation_status_idx" ON "fam_depreciation_schedules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_depreciation_asset_idx" ON "fam_depreciation_schedules" USING btree ("asset_ref");--> statement-breakpoint
CREATE INDEX "fam_impairment_tenant_idx" ON "fam_impairment_tests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_impairment_ref_idx" ON "fam_impairment_tests" USING btree ("test_ref");--> statement-breakpoint
CREATE INDEX "fam_impairment_status_idx" ON "fam_impairment_tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_impairment_asset_idx" ON "fam_impairment_tests" USING btree ("asset_ref");--> statement-breakpoint
CREATE INDEX "fam_insurance_tenant_idx" ON "fam_insurance_valuations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_insurance_ref_idx" ON "fam_insurance_valuations" USING btree ("record_ref");--> statement-breakpoint
CREATE INDEX "fam_insurance_status_idx" ON "fam_insurance_valuations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_insurance_asset_idx" ON "fam_insurance_valuations" USING btree ("asset_ref");--> statement-breakpoint
CREATE INDEX "fam_lease_tenant_idx" ON "fam_lease_accounting" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_lease_ref_idx" ON "fam_lease_accounting" USING btree ("lease_ref");--> statement-breakpoint
CREATE INDEX "fam_lease_status_idx" ON "fam_lease_accounting" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_lease_asset_idx" ON "fam_lease_accounting" USING btree ("asset_ref");--> statement-breakpoint
CREATE INDEX "fam_maintenance_tenant_idx" ON "fam_maintenance_schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "fam_maintenance_ref_idx" ON "fam_maintenance_schedules" USING btree ("maintenance_ref");--> statement-breakpoint
CREATE INDEX "fam_maintenance_status_idx" ON "fam_maintenance_schedules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fam_maintenance_asset_idx" ON "fam_maintenance_schedules" USING btree ("asset_ref");