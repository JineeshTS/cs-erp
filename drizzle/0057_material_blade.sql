CREATE TABLE "vrs_hire_reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reconciliation_ref" varchar(100) NOT NULL,
	"reconciliation_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"charter_party" varchar(100),
	"owner_amount" numeric(14, 2),
	"charterer_amount" numeric(14, 2),
	"difference_amount" numeric(14, 2),
	"resolved_amount" numeric(14, 2),
	"dispute_items" integer,
	"resolved_items" integer,
	"is_reconciled" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_interco_settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"interco_ref" varchar(100) NOT NULL,
	"interco_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"voyage_number" varchar(100),
	"from_entity" varchar(255),
	"to_entity" varchar(255),
	"settlement_amount" numeric(14, 2),
	"currency" varchar(3),
	"allocation_basis" varchar(100),
	"allocation_pct" numeric(5, 2),
	"invoice_ref" varchar(100),
	"settled_date" timestamp with time zone,
	"is_settled" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_profit_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"benchmark_ref" varchar(100) NOT NULL,
	"benchmark_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"voyage_number" varchar(100),
	"vessel_name" varchar(255),
	"trade_lane" varchar(255),
	"actual_tce" numeric(14, 2),
	"benchmark_tce" numeric(14, 2),
	"variance_tce" numeric(14, 2),
	"actual_margin" numeric(5, 2),
	"benchmark_margin" numeric(5, 2),
	"performance_score" numeric(5, 2),
	"ai_insights" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_result_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_ref" varchar(100) NOT NULL,
	"workflow_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"voyage_number" varchar(100),
	"current_step" varchar(100),
	"total_steps" integer,
	"completed_steps" integer,
	"assigned_to" varchar(255),
	"due_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"variance_amount" numeric(14, 2),
	"variance_pct" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_tc_settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"settlement_ref" varchar(100) NOT NULL,
	"settlement_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"charter_party" varchar(100),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"hire_rate" numeric(14, 2),
	"total_hire_days" numeric(8, 2),
	"off_hire_days" numeric(8, 2),
	"gross_hire" numeric(14, 2),
	"deductions" numeric(14, 2),
	"net_payable" numeric(14, 2),
	"currency" varchar(3),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_voyage_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(100) NOT NULL,
	"analytics_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"total_voyages" integer,
	"avg_tce" numeric(14, 2),
	"avg_margin" numeric(5, 2),
	"total_revenue" numeric(14, 2),
	"total_costs" numeric(14, 2),
	"top_performer" varchar(255),
	"report_url" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_voyage_closes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"close_ref" varchar(100) NOT NULL,
	"close_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"voyage_number" varchar(100),
	"vessel_name" varchar(255),
	"voyage_start_date" timestamp with time zone,
	"voyage_end_date" timestamp with time zone,
	"sign_off_by" varchar(255),
	"sign_off_date" timestamp with time zone,
	"total_revenue" numeric(14, 2),
	"total_cost" numeric(14, 2),
	"net_result" numeric(14, 2),
	"is_signed_off" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vrs_voyage_pnls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pnl_ref" varchar(100) NOT NULL,
	"pnl_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"voyage_number" varchar(100),
	"vessel_name" varchar(255),
	"freight_revenue" numeric(14, 2),
	"demurrage_revenue" numeric(14, 2),
	"other_revenue" numeric(14, 2),
	"port_costs" numeric(14, 2),
	"bunker_costs" numeric(14, 2),
	"canal_costs" numeric(14, 2),
	"other_costs" numeric(14, 2),
	"total_revenue" numeric(14, 2),
	"total_costs" numeric(14, 2),
	"net_pnl" numeric(14, 2),
	"margin_pct" numeric(5, 2),
	"approved_by" varchar(255),
	"approved_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "vrs_hire_reconciliations" ADD CONSTRAINT "vrs_hire_reconciliations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_interco_settlements" ADD CONSTRAINT "vrs_interco_settlements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_profit_benchmarks" ADD CONSTRAINT "vrs_profit_benchmarks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_result_workflows" ADD CONSTRAINT "vrs_result_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_tc_settlements" ADD CONSTRAINT "vrs_tc_settlements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_voyage_analytics" ADD CONSTRAINT "vrs_voyage_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_voyage_closes" ADD CONSTRAINT "vrs_voyage_closes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrs_voyage_pnls" ADD CONSTRAINT "vrs_voyage_pnls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;