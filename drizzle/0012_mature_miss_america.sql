CREATE TABLE "cso_agent_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_communication_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"direction" varchar(10) NOT NULL,
	"channel" varchar(30) NOT NULL,
	"from_address" varchar(255),
	"to_address" varchar(255),
	"subject" varchar(500),
	"body" text,
	"sent_by" uuid,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"attachments" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"complaint_number" varchar(50) NOT NULL,
	"category_id" uuid,
	"customer_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(50),
	"subject" varchar(500) NOT NULL,
	"description" text,
	"complaint_type" varchar(30) DEFAULT 'service' NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(30) DEFAULT 'open' NOT NULL,
	"assigned_to" uuid,
	"assigned_at" timestamp with time zone,
	"root_cause" text,
	"correction_action" text,
	"preventive_action" text,
	"compensation_amount" integer,
	"compensation_currency" varchar(3),
	"first_response_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"reference_type" varchar(30),
	"reference_id" uuid,
	"tags" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_customer_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"customer_id" uuid,
	"customer_name" varchar(255),
	"rating" integer,
	"satisfaction_score" integer,
	"feedback_text" text,
	"feedback_channel" varchar(30),
	"responded_by" uuid,
	"responded_at" timestamp with time zone,
	"response_text" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"escalation_level" integer DEFAULT 1 NOT NULL,
	"reason" text NOT NULL,
	"escalated_by" uuid NOT NULL,
	"escalated_to" uuid,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"response_notes" text,
	"responded_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"inquiry_number" varchar(50) NOT NULL,
	"category_id" uuid,
	"customer_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(50),
	"subject" varchar(500) NOT NULL,
	"description" text,
	"channel" varchar(30) DEFAULT 'email' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"status" varchar(30) DEFAULT 'open' NOT NULL,
	"assigned_to" uuid,
	"assigned_at" timestamp with time zone,
	"first_response_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"reference_type" varchar(30),
	"reference_id" uuid,
	"tags" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_knowledge_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"article_code" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"category_id" uuid,
	"content" text,
	"summary" text,
	"author" uuid,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_resolution_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"note_type" varchar(30) DEFAULT 'internal' NOT NULL,
	"content" text NOT NULL,
	"created_by" uuid NOT NULL,
	"is_internal" boolean DEFAULT true NOT NULL,
	"attachments" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category_code" varchar(50) NOT NULL,
	"category_name" varchar(255) NOT NULL,
	"parent_category_id" uuid,
	"description" text,
	"sla_hours" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"request_number" varchar(50) NOT NULL,
	"category_id" uuid,
	"customer_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"request_type" varchar(30) DEFAULT 'general' NOT NULL,
	"subject" varchar(500) NOT NULL,
	"description" text,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"status" varchar(30) DEFAULT 'open' NOT NULL,
	"assigned_to" uuid,
	"assigned_at" timestamp with time zone,
	"due_date" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"estimated_hours" integer,
	"actual_hours" integer,
	"reference_type" varchar(30),
	"reference_id" uuid,
	"tags" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_sla_breaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sla_policy_id" uuid,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" uuid NOT NULL,
	"breach_type" varchar(30) NOT NULL,
	"expected_at" timestamp with time zone NOT NULL,
	"breached_at" timestamp with time zone NOT NULL,
	"overage_minutes" integer,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_by" uuid,
	"acknowledged_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cso_sla_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"policy_code" varchar(50) NOT NULL,
	"policy_name" varchar(255) NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"response_time_hours" integer NOT NULL,
	"resolution_time_hours" integer NOT NULL,
	"escalation_after_hours" integer,
	"business_hours_only" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cso_agent_assignments" ADD CONSTRAINT "cso_agent_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_communication_logs" ADD CONSTRAINT "cso_communication_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_complaints" ADD CONSTRAINT "cso_complaints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_complaints" ADD CONSTRAINT "cso_complaints_category_id_cso_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cso_service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_customer_feedback" ADD CONSTRAINT "cso_customer_feedback_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_escalations" ADD CONSTRAINT "cso_escalations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_inquiries" ADD CONSTRAINT "cso_inquiries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_inquiries" ADD CONSTRAINT "cso_inquiries_category_id_cso_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cso_service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_knowledge_articles" ADD CONSTRAINT "cso_knowledge_articles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_knowledge_articles" ADD CONSTRAINT "cso_knowledge_articles_category_id_cso_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cso_service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_resolution_notes" ADD CONSTRAINT "cso_resolution_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_service_categories" ADD CONSTRAINT "cso_service_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_service_requests" ADD CONSTRAINT "cso_service_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_service_requests" ADD CONSTRAINT "cso_service_requests_category_id_cso_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cso_service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_sla_breaches" ADD CONSTRAINT "cso_sla_breaches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_sla_breaches" ADD CONSTRAINT "cso_sla_breaches_sla_policy_id_cso_sla_policies_id_fk" FOREIGN KEY ("sla_policy_id") REFERENCES "public"."cso_sla_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_sla_policies" ADD CONSTRAINT "cso_sla_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cso_agent_assignments_tenant_id_idx" ON "cso_agent_assignments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cso_agent_assignments_agent_id_idx" ON "cso_agent_assignments" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "cso_agent_assignments_entity_type_idx" ON "cso_agent_assignments" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_agent_assignments_entity_id_idx" ON "cso_agent_assignments" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cso_agent_assignments_assigned_by_idx" ON "cso_agent_assignments" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "cso_agent_assignments_status_idx" ON "cso_agent_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cso_communication_logs_tenant_id_idx" ON "cso_communication_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cso_communication_logs_entity_type_idx" ON "cso_communication_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_communication_logs_entity_id_idx" ON "cso_communication_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cso_communication_logs_channel_idx" ON "cso_communication_logs" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "cso_communication_logs_direction_idx" ON "cso_communication_logs" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "cso_communication_logs_sent_by_idx" ON "cso_communication_logs" USING btree ("sent_by");--> statement-breakpoint
