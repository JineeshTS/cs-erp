CREATE TABLE "aaf_agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"orchestration_task_id" uuid,
	"run_number" varchar(50) NOT NULL,
	"trigger_type" varchar(30) DEFAULT 'manual' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"priority" varchar(10) DEFAULT 'normal' NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"error_message" text,
	"error_code" varchar(50),
	"tokens_used" integer,
	"cost_estimate" integer,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"retry_count" integer DEFAULT 0,
	"parent_run_id" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aaf_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_code" varchar(50) NOT NULL,
	"agent_name" varchar(255) NOT NULL,
	"agent_type" varchar(30) NOT NULL,
	"description" text,
	"capabilities" jsonb,
	"model_provider" varchar(50),
	"model_id" varchar(100),
	"endpoint" varchar(500),
	"config" jsonb,
	"max_concurrency" integer DEFAULT 1,
	"timeout_ms" integer DEFAULT 30000,
	"retry_policy" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" varchar(20) DEFAULT 'idle' NOT NULL,
	"last_active_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aaf_document_processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"job_reference" varchar(50) NOT NULL,
	"document_ref" varchar(255),
	"document_type" varchar(50) NOT NULL,
	"job_type" varchar(30) NOT NULL,
	"agent_id" uuid,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"priority" varchar(10) DEFAULT 'normal' NOT NULL,
	"input_data" jsonb,
	"extracted_data" jsonb,
	"validation_result" jsonb,
	"confidence_score" integer,
	"ocr_engine" varchar(50),
	"processing_time_ms" integer,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aaf_escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"escalation_ref" varchar(50) NOT NULL,
	"source_type" varchar(30) NOT NULL,
	"source_id" uuid,
	"agent_id" uuid,
	"run_id" uuid,
	"reason" text NOT NULL,
	"reason_code" varchar(50),
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"priority" varchar(10) DEFAULT 'normal' NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"context_data" jsonb,
	"suggested_actions" jsonb,
	"assigned_to" uuid,
	"assigned_at" timestamp with time zone,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"resolution" text,
	"resolution_action" varchar(30),
	"feedback_to_agent" jsonb,
	"sla_deadline" timestamp with time zone,
	"escalated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aaf_orchestration_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"task_code" varchar(50) NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"description" text,
	"strategy" varchar(30) DEFAULT 'sequential' NOT NULL,
	"agent_ids" jsonb,
	"agent_config" jsonb,
	"input" jsonb,
	"output" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"priority" varchar(10) DEFAULT 'normal' NOT NULL,
	"current_step" integer DEFAULT 0,
	"total_steps" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"triggered_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aaf_workflow_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_code" varchar(50) NOT NULL,
	"workflow_name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50),
	"version" integer DEFAULT 1 NOT NULL,
	"steps" jsonb,
	"trigger_config" jsonb,
	"agent_assignments" jsonb,
	"input_schema" jsonb,
	"output_schema" jsonb,
	"timeout_ms" integer DEFAULT 300000,
	"retry_policy" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aaf_workflow_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"instance_ref" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"current_step" integer DEFAULT 0,
	"total_steps" integer DEFAULT 0,
	"input" jsonb,
	"state" jsonb,
	"output" jsonb,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"triggered_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aaf_agent_runs" ADD CONSTRAINT "aaf_agent_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_agent_runs" ADD CONSTRAINT "aaf_agent_runs_agent_id_aaf_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."aaf_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_agents" ADD CONSTRAINT "aaf_agents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_document_processing_jobs" ADD CONSTRAINT "aaf_document_processing_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_document_processing_jobs" ADD CONSTRAINT "aaf_document_processing_jobs_agent_id_aaf_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."aaf_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_escalations" ADD CONSTRAINT "aaf_escalations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_escalations" ADD CONSTRAINT "aaf_escalations_agent_id_aaf_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."aaf_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_escalations" ADD CONSTRAINT "aaf_escalations_run_id_aaf_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."aaf_agent_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_orchestration_tasks" ADD CONSTRAINT "aaf_orchestration_tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_workflow_definitions" ADD CONSTRAINT "aaf_workflow_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_workflow_instances" ADD CONSTRAINT "aaf_workflow_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_workflow_instances" ADD CONSTRAINT "aaf_workflow_instances_definition_id_aaf_workflow_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."aaf_workflow_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aaf_runs_tenant_id_idx" ON "aaf_agent_runs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "aaf_runs_agent_id_idx" ON "aaf_agent_runs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "aaf_runs_orchestration_task_id_idx" ON "aaf_agent_runs" USING btree ("orchestration_task_id");--> statement-breakpoint
