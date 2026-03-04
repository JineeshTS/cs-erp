CREATE TABLE "icm_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"change_ref" varchar(100) NOT NULL,
	"change_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"requested_by" varchar(255),
	"department" varchar(100),
	"priority" varchar(20),
	"impact_level" varchar(20),
	"description" text,
	"justification" text,
	"estimated_effort_days" numeric(8, 2),
	"approved_by" varchar(255),
	"approved_date" timestamp with time zone,
	"target_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_data_migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"migration_ref" varchar(100) NOT NULL,
	"migration_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"source_system" varchar(100),
	"target_system" varchar(100),
	"data_volume" varchar(50),
	"record_count" integer,
	"migrated_count" integer,
	"error_count" integer,
	"scheduled_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"validation_passed" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_go_live_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"checklist_ref" varchar(100) NOT NULL,
	"checklist_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"category" varchar(100),
	"total_items" integer,
	"completed_items" integer,
	"blocked_items" integer,
	"go_live_date" timestamp with time zone,
	"approved_by" varchar(255),
	"approved_date" timestamp with time zone,
	"is_ready" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_hypercare_supports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"support_ref" varchar(100) NOT NULL,
	"support_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"reported_by" varchar(255),
	"department" varchar(100),
	"severity" varchar(20),
	"module" varchar(100),
	"description" text,
	"resolution" text,
	"assigned_to" varchar(255),
	"reported_date" timestamp with time zone,
	"resolved_date" timestamp with time zone,
	"sla_breached" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_project_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(100) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"project_manager" varchar(255),
	"department" varchar(100),
	"start_date" timestamp with time zone,
	"target_end_date" timestamp with time zone,
	"actual_end_date" timestamp with time zone,
	"total_milestones" integer,
	"completed_milestones" integer,
	"progress_pct" numeric(5, 2),
	"budget" numeric(14, 2),
	"priority" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_system_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"config_ref" varchar(100) NOT NULL,
	"config_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"module" varchar(100),
	"config_key" varchar(255),
	"config_value" text,
	"previous_value" text,
	"changed_by" varchar(255),
	"changed_date" timestamp with time zone,
	"is_active" boolean,
	"version_number" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_training_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"completion_ref" varchar(100) NOT NULL,
	"completion_type" varchar(50) NOT NULL,
	"employee_name" varchar(255),
	"employee_id" varchar(50),
	"department" varchar(100),
	"training_module" varchar(255),
	"completion_date" timestamp with time zone,
	"score_pct" numeric(5, 2),
	"passed" boolean,
	"certificate_url" text,
	"valid_until" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_uat_managements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"uat_ref" varchar(100) NOT NULL,
	"uat_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"module" varchar(100),
	"test_case_count" integer,
	"passed_count" integer,
	"failed_count" integer,
	"blocked_count" integer,
	"tester_name" varchar(255),
	"test_start_date" timestamp with time zone,
	"test_end_date" timestamp with time zone,
	"signoff_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "icm_change_requests" ADD CONSTRAINT "icm_change_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_data_migrations" ADD CONSTRAINT "icm_data_migrations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_go_live_checklists" ADD CONSTRAINT "icm_go_live_checklists_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_hypercare_supports" ADD CONSTRAINT "icm_hypercare_supports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_project_plans" ADD CONSTRAINT "icm_project_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_system_configs" ADD CONSTRAINT "icm_system_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_training_completions" ADD CONSTRAINT "icm_training_completions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_uat_managements" ADD CONSTRAINT "icm_uat_managements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;