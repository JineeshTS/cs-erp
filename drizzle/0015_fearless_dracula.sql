CREATE TABLE "isf_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"key_prefix" varchar(10) NOT NULL,
	"key_hash" varchar(500) NOT NULL,
	"service_account_id" uuid,
	"scopes" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"rate_limit" integer,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by" uuid,
	"revoke_reason" text,
	"ip_whitelist" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_code" varchar(50) NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"action" varchar(50) NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" uuid,
	"actor_id" uuid,
	"actor_type" varchar(30) DEFAULT 'user' NOT NULL,
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"outcome" varchar(20) DEFAULT 'success' NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"previous_state" jsonb,
	"new_state" jsonb,
	"change_diff" jsonb,
	"geo_location" jsonb,
	"session_id" varchar(255),
	"correlation_id" varchar(255),
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_compliance_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_code" varchar(50) NOT NULL,
	"report_name" varchar(255) NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"framework" varchar(50),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"overall_score" integer,
	"findings" jsonb,
	"recommendations" jsonb,
	"evidence_refs" jsonb,
	"generated_by" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_deployment_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cluster_id" uuid NOT NULL,
	"namespace_id" uuid,
	"deployment_name" varchar(255) NOT NULL,
	"deployment_code" varchar(50) NOT NULL,
	"image_name" varchar(500) NOT NULL,
	"image_tag" varchar(100) NOT NULL,
	"replicas" integer DEFAULT 1 NOT NULL,
	"strategy" varchar(30) DEFAULT 'rolling' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"health_status" varchar(20) DEFAULT 'unknown' NOT NULL,
	"cpu_request" integer,
	"cpu_limit" integer,
	"memory_request_mb" integer,
	"memory_limit_mb" integer,
	"env_vars" jsonb,
	"volume_mounts" jsonb,
	"rollback_version" varchar(100),
	"last_deployed_at" timestamp with time zone,
	"last_rollback_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_encryption_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"key_code" varchar(50) NOT NULL,
	"key_type" varchar(30) NOT NULL,
	"algorithm" varchar(50) NOT NULL,
	"key_size" integer NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone,
	"last_rotated_at" timestamp with time zone,
	"auto_rotate_interval_days" integer,
	"provider" varchar(50),
	"provider_key_id" varchar(255),
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_iam_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"policy_name" varchar(255) NOT NULL,
	"policy_code" varchar(50) NOT NULL,
	"description" text,
	"policy_type" varchar(30) NOT NULL,
	"effect" varchar(10) DEFAULT 'allow' NOT NULL,
	"resources" jsonb,
	"actions" jsonb,
	"conditions" jsonb,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_jit_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"request_ref" varchar(50) NOT NULL,
	"requested_by" uuid NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" uuid,
	"access_level" varchar(30) NOT NULL,
	"justification" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_k8s_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cluster_name" varchar(255) NOT NULL,
	"cluster_code" varchar(50) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"region" varchar(100) NOT NULL,
	"environment" varchar(30) DEFAULT 'production' NOT NULL,
	"version" varchar(30),
	"endpoint" varchar(500),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"node_count" integer,
	"cpu_capacity" integer,
	"memory_capacity_mb" integer,
	"cost_per_hour" integer,
	"config" jsonb,
	"tags" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_k8s_namespaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cluster_id" uuid NOT NULL,
	"namespace_name" varchar(255) NOT NULL,
	"environment" varchar(30) DEFAULT 'production' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"resource_quota" jsonb,
	"limit_range" jsonb,
	"labels" jsonb,
	"annotations" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_key_rotation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_id" uuid NOT NULL,
	"previous_version" integer NOT NULL,
	"new_version" integer NOT NULL,
	"rotation_type" varchar(20) DEFAULT 'manual' NOT NULL,
	"rotated_by" uuid,
	"reason" text,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isf_service_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_code" varchar(50) NOT NULL,
	"description" text,
	"service_type" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"policy_ids" jsonb,
	"credential_hash" varchar(500),
	"last_rotated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"ip_whitelist" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "isf_api_keys" ADD CONSTRAINT "isf_api_keys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_api_keys" ADD CONSTRAINT "isf_api_keys_service_account_id_isf_service_accounts_id_fk" FOREIGN KEY ("service_account_id") REFERENCES "public"."isf_service_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_audit_events" ADD CONSTRAINT "isf_audit_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_compliance_reports" ADD CONSTRAINT "isf_compliance_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_deployment_configs" ADD CONSTRAINT "isf_deployment_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_deployment_configs" ADD CONSTRAINT "isf_deployment_configs_cluster_id_isf_k8s_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."isf_k8s_clusters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_deployment_configs" ADD CONSTRAINT "isf_deployment_configs_namespace_id_isf_k8s_namespaces_id_fk" FOREIGN KEY ("namespace_id") REFERENCES "public"."isf_k8s_namespaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_encryption_keys" ADD CONSTRAINT "isf_encryption_keys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_iam_policies" ADD CONSTRAINT "isf_iam_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_jit_access_requests" ADD CONSTRAINT "isf_jit_access_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_k8s_clusters" ADD CONSTRAINT "isf_k8s_clusters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_k8s_namespaces" ADD CONSTRAINT "isf_k8s_namespaces_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_k8s_namespaces" ADD CONSTRAINT "isf_k8s_namespaces_cluster_id_isf_k8s_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."isf_k8s_clusters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_key_rotation_log" ADD CONSTRAINT "isf_key_rotation_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_key_rotation_log" ADD CONSTRAINT "isf_key_rotation_log_key_id_isf_encryption_keys_id_fk" FOREIGN KEY ("key_id") REFERENCES "public"."isf_encryption_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isf_service_accounts" ADD CONSTRAINT "isf_service_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "isf_api_keys_tenant_id_idx" ON "isf_api_keys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "isf_api_keys_key_prefix_idx" ON "isf_api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "isf_api_keys_service_account_id_idx" ON "isf_api_keys" USING btree ("service_account_id");--> statement-breakpoint
