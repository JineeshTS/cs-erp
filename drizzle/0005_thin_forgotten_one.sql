CREATE TABLE "admin_ai_agent_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_slug" varchar(100) NOT NULL,
	"agent_name" varchar(255) NOT NULL,
	"description" text,
	"model_provider" varchar(50) DEFAULT 'anthropic' NOT NULL,
	"model_id" varchar(100) NOT NULL,
	"temperature" integer DEFAULT 70 NOT NULL,
	"max_tokens" integer DEFAULT 4096 NOT NULL,
	"system_prompt" text,
	"automation_level" integer DEFAULT 95 NOT NULL,
	"human_review_threshold" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"settings" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_approval_matrices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"entity_type" varchar(50) NOT NULL,
	"condition_field" varchar(100) NOT NULL,
	"condition_operator" varchar(20) DEFAULT 'gte' NOT NULL,
	"threshold_amount" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'QAR' NOT NULL,
	"approver_role_id" uuid,
	"approver_user_id" uuid,
	"required_approvals" integer DEFAULT 1 NOT NULL,
	"escalation_timeout_minutes" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"user_email" varchar(255),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"module" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"previous_data" jsonb,
	"new_data" jsonb,
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_feature_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"module_config_id" uuid NOT NULL,
	"feature_slug" varchar(100) NOT NULL,
	"feature_name" varchar(255) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"settings" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"flag_key" varchar(100) NOT NULL,
	"flag_name" varchar(255) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"rollout_percentage" integer DEFAULT 0 NOT NULL,
	"target_roles" jsonb,
	"target_users" jsonb,
	"conditions" jsonb,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_import_export_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"job_type" varchar(20) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"file_name" varchar(500),
	"file_size" integer,
	"file_format" varchar(20) DEFAULT 'csv' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"total_records" integer,
	"processed_records" integer DEFAULT 0 NOT NULL,
	"failed_records" integer DEFAULT 0 NOT NULL,
	"error_log" jsonb,
	"column_mapping" jsonb,
	"filters" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"initiated_by" uuid NOT NULL,
	"result_file_path" varchar(1000),
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_integration_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"provider" varchar(100) NOT NULL,
	"endpoint_url" varchar(1000) NOT NULL,
	"method" varchar(10) DEFAULT 'POST' NOT NULL,
	"auth_type" varchar(30) DEFAULT 'bearer' NOT NULL,
	"auth_config" jsonb,
	"headers" jsonb,
	"retry_policy" jsonb,
	"timeout_ms" integer DEFAULT 30000 NOT NULL,
	"rate_limit_per_minute" integer,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"last_tested_at" timestamp with time zone,
	"last_test_result" varchar(30),
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"license_key" varchar(255) NOT NULL,
	"license_name" varchar(255) NOT NULL,
	"description" text,
	"license_type" varchar(50) DEFAULT 'subscription' NOT NULL,
	"plan" varchar(50) DEFAULT 'starter' NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"max_users" integer DEFAULT 10 NOT NULL,
	"max_storage" integer DEFAULT 5120 NOT NULL,
	"features" jsonb,
	"billing_cycle" varchar(20) DEFAULT 'monthly' NOT NULL,
	"amount_per_cycle" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'QAR' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"renewed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_master_data_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_name" varchar(255) NOT NULL,
	"description" text,
	"validation_rules" jsonb,
	"default_values" jsonb,
	"required_fields" jsonb,
	"unique_fields" jsonb,
	"is_locked" boolean DEFAULT false NOT NULL,
	"last_synced_at" timestamp with time zone,
	"record_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_module_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"module_slug" varchar(100) NOT NULL,
	"module_name" varchar(255) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"settings" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_notification_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"channel" varchar(30) DEFAULT 'email' NOT NULL,
	"event_trigger" varchar(100) NOT NULL,
	"subject" varchar(500),
	"body_template" text NOT NULL,
	"variables" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"recipient_type" varchar(30) DEFAULT 'user' NOT NULL,
	"recipient_config" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_system_health_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"metric_category" varchar(50) DEFAULT 'system' NOT NULL,
	"value" integer NOT NULL,
	"unit" varchar(30) DEFAULT 'count' NOT NULL,
	"threshold" integer,
	"status" varchar(20) DEFAULT 'healthy' NOT NULL,
	"source" varchar(100),
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_ai_agent_configs" ADD CONSTRAINT "admin_ai_agent_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_approval_matrices" ADD CONSTRAINT "admin_approval_matrices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_feature_configs" ADD CONSTRAINT "admin_feature_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_feature_configs" ADD CONSTRAINT "admin_feature_configs_module_config_id_admin_module_configs_id_fk" FOREIGN KEY ("module_config_id") REFERENCES "public"."admin_module_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_feature_flags" ADD CONSTRAINT "admin_feature_flags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_import_export_jobs" ADD CONSTRAINT "admin_import_export_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_integration_endpoints" ADD CONSTRAINT "admin_integration_endpoints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_licenses" ADD CONSTRAINT "admin_licenses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_master_data_configs" ADD CONSTRAINT "admin_master_data_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_module_configs" ADD CONSTRAINT "admin_module_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notification_configs" ADD CONSTRAINT "admin_notification_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_system_health_metrics" ADD CONSTRAINT "admin_system_health_metrics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_ai_agent_configs_tenant_id_idx" ON "admin_ai_agent_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_ai_agent_configs_tenant_slug_idx" ON "admin_ai_agent_configs" USING btree ("tenant_id","agent_slug");--> statement-breakpoint
CREATE INDEX "admin_ai_agent_configs_is_active_idx" ON "admin_ai_agent_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "admin_approval_matrices_tenant_id_idx" ON "admin_approval_matrices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_approval_matrices_tenant_slug_idx" ON "admin_approval_matrices" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "admin_approval_matrices_entity_type_idx" ON "admin_approval_matrices" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "admin_approval_matrices_is_active_idx" ON "admin_approval_matrices" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_tenant_id_idx" ON "admin_audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_user_id_idx" ON "admin_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_entity_type_idx" ON "admin_audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_entity_id_idx" ON "admin_audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_module_idx" ON "admin_audit_logs" USING btree ("module");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_severity_idx" ON "admin_audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_feature_configs_tenant_id_idx" ON "admin_feature_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "admin_feature_configs_module_config_id_idx" ON "admin_feature_configs" USING btree ("module_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_feature_configs_tenant_slug_idx" ON "admin_feature_configs" USING btree ("tenant_id","module_config_id","feature_slug");--> statement-breakpoint
CREATE INDEX "admin_feature_configs_is_enabled_idx" ON "admin_feature_configs" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "admin_feature_flags_tenant_id_idx" ON "admin_feature_flags" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_feature_flags_tenant_key_idx" ON "admin_feature_flags" USING btree ("tenant_id","flag_key");--> statement-breakpoint
CREATE INDEX "admin_feature_flags_is_enabled_idx" ON "admin_feature_flags" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "admin_import_export_jobs_tenant_id_idx" ON "admin_import_export_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "admin_import_export_jobs_job_type_idx" ON "admin_import_export_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "admin_import_export_jobs_entity_type_idx" ON "admin_import_export_jobs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "admin_import_export_jobs_status_idx" ON "admin_import_export_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_import_export_jobs_initiated_by_idx" ON "admin_import_export_jobs" USING btree ("initiated_by");--> statement-breakpoint
CREATE INDEX "admin_import_export_jobs_created_at_idx" ON "admin_import_export_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_integration_endpoints_tenant_id_idx" ON "admin_integration_endpoints" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_integration_endpoints_tenant_slug_idx" ON "admin_integration_endpoints" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "admin_integration_endpoints_provider_idx" ON "admin_integration_endpoints" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "admin_integration_endpoints_status_idx" ON "admin_integration_endpoints" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_licenses_tenant_id_idx" ON "admin_licenses" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_licenses_key_idx" ON "admin_licenses" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "admin_licenses_status_idx" ON "admin_licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_licenses_plan_idx" ON "admin_licenses" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "admin_licenses_expires_at_idx" ON "admin_licenses" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "admin_master_data_configs_tenant_id_idx" ON "admin_master_data_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_master_data_configs_tenant_entity_idx" ON "admin_master_data_configs" USING btree ("tenant_id","entity_type");--> statement-breakpoint
CREATE INDEX "admin_master_data_configs_is_locked_idx" ON "admin_master_data_configs" USING btree ("is_locked");--> statement-breakpoint
CREATE INDEX "admin_module_configs_tenant_id_idx" ON "admin_module_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_module_configs_tenant_slug_idx" ON "admin_module_configs" USING btree ("tenant_id","module_slug");--> statement-breakpoint
CREATE INDEX "admin_module_configs_is_enabled_idx" ON "admin_module_configs" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "admin_notification_configs_tenant_id_idx" ON "admin_notification_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_notification_configs_tenant_slug_idx" ON "admin_notification_configs" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "admin_notification_configs_channel_idx" ON "admin_notification_configs" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "admin_notification_configs_event_trigger_idx" ON "admin_notification_configs" USING btree ("event_trigger");--> statement-breakpoint
CREATE INDEX "admin_notification_configs_is_active_idx" ON "admin_notification_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "admin_system_health_metrics_tenant_id_idx" ON "admin_system_health_metrics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "admin_system_health_metrics_metric_name_idx" ON "admin_system_health_metrics" USING btree ("metric_name");--> statement-breakpoint
CREATE INDEX "admin_system_health_metrics_category_idx" ON "admin_system_health_metrics" USING btree ("metric_category");--> statement-breakpoint
CREATE INDEX "admin_system_health_metrics_status_idx" ON "admin_system_health_metrics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_system_health_metrics_recorded_at_idx" ON "admin_system_health_metrics" USING btree ("recorded_at");