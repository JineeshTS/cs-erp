CREATE TABLE "wne_doa_matrix" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"role_id" uuid,
	"user_id" uuid,
	"min_amount" integer,
	"max_amount" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"requires_dual_approval" boolean DEFAULT false NOT NULL,
	"delegated_from" uuid,
	"delegated_until" timestamp with time zone,
	"conditions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"subject" varchar(500),
	"body_template" text NOT NULL,
	"body_html" text,
	"variables" jsonb,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"entity_type" varchar(50),
	"trigger_event" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"channel" varchar(20) NOT NULL,
	"title" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"action_url" varchar(500),
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"read_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"external_id" varchar(255),
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_routing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"entity_type" varchar(50) NOT NULL,
	"trigger_event" varchar(100) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"conditions" jsonb NOT NULL,
	"assignment_type" varchar(30) DEFAULT 'user' NOT NULL,
	"assignment_value" varchar(255) NOT NULL,
	"fallback_assignment" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_sla_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"trigger_event" varchar(100) NOT NULL,
	"target_hours" integer NOT NULL,
	"warning_hours" integer NOT NULL,
	"critical_hours" integer NOT NULL,
	"escalation_policy" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_sla_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sla_definition_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'on_track' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"warning_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"breached_at" timestamp with time zone,
	"assigned_to" uuid,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_workflow_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"current_step_id" uuid,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"initiated_by" uuid NOT NULL,
	"completed_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_workflow_step_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"instance_id" uuid NOT NULL,
	"step_id" uuid NOT NULL,
	"assigned_to" uuid,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"action" varchar(30),
	"comment" text,
	"acted_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_workflow_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"step_order" integer NOT NULL,
	"step_type" varchar(30) DEFAULT 'approval' NOT NULL,
	"assignee_type" varchar(30) DEFAULT 'role' NOT NULL,
	"assignee_value" varchar(255) NOT NULL,
	"required_approvals" integer DEFAULT 1 NOT NULL,
	"auto_approve_after_hours" integer,
	"conditions" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wne_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"entity_type" varchar(50) NOT NULL,
	"trigger_event" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wne_doa_matrix" ADD CONSTRAINT "wne_doa_matrix_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_notification_preferences" ADD CONSTRAINT "wne_notification_preferences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_notification_templates" ADD CONSTRAINT "wne_notification_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_notifications" ADD CONSTRAINT "wne_notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_notifications" ADD CONSTRAINT "wne_notifications_template_id_wne_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."wne_notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_routing_rules" ADD CONSTRAINT "wne_routing_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_sla_definitions" ADD CONSTRAINT "wne_sla_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_sla_instances" ADD CONSTRAINT "wne_sla_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_sla_instances" ADD CONSTRAINT "wne_sla_instances_sla_definition_id_wne_sla_definitions_id_fk" FOREIGN KEY ("sla_definition_id") REFERENCES "public"."wne_sla_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_instances" ADD CONSTRAINT "wne_workflow_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_instances" ADD CONSTRAINT "wne_workflow_instances_workflow_id_wne_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wne_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_instances" ADD CONSTRAINT "wne_workflow_instances_current_step_id_wne_workflow_steps_id_fk" FOREIGN KEY ("current_step_id") REFERENCES "public"."wne_workflow_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_step_instances" ADD CONSTRAINT "wne_workflow_step_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_step_instances" ADD CONSTRAINT "wne_workflow_step_instances_instance_id_wne_workflow_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."wne_workflow_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_step_instances" ADD CONSTRAINT "wne_workflow_step_instances_step_id_wne_workflow_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."wne_workflow_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_steps" ADD CONSTRAINT "wne_workflow_steps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_steps" ADD CONSTRAINT "wne_workflow_steps_workflow_id_wne_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wne_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflows" ADD CONSTRAINT "wne_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wne_doa_matrix_tenant_id_idx" ON "wne_doa_matrix" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_doa_matrix_entity_type_idx" ON "wne_doa_matrix" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "wne_doa_matrix_action_type_idx" ON "wne_doa_matrix" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "wne_doa_matrix_role_id_idx" ON "wne_doa_matrix" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "wne_doa_matrix_user_id_idx" ON "wne_doa_matrix" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wne_doa_matrix_is_active_idx" ON "wne_doa_matrix" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "wne_notif_prefs_tenant_id_idx" ON "wne_notification_preferences" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_notif_prefs_user_id_idx" ON "wne_notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wne_notif_prefs_user_channel_event_idx" ON "wne_notification_preferences" USING btree ("user_id","channel","event_type");--> statement-breakpoint
