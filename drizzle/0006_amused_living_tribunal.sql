CREATE TABLE "mels_compliance_filings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"compliance_rule_id" uuid NOT NULL,
	"legal_entity_id" uuid NOT NULL,
	"filing_period" varchar(30) NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"filed_at" timestamp with time zone,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"filing_reference" varchar(255),
	"filing_data" jsonb,
	"submitted_by" uuid,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_compliance_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"rule_code" varchar(100) NOT NULL,
	"description" text,
	"country" varchar(2) NOT NULL,
	"region" varchar(50),
	"regulatory_body" varchar(255),
	"rule_type" varchar(50) DEFAULT 'reporting' NOT NULL,
	"frequency" varchar(30),
	"conditions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_currency_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_entity_id" uuid NOT NULL,
	"currency_code" varchar(3) NOT NULL,
	"currency_name" varchar(100) NOT NULL,
	"symbol" varchar(10),
	"decimal_places" integer DEFAULT 2 NOT NULL,
	"smallest_unit" integer DEFAULT 100 NOT NULL,
	"is_base_currency" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_fx_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"source_currency" varchar(3) NOT NULL,
	"target_currency" varchar(3) NOT NULL,
	"rate" integer NOT NULL,
	"rate_multiplier" integer DEFAULT 1000000 NOT NULL,
	"rate_type" varchar(30) DEFAULT 'spot' NOT NULL,
	"provider" varchar(100),
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_intercompany_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_number" varchar(100) NOT NULL,
	"source_entity_id" uuid NOT NULL,
	"target_entity_id" uuid NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"description" text,
	"currency" varchar(3) NOT NULL,
	"amount" integer NOT NULL,
	"fx_rate" integer,
	"fx_rate_multiplier" integer DEFAULT 1000000,
	"base_amount" integer,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"reference_type" varchar(50),
	"reference_id" uuid,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_legal_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"parent_entity_id" uuid,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(50),
	"slug" varchar(100) NOT NULL,
	"entity_type" varchar(50) DEFAULT 'subsidiary' NOT NULL,
	"legal_name" varchar(500) NOT NULL,
	"registration_number" varchar(100),
	"tax_id" varchar(100),
	"vat_number" varchar(100),
	"country" varchar(2) NOT NULL,
	"region" varchar(50),
	"base_currency" varchar(3) DEFAULT 'QAR' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Qatar' NOT NULL,
	"fiscal_year_start" varchar(5) DEFAULT '01-01' NOT NULL,
	"address" jsonb,
	"contact_info" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_headquarters" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_locale_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"locale_code" varchar(10) NOT NULL,
	"locale_name" varchar(100) NOT NULL,
	"language" varchar(50) NOT NULL,
	"direction" varchar(3) DEFAULT 'ltr' NOT NULL,
	"date_format" varchar(30) DEFAULT 'DD/MM/YYYY' NOT NULL,
	"number_format" varchar(30) DEFAULT '1,234.56' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_oracle_integration_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"endpoint_url" varchar(1000) NOT NULL,
	"auth_config" jsonb,
	"mapping_config" jsonb,
	"sync_schedule" varchar(100),
	"last_sync_at" timestamp with time zone,
	"last_sync_status" varchar(30),
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_oracle_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"integration_config_id" uuid NOT NULL,
	"sync_type" varchar(30) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"records_processed" integer DEFAULT 0 NOT NULL,
	"records_failed" integer DEFAULT 0 NOT NULL,
	"error_log" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_settlement_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_number" varchar(100) NOT NULL,
	"description" text,
	"settlement_date" timestamp with time zone NOT NULL,
	"currency" varchar(3) NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"net_amount" integer DEFAULT 0 NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"settled_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_settlement_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"net_direction" varchar(10) NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_tax_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_entity_id" uuid,
	"tax_name" varchar(255) NOT NULL,
	"tax_code" varchar(50) NOT NULL,
	"tax_type" varchar(50) DEFAULT 'vat' NOT NULL,
	"country" varchar(2) NOT NULL,
	"region" varchar(50),
	"description" text,
	"is_compound" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_config_id" uuid NOT NULL,
	"rate_bps" integer NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mels_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"locale_code" varchar(10) NOT NULL,
	"namespace" varchar(100) NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mels_compliance_filings" ADD CONSTRAINT "mels_compliance_filings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_compliance_filings" ADD CONSTRAINT "mels_compliance_filings_compliance_rule_id_mels_compliance_rules_id_fk" FOREIGN KEY ("compliance_rule_id") REFERENCES "public"."mels_compliance_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_compliance_filings" ADD CONSTRAINT "mels_compliance_filings_legal_entity_id_mels_legal_entities_id_fk" FOREIGN KEY ("legal_entity_id") REFERENCES "public"."mels_legal_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_compliance_rules" ADD CONSTRAINT "mels_compliance_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_currency_configs" ADD CONSTRAINT "mels_currency_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_currency_configs" ADD CONSTRAINT "mels_currency_configs_legal_entity_id_mels_legal_entities_id_fk" FOREIGN KEY ("legal_entity_id") REFERENCES "public"."mels_legal_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_fx_rates" ADD CONSTRAINT "mels_fx_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_intercompany_transactions" ADD CONSTRAINT "mels_intercompany_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_intercompany_transactions" ADD CONSTRAINT "mels_intercompany_transactions_source_entity_id_mels_legal_entities_id_fk" FOREIGN KEY ("source_entity_id") REFERENCES "public"."mels_legal_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_intercompany_transactions" ADD CONSTRAINT "mels_intercompany_transactions_target_entity_id_mels_legal_entities_id_fk" FOREIGN KEY ("target_entity_id") REFERENCES "public"."mels_legal_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_legal_entities" ADD CONSTRAINT "mels_legal_entities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_locale_configs" ADD CONSTRAINT "mels_locale_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_oracle_integration_configs" ADD CONSTRAINT "mels_oracle_integration_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_oracle_sync_logs" ADD CONSTRAINT "mels_oracle_sync_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_oracle_sync_logs" ADD CONSTRAINT "mels_oracle_sync_logs_integration_config_id_mels_oracle_integration_configs_id_fk" FOREIGN KEY ("integration_config_id") REFERENCES "public"."mels_oracle_integration_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_settlement_batches" ADD CONSTRAINT "mels_settlement_batches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_settlement_items" ADD CONSTRAINT "mels_settlement_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_settlement_items" ADD CONSTRAINT "mels_settlement_items_batch_id_mels_settlement_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."mels_settlement_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_settlement_items" ADD CONSTRAINT "mels_settlement_items_transaction_id_mels_intercompany_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."mels_intercompany_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_tax_configs" ADD CONSTRAINT "mels_tax_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_tax_configs" ADD CONSTRAINT "mels_tax_configs_legal_entity_id_mels_legal_entities_id_fk" FOREIGN KEY ("legal_entity_id") REFERENCES "public"."mels_legal_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_tax_rates" ADD CONSTRAINT "mels_tax_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_tax_rates" ADD CONSTRAINT "mels_tax_rates_tax_config_id_mels_tax_configs_id_fk" FOREIGN KEY ("tax_config_id") REFERENCES "public"."mels_tax_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mels_translations" ADD CONSTRAINT "mels_translations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mels_compliance_filings_tenant_id_idx" ON "mels_compliance_filings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_compliance_filings_rule_id_idx" ON "mels_compliance_filings" USING btree ("compliance_rule_id");--> statement-breakpoint
