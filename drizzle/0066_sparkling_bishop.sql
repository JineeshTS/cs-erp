CREATE TABLE "pe_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"step_instance_id" uuid NOT NULL,
	"process_instance_id" uuid NOT NULL,
	"approver_id" uuid NOT NULL,
	"decision" varchar(20),
	"comment" text,
	"decided_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_event_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"process_instance_id" uuid,
	"user_id" uuid,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_process_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"process_id" varchar(20) NOT NULL,
	"process_name" varchar(255) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"trigger_type" varchar(20) NOT NULL,
	"triggered_by" uuid,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"context_json" jsonb,
	"sla_deadline" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failure_reason" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_step_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"process_instance_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"step_name" varchar(255) NOT NULL,
	"executor_type" varchar(20) NOT NULL,
	"executor_id" varchar(255),
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"input_json" jsonb,
	"output_json" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failure_reason" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pe_approvals" ADD CONSTRAINT "pe_approvals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_approvals" ADD CONSTRAINT "pe_approvals_step_instance_id_pe_step_instances_id_fk" FOREIGN KEY ("step_instance_id") REFERENCES "public"."pe_step_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_approvals" ADD CONSTRAINT "pe_approvals_process_instance_id_pe_process_instances_id_fk" FOREIGN KEY ("process_instance_id") REFERENCES "public"."pe_process_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_event_log" ADD CONSTRAINT "pe_event_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_process_instances" ADD CONSTRAINT "pe_process_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_step_instances" ADD CONSTRAINT "pe_step_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_step_instances" ADD CONSTRAINT "pe_step_instances_process_instance_id_pe_process_instances_id_fk" FOREIGN KEY ("process_instance_id") REFERENCES "public"."pe_process_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pe_approvals_tenant_id_idx" ON "pe_approvals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_approvals_step_inst_id_idx" ON "pe_approvals" USING btree ("step_instance_id");--> statement-breakpoint
CREATE INDEX "pe_approvals_proc_inst_id_idx" ON "pe_approvals" USING btree ("process_instance_id");--> statement-breakpoint
CREATE INDEX "pe_approvals_approver_id_idx" ON "pe_approvals" USING btree ("approver_id");--> statement-breakpoint
CREATE INDEX "pe_approvals_decision_idx" ON "pe_approvals" USING btree ("decision");--> statement-breakpoint
CREATE INDEX "pe_event_log_tenant_id_idx" ON "pe_event_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_event_log_event_type_idx" ON "pe_event_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "pe_event_log_entity_idx" ON "pe_event_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "pe_event_log_proc_inst_idx" ON "pe_event_log" USING btree ("process_instance_id");--> statement-breakpoint
CREATE INDEX "pe_event_log_created_at_idx" ON "pe_event_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pe_proc_inst_tenant_id_idx" ON "pe_process_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_proc_inst_process_id_idx" ON "pe_process_instances" USING btree ("process_id");--> statement-breakpoint
CREATE INDEX "pe_proc_inst_status_idx" ON "pe_process_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pe_proc_inst_entity_idx" ON "pe_process_instances" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "pe_proc_inst_triggered_by_idx" ON "pe_process_instances" USING btree ("triggered_by");--> statement-breakpoint
CREATE INDEX "pe_proc_inst_created_at_idx" ON "pe_process_instances" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pe_step_inst_tenant_id_idx" ON "pe_step_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_step_inst_proc_inst_id_idx" ON "pe_step_instances" USING btree ("process_instance_id");--> statement-breakpoint
CREATE INDEX "pe_step_inst_status_idx" ON "pe_step_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pe_step_inst_step_number_idx" ON "pe_step_instances" USING btree ("process_instance_id","step_number");