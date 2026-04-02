CREATE TABLE "kmt_competency_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_ref" varchar(100) NOT NULL,
	"assessment_type" varchar(50) NOT NULL,
	"employee_name" varchar(255),
	"employee_id" varchar(50),
	"department" varchar(100),
	"competency_area" varchar(100),
	"current_level" integer,
	"target_level" integer,
	"score_pct" numeric(5, 2),
	"assessed_date" timestamp with time zone,
	"next_assessment_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_knowledge_assistants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assistant_ref" varchar(100) NOT NULL,
	"assistant_type" varchar(50) NOT NULL,
	"query" text,
	"response" text,
	"source_docs" text,
	"confidence_score" numeric(5, 2),
	"feedback_rating" integer,
	"model_version" varchar(50),
	"response_time_ms" integer,
	"helpful" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_lessons_learned" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lesson_ref" varchar(100) NOT NULL,
	"lesson_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"department" varchar(100),
	"incident_date" timestamp with time zone,
	"root_cause" text,
	"lesson_description" text,
	"recommendation" text,
	"impact_level" varchar(20),
	"implemented" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_onboarding_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_ref" varchar(100) NOT NULL,
	"workflow_type" varchar(50) NOT NULL,
	"employee_name" varchar(255),
	"employee_id" varchar(50),
	"department" varchar(100),
	"position" varchar(100),
	"start_date" timestamp with time zone,
	"target_completion_date" timestamp with time zone,
	"completed_steps" integer,
	"total_steps" integer,
	"progress_pct" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_regulatory_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"alert_ref" varchar(100) NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"regulatory_body" varchar(100),
	"jurisdiction" varchar(100),
	"effective_date" timestamp with time zone,
	"impact_level" varchar(20),
	"affected_departments" text,
	"compliance_deadline" timestamp with time zone,
	"acknowledged" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_sop_libraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sop_ref" varchar(100) NOT NULL,
	"sop_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"department" varchar(100),
	"category" varchar(100),
	"version_number" varchar(20),
	"effective_date" timestamp with time zone,
	"review_date" timestamp with time zone,
	"approved_by" varchar(255),
	"document_url" text,
	"is_active" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_training_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"module_ref" varchar(100) NOT NULL,
	"module_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"description" text,
	"department" varchar(100),
	"duration_hours" numeric(8, 2),
	"max_participants" integer,
	"passing_score_pct" numeric(5, 2),
	"is_mandatory" boolean,
	"validity_months" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kmt_video_libraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"video_ref" varchar(100) NOT NULL,
	"video_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"description" text,
	"department" varchar(100),
	"duration_minutes" integer,
	"video_url" text,
	"thumbnail_url" text,
	"language" varchar(20),
	"view_count" integer,
	"is_mandatory" boolean,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "kmt_competency_assessments" ADD CONSTRAINT "kmt_competency_assessments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_knowledge_assistants" ADD CONSTRAINT "kmt_knowledge_assistants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_lessons_learned" ADD CONSTRAINT "kmt_lessons_learned_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_onboarding_workflows" ADD CONSTRAINT "kmt_onboarding_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_regulatory_alerts" ADD CONSTRAINT "kmt_regulatory_alerts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_sop_libraries" ADD CONSTRAINT "kmt_sop_libraries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_training_modules" ADD CONSTRAINT "kmt_training_modules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kmt_video_libraries" ADD CONSTRAINT "kmt_video_libraries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;