CREATE INDEX "wne_notif_templates_tenant_id_idx" ON "wne_notification_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wne_notif_templates_tenant_slug_channel_locale_idx" ON "wne_notification_templates" USING btree ("tenant_id","slug","channel","locale");--> statement-breakpoint
CREATE INDEX "wne_notif_templates_channel_idx" ON "wne_notification_templates" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "wne_notif_templates_entity_type_idx" ON "wne_notification_templates" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "wne_notif_templates_is_active_idx" ON "wne_notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "wne_notifications_tenant_id_idx" ON "wne_notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_notifications_user_id_idx" ON "wne_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wne_notifications_template_id_idx" ON "wne_notifications" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "wne_notifications_channel_idx" ON "wne_notifications" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "wne_notifications_entity_idx" ON "wne_notifications" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "wne_notifications_status_idx" ON "wne_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wne_notifications_read_at_idx" ON "wne_notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "wne_notifications_created_at_idx" ON "wne_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "wne_routing_rules_tenant_id_idx" ON "wne_routing_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_routing_rules_entity_type_idx" ON "wne_routing_rules" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "wne_routing_rules_trigger_idx" ON "wne_routing_rules" USING btree ("trigger_event");--> statement-breakpoint
CREATE INDEX "wne_routing_rules_priority_idx" ON "wne_routing_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "wne_routing_rules_is_active_idx" ON "wne_routing_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "wne_sla_defs_tenant_id_idx" ON "wne_sla_definitions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_sla_defs_entity_type_idx" ON "wne_sla_definitions" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "wne_sla_defs_is_active_idx" ON "wne_sla_definitions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "wne_sla_inst_tenant_id_idx" ON "wne_sla_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_sla_inst_def_id_idx" ON "wne_sla_instances" USING btree ("sla_definition_id");--> statement-breakpoint
CREATE INDEX "wne_sla_inst_entity_idx" ON "wne_sla_instances" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "wne_sla_inst_status_idx" ON "wne_sla_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wne_sla_inst_due_at_idx" ON "wne_sla_instances" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "wne_sla_inst_assigned_to_idx" ON "wne_sla_instances" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "wne_workflow_instances_tenant_id_idx" ON "wne_workflow_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_workflow_instances_workflow_id_idx" ON "wne_workflow_instances" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "wne_workflow_instances_entity_idx" ON "wne_workflow_instances" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "wne_workflow_instances_status_idx" ON "wne_workflow_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wne_workflow_instances_initiated_by_idx" ON "wne_workflow_instances" USING btree ("initiated_by");--> statement-breakpoint
CREATE INDEX "wne_wf_step_inst_tenant_id_idx" ON "wne_workflow_step_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_wf_step_inst_instance_id_idx" ON "wne_workflow_step_instances" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "wne_wf_step_inst_step_id_idx" ON "wne_workflow_step_instances" USING btree ("step_id");--> statement-breakpoint
CREATE INDEX "wne_wf_step_inst_assigned_to_idx" ON "wne_workflow_step_instances" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "wne_wf_step_inst_status_idx" ON "wne_workflow_step_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wne_workflow_steps_tenant_id_idx" ON "wne_workflow_steps" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wne_workflow_steps_workflow_id_idx" ON "wne_workflow_steps" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "wne_workflow_steps_order_idx" ON "wne_workflow_steps" USING btree ("workflow_id","step_order");--> statement-breakpoint
CREATE INDEX "wne_workflows_tenant_id_idx" ON "wne_workflows" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wne_workflows_tenant_slug_idx" ON "wne_workflows" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "wne_workflows_entity_type_idx" ON "wne_workflows" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "wne_workflows_is_active_idx" ON "wne_workflows" USING btree ("is_active");