CREATE INDEX "mels_compliance_filings_entity_id_idx" ON "mels_compliance_filings" USING btree ("legal_entity_id");--> statement-breakpoint
CREATE INDEX "mels_compliance_filings_status_idx" ON "mels_compliance_filings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mels_compliance_filings_due_date_idx" ON "mels_compliance_filings" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "mels_compliance_rules_tenant_id_idx" ON "mels_compliance_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_compliance_rules_tenant_code_idx" ON "mels_compliance_rules" USING btree ("tenant_id","rule_code");--> statement-breakpoint
CREATE INDEX "mels_compliance_rules_country_idx" ON "mels_compliance_rules" USING btree ("country");--> statement-breakpoint
CREATE INDEX "mels_compliance_rules_rule_type_idx" ON "mels_compliance_rules" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "mels_compliance_rules_is_active_idx" ON "mels_compliance_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_currency_configs_tenant_id_idx" ON "mels_currency_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_currency_configs_legal_entity_id_idx" ON "mels_currency_configs" USING btree ("legal_entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_currency_configs_entity_currency_idx" ON "mels_currency_configs" USING btree ("tenant_id","legal_entity_id","currency_code");--> statement-breakpoint
CREATE INDEX "mels_currency_configs_currency_code_idx" ON "mels_currency_configs" USING btree ("currency_code");--> statement-breakpoint
CREATE INDEX "mels_fx_rates_tenant_id_idx" ON "mels_fx_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_fx_rates_source_currency_idx" ON "mels_fx_rates" USING btree ("source_currency");--> statement-breakpoint
CREATE INDEX "mels_fx_rates_target_currency_idx" ON "mels_fx_rates" USING btree ("target_currency");--> statement-breakpoint
CREATE INDEX "mels_fx_rates_rate_type_idx" ON "mels_fx_rates" USING btree ("rate_type");--> statement-breakpoint
CREATE INDEX "mels_fx_rates_effective_from_idx" ON "mels_fx_rates" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "mels_fx_rates_is_active_idx" ON "mels_fx_rates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_ic_transactions_tenant_id_idx" ON "mels_intercompany_transactions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_ic_transactions_number_idx" ON "mels_intercompany_transactions" USING btree ("tenant_id","transaction_number");--> statement-breakpoint
CREATE INDEX "mels_ic_transactions_source_entity_idx" ON "mels_intercompany_transactions" USING btree ("source_entity_id");--> statement-breakpoint
CREATE INDEX "mels_ic_transactions_target_entity_idx" ON "mels_intercompany_transactions" USING btree ("target_entity_id");--> statement-breakpoint
CREATE INDEX "mels_ic_transactions_status_idx" ON "mels_intercompany_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mels_ic_transactions_type_idx" ON "mels_intercompany_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "mels_ic_transactions_created_at_idx" ON "mels_intercompany_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mels_legal_entities_tenant_id_idx" ON "mels_legal_entities" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_legal_entities_tenant_slug_idx" ON "mels_legal_entities" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "mels_legal_entities_parent_entity_id_idx" ON "mels_legal_entities" USING btree ("parent_entity_id");--> statement-breakpoint
CREATE INDEX "mels_legal_entities_country_idx" ON "mels_legal_entities" USING btree ("country");--> statement-breakpoint
CREATE INDEX "mels_legal_entities_entity_type_idx" ON "mels_legal_entities" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "mels_legal_entities_is_active_idx" ON "mels_legal_entities" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_locale_configs_tenant_id_idx" ON "mels_locale_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_locale_configs_tenant_locale_idx" ON "mels_locale_configs" USING btree ("tenant_id","locale_code");--> statement-breakpoint
CREATE INDEX "mels_locale_configs_is_active_idx" ON "mels_locale_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_oracle_configs_tenant_id_idx" ON "mels_oracle_integration_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_oracle_configs_tenant_slug_idx" ON "mels_oracle_integration_configs" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "mels_oracle_configs_is_active_idx" ON "mels_oracle_integration_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_oracle_sync_logs_tenant_id_idx" ON "mels_oracle_sync_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_oracle_sync_logs_config_id_idx" ON "mels_oracle_sync_logs" USING btree ("integration_config_id");--> statement-breakpoint
CREATE INDEX "mels_oracle_sync_logs_status_idx" ON "mels_oracle_sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mels_oracle_sync_logs_created_at_idx" ON "mels_oracle_sync_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mels_settlement_batches_tenant_id_idx" ON "mels_settlement_batches" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_settlement_batches_number_idx" ON "mels_settlement_batches" USING btree ("tenant_id","batch_number");--> statement-breakpoint
CREATE INDEX "mels_settlement_batches_status_idx" ON "mels_settlement_batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mels_settlement_batches_settlement_date_idx" ON "mels_settlement_batches" USING btree ("settlement_date");--> statement-breakpoint
CREATE INDEX "mels_settlement_items_tenant_id_idx" ON "mels_settlement_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_settlement_items_batch_id_idx" ON "mels_settlement_items" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "mels_settlement_items_transaction_id_idx" ON "mels_settlement_items" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "mels_tax_configs_tenant_id_idx" ON "mels_tax_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_tax_configs_legal_entity_id_idx" ON "mels_tax_configs" USING btree ("legal_entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_tax_configs_tenant_code_idx" ON "mels_tax_configs" USING btree ("tenant_id","tax_code");--> statement-breakpoint
CREATE INDEX "mels_tax_configs_country_idx" ON "mels_tax_configs" USING btree ("country");--> statement-breakpoint
CREATE INDEX "mels_tax_configs_tax_type_idx" ON "mels_tax_configs" USING btree ("tax_type");--> statement-breakpoint
CREATE INDEX "mels_tax_configs_is_active_idx" ON "mels_tax_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_tax_rates_tenant_id_idx" ON "mels_tax_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mels_tax_rates_tax_config_id_idx" ON "mels_tax_rates" USING btree ("tax_config_id");--> statement-breakpoint
CREATE INDEX "mels_tax_rates_effective_from_idx" ON "mels_tax_rates" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "mels_tax_rates_is_active_idx" ON "mels_tax_rates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mels_translations_tenant_id_idx" ON "mels_translations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mels_translations_tenant_locale_key_idx" ON "mels_translations" USING btree ("tenant_id","locale_code","namespace","key");--> statement-breakpoint
CREATE INDEX "mels_translations_locale_code_idx" ON "mels_translations" USING btree ("locale_code");--> statement-breakpoint
CREATE INDEX "mels_translations_namespace_idx" ON "mels_translations" USING btree ("namespace");