CREATE INDEX "aaf_runs_status_idx" ON "aaf_agent_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aaf_runs_trigger_type_idx" ON "aaf_agent_runs" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "aaf_runs_started_at_idx" ON "aaf_agent_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "aaf_runs_parent_run_id_idx" ON "aaf_agent_runs" USING btree ("parent_run_id");--> statement-breakpoint
CREATE INDEX "aaf_agents_tenant_id_idx" ON "aaf_agents" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aaf_agents_tenant_code_idx" ON "aaf_agents" USING btree ("tenant_id","agent_code");--> statement-breakpoint
CREATE INDEX "aaf_agents_agent_type_idx" ON "aaf_agents" USING btree ("agent_type");--> statement-breakpoint
CREATE INDEX "aaf_agents_status_idx" ON "aaf_agents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aaf_agents_is_active_idx" ON "aaf_agents" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "aaf_doc_jobs_tenant_id_idx" ON "aaf_document_processing_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aaf_doc_jobs_tenant_ref_idx" ON "aaf_document_processing_jobs" USING btree ("tenant_id","job_reference");--> statement-breakpoint
CREATE INDEX "aaf_doc_jobs_document_type_idx" ON "aaf_document_processing_jobs" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "aaf_doc_jobs_job_type_idx" ON "aaf_document_processing_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "aaf_doc_jobs_agent_id_idx" ON "aaf_document_processing_jobs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "aaf_doc_jobs_status_idx" ON "aaf_document_processing_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aaf_doc_jobs_started_at_idx" ON "aaf_document_processing_jobs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "aaf_escalations_tenant_id_idx" ON "aaf_escalations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aaf_escalations_tenant_ref_idx" ON "aaf_escalations" USING btree ("tenant_id","escalation_ref");--> statement-breakpoint
CREATE INDEX "aaf_escalations_source_type_idx" ON "aaf_escalations" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "aaf_escalations_agent_id_idx" ON "aaf_escalations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "aaf_escalations_run_id_idx" ON "aaf_escalations" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "aaf_escalations_severity_idx" ON "aaf_escalations" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "aaf_escalations_status_idx" ON "aaf_escalations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aaf_escalations_assigned_to_idx" ON "aaf_escalations" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "aaf_escalations_sla_deadline_idx" ON "aaf_escalations" USING btree ("sla_deadline");--> statement-breakpoint
CREATE INDEX "aaf_orch_tasks_tenant_id_idx" ON "aaf_orchestration_tasks" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aaf_orch_tasks_tenant_code_idx" ON "aaf_orchestration_tasks" USING btree ("tenant_id","task_code");--> statement-breakpoint
CREATE INDEX "aaf_orch_tasks_strategy_idx" ON "aaf_orchestration_tasks" USING btree ("strategy");--> statement-breakpoint
CREATE INDEX "aaf_orch_tasks_status_idx" ON "aaf_orchestration_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aaf_orch_tasks_triggered_by_idx" ON "aaf_orchestration_tasks" USING btree ("triggered_by");--> statement-breakpoint
CREATE INDEX "aaf_wf_defs_tenant_id_idx" ON "aaf_workflow_definitions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aaf_wf_defs_tenant_code_version_idx" ON "aaf_workflow_definitions" USING btree ("tenant_id","workflow_code","version");--> statement-breakpoint
CREATE INDEX "aaf_wf_defs_category_idx" ON "aaf_workflow_definitions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "aaf_wf_defs_is_active_idx" ON "aaf_workflow_definitions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "aaf_wf_instances_tenant_id_idx" ON "aaf_workflow_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "aaf_wf_instances_definition_id_idx" ON "aaf_workflow_instances" USING btree ("definition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aaf_wf_instances_tenant_ref_idx" ON "aaf_workflow_instances" USING btree ("tenant_id","instance_ref");--> statement-breakpoint
CREATE INDEX "aaf_wf_instances_status_idx" ON "aaf_workflow_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aaf_wf_instances_triggered_by_idx" ON "aaf_workflow_instances" USING btree ("triggered_by");--> statement-breakpoint
CREATE INDEX "aaf_wf_instances_started_at_idx" ON "aaf_workflow_instances" USING btree ("started_at");