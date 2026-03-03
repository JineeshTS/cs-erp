CREATE TABLE "anm_agency_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_ref" varchar(100) NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"document_title" varchar(255),
	"document_version" varchar(20),
	"effective_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"signed_by" varchar(255),
	"signed_date" timestamp with time zone,
	"file_url" text,
	"file_size_bytes" integer,
	"confidential" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_agent_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"commission_ref" varchar(100) NOT NULL,
	"commission_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"booking_ref" varchar(100),
	"freight_amount" numeric(14, 2),
	"commission_rate" numeric(8, 4),
	"commission_amount" numeric(14, 2),
	"commission_currency" varchar(3),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"payment_date" timestamp with time zone,
	"payment_ref" varchar(100),
	"invoice_number" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_agent_incentives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"incentive_ref" varchar(100) NOT NULL,
	"incentive_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"incentive_period" varchar(20),
	"target_teu" numeric(10, 2),
	"achieved_teu" numeric(10, 2),
	"bonus_rate" numeric(14, 2),
	"bonus_amount" numeric(14, 2),
	"incentive_currency" varchar(3),
	"payout_date" timestamp with time zone,
	"approved_by" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_booking_authorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"authority_ref" varchar(100) NOT NULL,
	"authority_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"trade_route" varchar(100),
	"max_booking_value" numeric(14, 2),
	"max_discount_pct" numeric(8, 4),
	"authority_currency" varchar(3),
	"container_types" text,
	"approval_threshold" numeric(14, 2),
	"escalation_contact" varchar(255),
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_ga_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agreement_ref" varchar(100) NOT NULL,
	"agreement_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"territory" varchar(255),
	"ports_covered" text,
	"commencement_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"auto_renewal" boolean,
	"termination_notice_days" integer,
	"base_commission_pct" numeric(8, 4),
	"commission_currency" varchar(3),
	"exclusivity_clause" boolean,
	"performance_guarantee" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_performance_kpis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"kpi_ref" varchar(100) NOT NULL,
	"kpi_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"kpi_period" varchar(20),
	"target_value" numeric(14, 2),
	"actual_value" numeric(14, 2),
	"achievement_pct" numeric(8, 4),
	"kpi_currency" varchar(3),
	"ranking" integer,
	"trend_direction" varchar(20),
	"benchmark_value" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_portal_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"config_ref" varchar(100) NOT NULL,
	"config_type" varchar(50) NOT NULL,
	"agent_name" varchar(255),
	"agent_code" varchar(50),
	"portal_url" varchar(500),
	"branding_theme" varchar(50),
	"enabled_modules" text,
	"max_users" integer,
	"sso_enabled" boolean,
	"api_key_issued" boolean,
	"last_login_at" timestamp with time zone,
	"active_sessions" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "anm_sub_agent_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"config_ref" varchar(100) NOT NULL,
	"config_type" varchar(50) NOT NULL,
	"parent_agent_name" varchar(255),
	"parent_agent_code" varchar(50),
	"sub_agent_name" varchar(255),
	"sub_agent_code" varchar(50),
	"territory" varchar(255),
	"access_level" varchar(50),
	"commission_split_pct" numeric(8, 4),
	"booking_authority" boolean,
	"max_booking_value" numeric(14, 2),
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "anm_agency_documents" ADD CONSTRAINT "anm_agency_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_agent_commissions" ADD CONSTRAINT "anm_agent_commissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_agent_incentives" ADD CONSTRAINT "anm_agent_incentives_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_booking_authorities" ADD CONSTRAINT "anm_booking_authorities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_ga_agreements" ADD CONSTRAINT "anm_ga_agreements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_performance_kpis" ADD CONSTRAINT "anm_performance_kpis_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_portal_configs" ADD CONSTRAINT "anm_portal_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anm_sub_agent_configs" ADD CONSTRAINT "anm_sub_agent_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;