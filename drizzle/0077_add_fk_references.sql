CREATE TABLE "acm_sanctions_screenings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"screening_ref" varchar(50) NOT NULL,
	"entity_name" varchar(255) NOT NULL,
	"entity_type" varchar(30) DEFAULT 'individual' NOT NULL,
	"entity_id" uuid,
	"entity_table" varchar(100),
	"screening_type" varchar(30) DEFAULT 'standard' NOT NULL,
	"lists_checked" jsonb DEFAULT '["OFAC_SDN","EU_CONSOLIDATED","UN_CONSOLIDATED"]' NOT NULL,
	"match_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"match_details" jsonb,
	"risk_score" integer,
	"screened_by" varchar(255),
	"screened_at" timestamp with time zone,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp with time zone,
	"resolution" varchar(30),
	"resolution_notes" text,
	"next_screening_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pe_step_entity_bindings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"step_instance_id" uuid NOT NULL,
	"flow_instance_id" uuid NOT NULL,
	"entity_table" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_action" varchar(20) NOT NULL,
	"entity_data" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_permission_id_pk";--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_audit_log" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_audit_log" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD COLUMN "entity_table" varchar(100);--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD COLUMN "entity_id" uuid;--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD COLUMN "entity_action" varchar(20);--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD COLUMN "executor_mode" varchar(20);--> statement-breakpoint
ALTER TABLE "pe_e2e_step_instances" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pe_event_log" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pe_event_log" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pe_event_triggers" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pe_flow_events" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pe_flow_events" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pe_human_gates" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "acm_sanctions_screenings" ADD CONSTRAINT "acm_sanctions_screenings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_step_entity_bindings" ADD CONSTRAINT "pe_step_entity_bindings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_step_entity_bindings" ADD CONSTRAINT "pe_step_entity_bindings_step_instance_id_pe_e2e_step_instances_id_fk" FOREIGN KEY ("step_instance_id") REFERENCES "public"."pe_e2e_step_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_step_entity_bindings" ADD CONSTRAINT "pe_step_entity_bindings_flow_instance_id_pe_e2e_flow_instances_id_fk" FOREIGN KEY ("flow_instance_id") REFERENCES "public"."pe_e2e_flow_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "acm_sanctions_screenings_tenant_idx" ON "acm_sanctions_screenings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_sanctions_screenings_entity_idx" ON "acm_sanctions_screenings" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "acm_sanctions_screenings_match_status_idx" ON "acm_sanctions_screenings" USING btree ("match_status");--> statement-breakpoint
CREATE INDEX "acm_sanctions_screenings_status_idx" ON "acm_sanctions_screenings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pe_entity_bind_tenant_idx" ON "pe_step_entity_bindings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pe_entity_bind_step_idx" ON "pe_step_entity_bindings" USING btree ("step_instance_id");--> statement-breakpoint
CREATE INDEX "pe_entity_bind_flow_idx" ON "pe_step_entity_bindings" USING btree ("flow_instance_id");--> statement-breakpoint
CREATE INDEX "pe_entity_bind_entity_idx" ON "pe_step_entity_bindings" USING btree ("entity_table","entity_id");--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_audit_log" ADD CONSTRAINT "auth_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_cost_centres" ADD CONSTRAINT "mdm_cost_centres_parent_id_mdm_cost_centres_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mdm_cost_centres"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_customers" ADD CONSTRAINT "mdm_customers_parent_id_mdm_customers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mdm_customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_gl_accounts" ADD CONSTRAINT "mdm_gl_accounts_parent_id_mdm_gl_accounts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mdm_gl_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_doa_matrix" ADD CONSTRAINT "wne_doa_matrix_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_notification_preferences" ADD CONSTRAINT "wne_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_notifications" ADD CONSTRAINT "wne_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_sla_instances" ADD CONSTRAINT "wne_sla_instances_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wne_workflow_step_instances" ADD CONSTRAINT "wne_workflow_step_instances_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_categories" ADD CONSTRAINT "dms_document_categories_parent_id_dms_document_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dms_document_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_versions" ADD CONSTRAINT "dms_document_versions_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_documents" ADD CONSTRAINT "dms_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_expiry_alerts" ADD CONSTRAINT "dms_expiry_alerts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_leads" ADD CONSTRAINT "scm_leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_onboarding_checklists" ADD CONSTRAINT "scm_onboarding_checklists_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_onboarding_checklists" ADD CONSTRAINT "scm_onboarding_checklists_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scm_opportunity_activities" ADD CONSTRAINT "scm_opportunity_activities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpm_revenue_leakages" ADD CONSTRAINT "cpm_revenue_leakages_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_complaints" ADD CONSTRAINT "cso_complaints_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_inquiries" ADD CONSTRAINT "cso_inquiries_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_resolution_notes" ADD CONSTRAINT "cso_resolution_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cso_service_requests" ADD CONSTRAINT "cso_service_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_escalations" ADD CONSTRAINT "aaf_escalations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_orchestration_tasks" ADD CONSTRAINT "aaf_orchestration_tasks_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aaf_workflow_instances" ADD CONSTRAINT "aaf_workflow_instances_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfm_cost_centres" ADD CONSTRAINT "cfm_cost_centres_parent_id_cfm_cost_centres_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cfm_cost_centres"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_invoice_disputes" ADD CONSTRAINT "firm_invoice_disputes_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arcc_collection_workflows" ADD CONSTRAINT "arcc_collection_workflows_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_planned_maintenance_tasks" ADD CONSTRAINT "vtm_planned_maintenance_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_approvals" ADD CONSTRAINT "pe_approvals_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_e2e_flow_instances" ADD CONSTRAINT "pe_e2e_flow_instances_parent_flow_instance_id_pe_e2e_flow_instances_id_fk" FOREIGN KEY ("parent_flow_instance_id") REFERENCES "public"."pe_e2e_flow_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_event_log" ADD CONSTRAINT "pe_event_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pe_process_instances" ADD CONSTRAINT "pe_process_instances_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "role_assignments_user_id_idx" ON "role_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_assignments_role_id_idx" ON "role_assignments" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_assignments_tenant_id_idx" ON "role_assignments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "roles_tenant_id_idx" ON "roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_tenant_id_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_role_id_idx" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_tenant_email_idx" ON "users" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_tenant_id_idx" ON "sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "auth_audit_log_tenant_id_idx" ON "auth_audit_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "auth_audit_log_user_id_idx" ON "auth_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_audit_log_event_type_idx" ON "auth_audit_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "auth_audit_log_created_at_idx" ON "auth_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_tenant_id_idx" ON "role_permissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "eqy_container_fleet_tenant_container_idx" ON "eqy_container_fleet" USING btree ("tenant_id","container_number");