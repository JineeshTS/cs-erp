CREATE TABLE "scm_account_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"plan_name" varchar(255) NOT NULL,
	"fiscal_year" integer NOT NULL,
	"account_manager_id" uuid NOT NULL,
	"revenue_target_amount" integer,
	"teu_target" integer,
	"retention_strategy" text,
	"growth_strategy" text,
	"risk_assessment" text,
	"competitive_analysis" text,
	"key_objectives" jsonb,
	"swot_analysis" jsonb,
	"review_date" date,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"campaign_name" varchar(255) NOT NULL,
	"campaign_code" varchar(50) NOT NULL,
	"campaign_type" varchar(30) NOT NULL,
	"description" text,
	"target_audience" varchar(100),
	"channel" varchar(30),
	"budget_amount" integer,
	"spent_amount" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'USD',
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"leads_generated" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"roi" integer,
	"region" varchar(100),
	"trade_lane" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_contract_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"charge_code" varchar(30) NOT NULL,
	"charge_name" varchar(255) NOT NULL,
	"charge_type" varchar(30) NOT NULL,
	"basis" varchar(20) NOT NULL,
	"unit_price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"container_type" varchar(20),
	"container_size" varchar(10),
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_number" varchar(50) NOT NULL,
	"contract_name" varchar(255) NOT NULL,
	"customer_id" uuid NOT NULL,
	"quotation_id" uuid,
	"contract_type" varchar(30) DEFAULT 'standard' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"auto_renew" boolean DEFAULT false,
	"renewal_term_days" integer,
	"minimum_commitment_teu" integer,
	"maximum_commitment_teu" integer,
	"penalty_rate" integer,
	"total_value" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"payment_terms_days" integer DEFAULT 30,
	"trade_lane" varchar(100),
	"sales_rep_id" uuid,
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
CREATE TABLE "scm_customer_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"job_title" varchar(100),
	"department" varchar(100),
	"email" varchar(255),
	"phone" varchar(30),
	"mobile" varchar(30),
	"is_primary" boolean DEFAULT false,
	"is_decision_maker" boolean DEFAULT false,
	"preferred_language" varchar(5) DEFAULT 'en',
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_customer_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"segment_name" varchar(100) NOT NULL,
	"segment_code" varchar(30) NOT NULL,
	"description" text,
	"criteria" jsonb,
	"color" varchar(7),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_code" varchar(50) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"trade_name" varchar(255),
	"customer_type" varchar(30) DEFAULT 'shipper' NOT NULL,
	"segment_id" uuid,
	"tier" varchar(20) DEFAULT 'standard',
	"industry" varchar(100),
	"country" varchar(3) NOT NULL,
	"city" varchar(100),
	"address" text,
	"postal_code" varchar(20),
	"phone" varchar(30),
	"email" varchar(255),
	"website" varchar(255),
	"tax_registration_no" varchar(50),
	"credit_limit_amount" integer,
	"credit_currency" varchar(3) DEFAULT 'USD',
	"payment_terms_days" integer DEFAULT 30,
	"annual_revenue" integer,
	"employee_count" integer,
	"account_manager_id" uuid,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_incentive_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"rule_code" varchar(50) NOT NULL,
	"target_type" varchar(30) NOT NULL,
	"threshold_percent" integer NOT NULL,
	"commission_rate" integer NOT NULL,
	"bonus_amount" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"capped_at" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"applies_to" varchar(30) DEFAULT 'all',
	"region" varchar(100),
	"trade_lane" varchar(100),
	"is_active" boolean DEFAULT true,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255),
	"contact_phone" varchar(30),
	"job_title" varchar(100),
	"country" varchar(3),
	"city" varchar(100),
	"industry" varchar(100),
	"estimated_teu" integer,
	"estimated_revenue" integer,
	"trade_lane" varchar(100),
	"source" varchar(50) NOT NULL,
	"campaign_id" uuid,
	"assigned_to" uuid,
	"qualification_score" integer,
	"converted_to_customer_id" uuid,
	"converted_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_onboarding_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"task_category" varchar(50) NOT NULL,
	"description" text,
	"assigned_to" uuid,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"sort_order" integer DEFAULT 0,
	"is_required" boolean DEFAULT true,
	"document_required" boolean DEFAULT false,
	"document_url" varchar(500),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"opportunity_name" varchar(255) NOT NULL,
	"opportunity_code" varchar(50),
	"customer_id" uuid NOT NULL,
	"contact_id" uuid,
	"stage_id" uuid,
	"owner_id" uuid NOT NULL,
	"expected_revenue" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"probability" integer DEFAULT 0,
	"expected_teu" integer,
	"trade_lane" varchar(100),
	"origin_port" varchar(10),
	"destination_port" varchar(10),
	"service_type" varchar(30),
	"expected_close_date" date,
	"actual_close_date" date,
	"lost_reason" varchar(100),
	"competitor_name" varchar(255),
	"source" varchar(50),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_opportunity_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"activity_type" varchar(30) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text,
	"activity_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"assigned_to" uuid,
	"outcome" varchar(50),
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"stage_name" varchar(100) NOT NULL,
	"stage_code" varchar(30) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"probability" integer DEFAULT 0,
	"color" varchar(7),
	"is_won" boolean DEFAULT false,
	"is_lost" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_quotation_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"quotation_id" uuid NOT NULL,
	"charge_code" varchar(30) NOT NULL,
	"charge_name" varchar(255) NOT NULL,
	"charge_type" varchar(30) NOT NULL,
	"basis" varchar(20) NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"container_type" varchar(20),
	"container_size" varchar(10),
	"is_mandatory" boolean DEFAULT true,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_rate_quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"quotation_number" varchar(50) NOT NULL,
	"customer_id" uuid NOT NULL,
	"contact_id" uuid,
	"opportunity_id" uuid,
	"sales_rep_id" uuid NOT NULL,
	"origin_port" varchar(10) NOT NULL,
	"destination_port" varchar(10) NOT NULL,
	"trade_lane" varchar(100),
	"service_type" varchar(30),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"estimated_teu" integer,
	"estimated_volume" integer,
	"total_amount" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone NOT NULL,
	"transit_time_days" integer,
	"free_time_days" integer,
	"incoterm" varchar(10),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_sales_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sales_rep_id" uuid NOT NULL,
	"target_name" varchar(255) NOT NULL,
	"target_type" varchar(30) NOT NULL,
	"fiscal_year" integer NOT NULL,
	"fiscal_quarter" integer,
	"fiscal_month" integer,
	"revenue_target" integer,
	"teu_target" integer,
	"new_customer_target" integer,
	"revenue_actual" integer DEFAULT 0,
	"teu_actual" integer DEFAULT 0,
	"new_customer_actual" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'USD',
	"trade_lane" varchar(100),
	"region" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scm_account_plans" ADD CONSTRAINT "scm_account_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_account_plans" ADD CONSTRAINT "scm_account_plans_customer_id_scm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."scm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_campaigns" ADD CONSTRAINT "scm_campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_contract_line_items" ADD CONSTRAINT "scm_contract_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_contract_line_items" ADD CONSTRAINT "scm_contract_line_items_contract_id_scm_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."scm_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_contracts" ADD CONSTRAINT "scm_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_contracts" ADD CONSTRAINT "scm_contracts_customer_id_scm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."scm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_customer_contacts" ADD CONSTRAINT "scm_customer_contacts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_customer_contacts" ADD CONSTRAINT "scm_customer_contacts_customer_id_scm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."scm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_customer_segments" ADD CONSTRAINT "scm_customer_segments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_customers" ADD CONSTRAINT "scm_customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_incentive_rules" ADD CONSTRAINT "scm_incentive_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_leads" ADD CONSTRAINT "scm_leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_onboarding_checklists" ADD CONSTRAINT "scm_onboarding_checklists_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_onboarding_checklists" ADD CONSTRAINT "scm_onboarding_checklists_customer_id_scm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."scm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_opportunities" ADD CONSTRAINT "scm_opportunities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_opportunities" ADD CONSTRAINT "scm_opportunities_customer_id_scm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."scm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_opportunities" ADD CONSTRAINT "scm_opportunities_stage_id_scm_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."scm_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_opportunity_activities" ADD CONSTRAINT "scm_opportunity_activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_opportunity_activities" ADD CONSTRAINT "scm_opportunity_activities_opportunity_id_scm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."scm_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_pipeline_stages" ADD CONSTRAINT "scm_pipeline_stages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_quotation_line_items" ADD CONSTRAINT "scm_quotation_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_quotation_line_items" ADD CONSTRAINT "scm_quotation_line_items_quotation_id_scm_rate_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."scm_rate_quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_rate_quotations" ADD CONSTRAINT "scm_rate_quotations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_rate_quotations" ADD CONSTRAINT "scm_rate_quotations_customer_id_scm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."scm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_sales_targets" ADD CONSTRAINT "scm_sales_targets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scm_account_plans_tenant_id_idx" ON "scm_account_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_account_plans_customer_id_idx" ON "scm_account_plans" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scm_account_plans_fiscal_year_idx" ON "scm_account_plans" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "scm_account_plans_account_manager_idx" ON "scm_account_plans" USING btree ("account_manager_id");--> statement-breakpoint
