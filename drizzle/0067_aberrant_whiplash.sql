CREATE TABLE "pe_e2e_flow_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"e2e_flow_id" varchar(20) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"trigger_event" varchar(100) NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"current_step_number" integer DEFAULT 1 NOT NULL,
	"total_steps" integer NOT NULL,
	"parent_flow_instance_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_e2e_step_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"flow_instance_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"process_ref" varchar(20),
	"step_name" varchar(255) NOT NULL,
	"executor_type" varchar(20) NOT NULL,
	"agent_id" varchar(100),
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"input_data" jsonb DEFAULT '{}'::jsonb,
	"output_data" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"blocked_by_step_id" uuid,
	"parallel_group" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_event_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"e2e_flow_id" varchar(20) NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"entity_type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_flow_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"flow_instance_id" uuid NOT NULL,
	"step_instance_id" uuid,
	"event_type" varchar(50) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"cascaded_flow_ids" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_human_gates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"step_instance_id" uuid NOT NULL,
	"flow_instance_id" uuid NOT NULL,
	"gate_type" varchar(20) NOT NULL,
	"assigned_to_role" varchar(100) NOT NULL,
	"assigned_to_user_id" uuid,
	"ai_recommendation" jsonb DEFAULT '{}'::jsonb,
	"presented_info" jsonb DEFAULT '{}'::jsonb,
	"sla_deadline" timestamp with time zone NOT NULL,
	"escalation_to_role" varchar(100),
	"escalation_to_user_id" uuid,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"decision" varchar(50),
	"decision_data" jsonb,
	"decided_at" timestamp with time zone,
	"decided_by" uuid,
	"auto_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pe_e2e_flow_instances" ADD CONSTRAINT "pe_e2e_flow_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD CONSTRAINT "pe_e2e_step_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD CONSTRAINT "pe_e2e_step_instances_flow_instance_id_pe_e2e_flow_instances_id_fk" FOREIGN KEY ("flow_instance_id") REFERENCES "public"."pe_e2e_flow_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_event_triggers" ADD CONSTRAINT "pe_event_triggers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_flow_events" ADD CONSTRAINT "pe_flow_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_flow_events" ADD CONSTRAINT "pe_flow_events_flow_instance_id_pe_e2e_flow_instances_id_fk" FOREIGN KEY ("flow_instance_id") REFERENCES "public"."pe_e2e_flow_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD CONSTRAINT "pe_human_gates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD CONSTRAINT "pe_human_gates_step_instance_id_pe_e2e_step_instances_id_fk" FOREIGN KEY ("step_instance_id") REFERENCES "public"."pe_e2e_step_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD CONSTRAINT "pe_human_gates_flow_instance_id_pe_e2e_flow_instances_id_fk" FOREIGN KEY ("flow_instance_id") REFERENCES "public"."pe_e2e_flow_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD CONSTRAINT "pe_human_gates_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD CONSTRAINT "pe_human_gates_escalation_to_user_id_users_id_fk" FOREIGN KEY ("escalation_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD CONSTRAINT "pe_human_gates_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pe_e2e_flow_tenant_idx" ON "pe_e2e_flow_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_e2e_flow_id_idx" ON "pe_e2e_flow_instances" USING btree ("e2e_flow_id");--> statement-breakpoint
CREATE INDEX "pe_e2e_flow_entity_idx" ON "pe_e2e_flow_instances" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "pe_e2e_flow_status_idx" ON "pe_e2e_flow_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pe_e2e_flow_parent_idx" ON "pe_e2e_flow_instances" USING btree ("parent_flow_instance_id");--> statement-breakpoint
CREATE INDEX "pe_e2e_flow_created_at_idx" ON "pe_e2e_flow_instances" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pe_e2e_step_tenant_idx" ON "pe_e2e_step_instances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_e2e_step_flow_idx" ON "pe_e2e_step_instances" USING btree ("flow_instance_id");--> statement-breakpoint
CREATE INDEX "pe_e2e_step_status_idx" ON "pe_e2e_step_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pe_e2e_step_process_idx" ON "pe_e2e_step_instances" USING btree ("process_ref");--> statement-breakpoint
CREATE INDEX "pe_e2e_step_number_idx" ON "pe_e2e_step_instances" USING btree ("flow_instance_id","step_number");--> statement-breakpoint
CREATE INDEX "pe_event_trigger_tenant_idx" ON "pe_event_triggers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_event_trigger_event_idx" ON "pe_event_triggers" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "pe_event_trigger_active_idx" ON "pe_event_triggers" USING btree ("event_type","is_active");--> statement-breakpoint
CREATE INDEX "pe_event_trigger_flow_idx" ON "pe_event_triggers" USING btree ("e2e_flow_id");--> statement-breakpoint
CREATE INDEX "pe_flow_event_tenant_idx" ON "pe_flow_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_flow_event_flow_idx" ON "pe_flow_events" USING btree ("flow_instance_id");--> statement-breakpoint
CREATE INDEX "pe_flow_event_type_idx" ON "pe_flow_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "pe_flow_event_created_at_idx" ON "pe_flow_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pe_human_gate_tenant_idx" ON "pe_human_gates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_human_gate_assigned_idx" ON "pe_human_gates" USING btree ("assigned_to_user_id","decision");--> statement-breakpoint
CREATE INDEX "pe_human_gate_flow_idx" ON "pe_human_gates" USING btree ("flow_instance_id");--> statement-breakpoint
CREATE INDEX "pe_human_gate_step_idx" ON "pe_human_gates" USING btree ("step_instance_id");--> statement-breakpoint
CREATE INDEX "pe_human_gate_sla_idx" ON "pe_human_gates" USING btree ("sla_deadline");--> statement-breakpoint
CREATE INDEX "pe_human_gate_type_idx" ON "pe_human_gates" USING btree ("gate_type");