CREATE INDEX "isf_api_keys_status_idx" ON "isf_api_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_api_keys_expires_at_idx" ON "isf_api_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "isf_audit_tenant_id_idx" ON "isf_audit_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "isf_audit_event_type_idx" ON "isf_audit_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "isf_audit_action_idx" ON "isf_audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "isf_audit_resource_type_idx" ON "isf_audit_events" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "isf_audit_resource_id_idx" ON "isf_audit_events" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "isf_audit_actor_id_idx" ON "isf_audit_events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "isf_audit_severity_idx" ON "isf_audit_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "isf_audit_outcome_idx" ON "isf_audit_events" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "isf_audit_created_at_idx" ON "isf_audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "isf_audit_correlation_id_idx" ON "isf_audit_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "isf_compliance_tenant_id_idx" ON "isf_compliance_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_compliance_tenant_code_idx" ON "isf_compliance_reports" USING btree ("tenant_id","report_code");--> statement-breakpoint
CREATE INDEX "isf_compliance_report_type_idx" ON "isf_compliance_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "isf_compliance_framework_idx" ON "isf_compliance_reports" USING btree ("framework");--> statement-breakpoint
CREATE INDEX "isf_compliance_status_idx" ON "isf_compliance_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_compliance_period_start_idx" ON "isf_compliance_reports" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "isf_deployments_tenant_id_idx" ON "isf_deployment_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "isf_deployments_cluster_id_idx" ON "isf_deployment_configs" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "isf_deployments_namespace_id_idx" ON "isf_deployment_configs" USING btree ("namespace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_deployments_tenant_code_idx" ON "isf_deployment_configs" USING btree ("tenant_id","deployment_code");--> statement-breakpoint
CREATE INDEX "isf_deployments_status_idx" ON "isf_deployment_configs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_deployments_health_status_idx" ON "isf_deployment_configs" USING btree ("health_status");--> statement-breakpoint
CREATE INDEX "isf_enc_keys_tenant_id_idx" ON "isf_encryption_keys" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_enc_keys_tenant_code_idx" ON "isf_encryption_keys" USING btree ("tenant_id","key_code");--> statement-breakpoint
CREATE INDEX "isf_enc_keys_key_type_idx" ON "isf_encryption_keys" USING btree ("key_type");--> statement-breakpoint
CREATE INDEX "isf_enc_keys_purpose_idx" ON "isf_encryption_keys" USING btree ("purpose");--> statement-breakpoint
CREATE INDEX "isf_enc_keys_status_idx" ON "isf_encryption_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_enc_keys_expires_at_idx" ON "isf_encryption_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "isf_iam_policies_tenant_id_idx" ON "isf_iam_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_iam_policies_tenant_code_idx" ON "isf_iam_policies" USING btree ("tenant_id","policy_code");--> statement-breakpoint
CREATE INDEX "isf_iam_policies_policy_type_idx" ON "isf_iam_policies" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "isf_iam_policies_is_active_idx" ON "isf_iam_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "isf_jit_access_tenant_id_idx" ON "isf_jit_access_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_jit_access_tenant_ref_idx" ON "isf_jit_access_requests" USING btree ("tenant_id","request_ref");--> statement-breakpoint
CREATE INDEX "isf_jit_access_requested_by_idx" ON "isf_jit_access_requests" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "isf_jit_access_status_idx" ON "isf_jit_access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_jit_access_expires_at_idx" ON "isf_jit_access_requests" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "isf_clusters_tenant_id_idx" ON "isf_k8s_clusters" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_clusters_tenant_code_idx" ON "isf_k8s_clusters" USING btree ("tenant_id","cluster_code");--> statement-breakpoint
CREATE INDEX "isf_clusters_provider_idx" ON "isf_k8s_clusters" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "isf_clusters_environment_idx" ON "isf_k8s_clusters" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "isf_clusters_status_idx" ON "isf_k8s_clusters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_namespaces_tenant_id_idx" ON "isf_k8s_namespaces" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "isf_namespaces_cluster_id_idx" ON "isf_k8s_namespaces" USING btree ("cluster_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_namespaces_cluster_name_idx" ON "isf_k8s_namespaces" USING btree ("cluster_id","namespace_name");--> statement-breakpoint
CREATE INDEX "isf_namespaces_environment_idx" ON "isf_k8s_namespaces" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "isf_namespaces_status_idx" ON "isf_k8s_namespaces" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_key_rotation_tenant_id_idx" ON "isf_key_rotation_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "isf_key_rotation_key_id_idx" ON "isf_key_rotation_log" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "isf_key_rotation_type_idx" ON "isf_key_rotation_log" USING btree ("rotation_type");--> statement-breakpoint
CREATE INDEX "isf_key_rotation_status_idx" ON "isf_key_rotation_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "isf_svc_accounts_tenant_id_idx" ON "isf_service_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "isf_svc_accounts_tenant_code_idx" ON "isf_service_accounts" USING btree ("tenant_id","account_code");--> statement-breakpoint
CREATE INDEX "isf_svc_accounts_service_type_idx" ON "isf_service_accounts" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "isf_svc_accounts_status_idx" ON "isf_service_accounts" USING btree ("status");