CREATE INDEX "scm_account_plans_status_idx" ON "scm_account_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_campaigns_tenant_id_idx" ON "scm_campaigns" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_campaigns_tenant_code_idx" ON "scm_campaigns" USING btree ("tenant_id","campaign_code");--> statement-breakpoint
CREATE INDEX "scm_campaigns_campaign_type_idx" ON "scm_campaigns" USING btree ("campaign_type");--> statement-breakpoint
CREATE INDEX "scm_campaigns_status_idx" ON "scm_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_campaigns_start_date_idx" ON "scm_campaigns" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "scm_contract_line_items_tenant_id_idx" ON "scm_contract_line_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_contract_line_items_contract_id_idx" ON "scm_contract_line_items" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "scm_contract_line_items_charge_code_idx" ON "scm_contract_line_items" USING btree ("charge_code");--> statement-breakpoint
CREATE INDEX "scm_contracts_tenant_id_idx" ON "scm_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_contracts_tenant_number_idx" ON "scm_contracts" USING btree ("tenant_id","contract_number");--> statement-breakpoint
CREATE INDEX "scm_contracts_customer_id_idx" ON "scm_contracts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scm_contracts_quotation_id_idx" ON "scm_contracts" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "scm_contracts_status_idx" ON "scm_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_contracts_start_date_idx" ON "scm_contracts" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "scm_contracts_end_date_idx" ON "scm_contracts" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "scm_contracts_sales_rep_id_idx" ON "scm_contracts" USING btree ("sales_rep_id");--> statement-breakpoint
CREATE INDEX "scm_customer_contacts_tenant_id_idx" ON "scm_customer_contacts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_customer_contacts_customer_id_idx" ON "scm_customer_contacts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scm_customer_contacts_email_idx" ON "scm_customer_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "scm_customer_segments_tenant_id_idx" ON "scm_customer_segments" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_customer_segments_tenant_code_idx" ON "scm_customer_segments" USING btree ("tenant_id","segment_code");--> statement-breakpoint
CREATE INDEX "scm_customers_tenant_id_idx" ON "scm_customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_customers_tenant_code_idx" ON "scm_customers" USING btree ("tenant_id","customer_code");--> statement-breakpoint
CREATE INDEX "scm_customers_company_name_idx" ON "scm_customers" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "scm_customers_customer_type_idx" ON "scm_customers" USING btree ("customer_type");--> statement-breakpoint
CREATE INDEX "scm_customers_segment_id_idx" ON "scm_customers" USING btree ("segment_id");--> statement-breakpoint
CREATE INDEX "scm_customers_tier_idx" ON "scm_customers" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "scm_customers_country_idx" ON "scm_customers" USING btree ("country");--> statement-breakpoint
CREATE INDEX "scm_customers_status_idx" ON "scm_customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_customers_account_manager_idx" ON "scm_customers" USING btree ("account_manager_id");--> statement-breakpoint
CREATE INDEX "scm_incentive_rules_tenant_id_idx" ON "scm_incentive_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_incentive_rules_tenant_code_idx" ON "scm_incentive_rules" USING btree ("tenant_id","rule_code");--> statement-breakpoint
CREATE INDEX "scm_incentive_rules_target_type_idx" ON "scm_incentive_rules" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "scm_incentive_rules_effective_from_idx" ON "scm_incentive_rules" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "scm_leads_tenant_id_idx" ON "scm_leads" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_leads_company_name_idx" ON "scm_leads" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "scm_leads_source_idx" ON "scm_leads" USING btree ("source");--> statement-breakpoint
CREATE INDEX "scm_leads_campaign_id_idx" ON "scm_leads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "scm_leads_assigned_to_idx" ON "scm_leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "scm_leads_status_idx" ON "scm_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_leads_converted_customer_idx" ON "scm_leads" USING btree ("converted_to_customer_id");--> statement-breakpoint
CREATE INDEX "scm_onboarding_checklists_tenant_id_idx" ON "scm_onboarding_checklists" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_onboarding_checklists_customer_id_idx" ON "scm_onboarding_checklists" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scm_onboarding_checklists_assigned_to_idx" ON "scm_onboarding_checklists" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "scm_onboarding_checklists_status_idx" ON "scm_onboarding_checklists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_onboarding_checklists_task_category_idx" ON "scm_onboarding_checklists" USING btree ("task_category");--> statement-breakpoint
CREATE INDEX "scm_opportunities_tenant_id_idx" ON "scm_opportunities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_opportunities_customer_id_idx" ON "scm_opportunities" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scm_opportunities_contact_id_idx" ON "scm_opportunities" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "scm_opportunities_stage_id_idx" ON "scm_opportunities" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "scm_opportunities_owner_id_idx" ON "scm_opportunities" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "scm_opportunities_status_idx" ON "scm_opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_opportunities_expected_close_idx" ON "scm_opportunities" USING btree ("expected_close_date");--> statement-breakpoint
CREATE INDEX "scm_opportunities_trade_lane_idx" ON "scm_opportunities" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "scm_opp_activities_tenant_id_idx" ON "scm_opportunity_activities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_opp_activities_opportunity_id_idx" ON "scm_opportunity_activities" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "scm_opp_activities_assigned_to_idx" ON "scm_opportunity_activities" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "scm_opp_activities_status_idx" ON "scm_opportunity_activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_opp_activities_activity_date_idx" ON "scm_opportunity_activities" USING btree ("activity_date");--> statement-breakpoint
CREATE INDEX "scm_pipeline_stages_tenant_id_idx" ON "scm_pipeline_stages" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_pipeline_stages_tenant_code_idx" ON "scm_pipeline_stages" USING btree ("tenant_id","stage_code");--> statement-breakpoint
CREATE INDEX "scm_pipeline_stages_sort_order_idx" ON "scm_pipeline_stages" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "scm_quotation_line_items_tenant_id_idx" ON "scm_quotation_line_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_quotation_line_items_quotation_id_idx" ON "scm_quotation_line_items" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "scm_quotation_line_items_charge_code_idx" ON "scm_quotation_line_items" USING btree ("charge_code");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_tenant_id_idx" ON "scm_rate_quotations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scm_rate_quotations_tenant_number_idx" ON "scm_rate_quotations" USING btree ("tenant_id","quotation_number");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_customer_id_idx" ON "scm_rate_quotations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_opportunity_id_idx" ON "scm_rate_quotations" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_sales_rep_id_idx" ON "scm_rate_quotations" USING btree ("sales_rep_id");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_status_idx" ON "scm_rate_quotations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_valid_from_idx" ON "scm_rate_quotations" USING btree ("valid_from");--> statement-breakpoint
CREATE INDEX "scm_rate_quotations_trade_lane_idx" ON "scm_rate_quotations" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "scm_sales_targets_tenant_id_idx" ON "scm_sales_targets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "scm_sales_targets_sales_rep_id_idx" ON "scm_sales_targets" USING btree ("sales_rep_id");--> statement-breakpoint
CREATE INDEX "scm_sales_targets_fiscal_year_idx" ON "scm_sales_targets" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "scm_sales_targets_target_type_idx" ON "scm_sales_targets" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "scm_sales_targets_status_idx" ON "scm_sales_targets" USING btree ("status");