CREATE INDEX "cso_complaints_tenant_id_idx" ON "cso_complaints" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_complaints_tenant_number_idx" ON "cso_complaints" USING btree ("tenant_id","complaint_number");--> statement-breakpoint
CREATE INDEX "cso_complaints_category_id_idx" ON "cso_complaints" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "cso_complaints_customer_id_idx" ON "cso_complaints" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cso_complaints_status_idx" ON "cso_complaints" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cso_complaints_severity_idx" ON "cso_complaints" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "cso_complaints_assigned_to_idx" ON "cso_complaints" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "cso_complaints_complaint_type_idx" ON "cso_complaints" USING btree ("complaint_type");--> statement-breakpoint
CREATE INDEX "cso_customer_feedback_tenant_id_idx" ON "cso_customer_feedback" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cso_customer_feedback_entity_type_idx" ON "cso_customer_feedback" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_customer_feedback_entity_id_idx" ON "cso_customer_feedback" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cso_customer_feedback_customer_id_idx" ON "cso_customer_feedback" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cso_customer_feedback_rating_idx" ON "cso_customer_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "cso_escalations_tenant_id_idx" ON "cso_escalations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cso_escalations_entity_type_idx" ON "cso_escalations" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_escalations_entity_id_idx" ON "cso_escalations" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cso_escalations_escalated_by_idx" ON "cso_escalations" USING btree ("escalated_by");--> statement-breakpoint
CREATE INDEX "cso_escalations_escalated_to_idx" ON "cso_escalations" USING btree ("escalated_to");--> statement-breakpoint
CREATE INDEX "cso_escalations_status_idx" ON "cso_escalations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cso_inquiries_tenant_id_idx" ON "cso_inquiries" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_inquiries_tenant_number_idx" ON "cso_inquiries" USING btree ("tenant_id","inquiry_number");--> statement-breakpoint
CREATE INDEX "cso_inquiries_category_id_idx" ON "cso_inquiries" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "cso_inquiries_customer_id_idx" ON "cso_inquiries" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cso_inquiries_status_idx" ON "cso_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cso_inquiries_priority_idx" ON "cso_inquiries" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "cso_inquiries_assigned_to_idx" ON "cso_inquiries" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "cso_inquiries_channel_idx" ON "cso_inquiries" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "cso_knowledge_articles_tenant_id_idx" ON "cso_knowledge_articles" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_knowledge_articles_tenant_code_idx" ON "cso_knowledge_articles" USING btree ("tenant_id","article_code");--> statement-breakpoint
CREATE INDEX "cso_knowledge_articles_category_id_idx" ON "cso_knowledge_articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "cso_knowledge_articles_status_idx" ON "cso_knowledge_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cso_knowledge_articles_is_public_idx" ON "cso_knowledge_articles" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "cso_knowledge_articles_author_idx" ON "cso_knowledge_articles" USING btree ("author");--> statement-breakpoint
CREATE INDEX "cso_resolution_notes_tenant_id_idx" ON "cso_resolution_notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cso_resolution_notes_entity_type_idx" ON "cso_resolution_notes" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_resolution_notes_entity_id_idx" ON "cso_resolution_notes" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cso_resolution_notes_created_by_idx" ON "cso_resolution_notes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "cso_resolution_notes_note_type_idx" ON "cso_resolution_notes" USING btree ("note_type");--> statement-breakpoint
CREATE INDEX "cso_service_categories_tenant_id_idx" ON "cso_service_categories" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_service_categories_tenant_code_idx" ON "cso_service_categories" USING btree ("tenant_id","category_code");--> statement-breakpoint
CREATE INDEX "cso_service_categories_parent_idx" ON "cso_service_categories" USING btree ("parent_category_id");--> statement-breakpoint
CREATE INDEX "cso_service_categories_is_active_idx" ON "cso_service_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cso_service_requests_tenant_id_idx" ON "cso_service_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_service_requests_tenant_number_idx" ON "cso_service_requests" USING btree ("tenant_id","request_number");--> statement-breakpoint
CREATE INDEX "cso_service_requests_category_id_idx" ON "cso_service_requests" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "cso_service_requests_customer_id_idx" ON "cso_service_requests" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cso_service_requests_status_idx" ON "cso_service_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cso_service_requests_priority_idx" ON "cso_service_requests" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "cso_service_requests_assigned_to_idx" ON "cso_service_requests" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "cso_service_requests_request_type_idx" ON "cso_service_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "cso_service_requests_due_date_idx" ON "cso_service_requests" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "cso_sla_breaches_tenant_id_idx" ON "cso_sla_breaches" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cso_sla_breaches_sla_policy_id_idx" ON "cso_sla_breaches" USING btree ("sla_policy_id");--> statement-breakpoint
CREATE INDEX "cso_sla_breaches_entity_type_idx" ON "cso_sla_breaches" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_sla_breaches_entity_id_idx" ON "cso_sla_breaches" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "cso_sla_breaches_breach_type_idx" ON "cso_sla_breaches" USING btree ("breach_type");--> statement-breakpoint
CREATE INDEX "cso_sla_breaches_acknowledged_idx" ON "cso_sla_breaches" USING btree ("acknowledged");--> statement-breakpoint
CREATE INDEX "cso_sla_policies_tenant_id_idx" ON "cso_sla_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_sla_policies_tenant_code_idx" ON "cso_sla_policies" USING btree ("tenant_id","policy_code");--> statement-breakpoint
CREATE INDEX "cso_sla_policies_entity_type_idx" ON "cso_sla_policies" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "cso_sla_policies_is_active_idx" ON "cso_sla_policies" USING btree ("is_active");