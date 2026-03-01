CREATE TABLE "iel_customs_filings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"filing_ref" varchar(50) NOT NULL,
	"filing_type" varchar(50) NOT NULL,
	"customs_authority" varchar(50) NOT NULL,
	"country_code" varchar(3) NOT NULL,
	"port_code" varchar(20),
	"declaration_type" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"declaration_data" jsonb,
	"line_items" jsonb,
	"hs_code" varchar(20),
	"total_value" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"duty_amount" integer,
	"tax_amount" integer,
	"submitted_at" timestamp with time zone,
	"submitted_by" uuid,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"connection_id" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_customs_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"filing_id" uuid NOT NULL,
	"response_ref" varchar(50) NOT NULL,
	"response_type" varchar(30) NOT NULL,
	"status" varchar(20) NOT NULL,
	"response_data" jsonb,
	"error_codes" jsonb,
	"officer_name" varchar(255),
	"officer_notes" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_edi_message_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"segment_index" integer NOT NULL,
	"segment_tag" varchar(10) NOT NULL,
	"segment_data" jsonb,
	"raw_segment" text,
	"validation_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"validation_errors" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_edi_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"message_ref" varchar(50) NOT NULL,
	"message_type" varchar(30) NOT NULL,
	"edi_standard" varchar(20) DEFAULT 'EDIFACT' NOT NULL,
	"direction" varchar(20) NOT NULL,
	"sender_code" varchar(50) NOT NULL,
	"receiver_code" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'received' NOT NULL,
	"raw_content" text,
	"parsed_content" jsonb,
	"validation_errors" jsonb,
	"connection_id" uuid,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"processed_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_edi_processing_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"message_id" uuid,
	"log_level" varchar(20) DEFAULT 'info' NOT NULL,
	"step" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"details" jsonb,
	"duration_ms" integer,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_integration_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connection_name" varchar(255) NOT NULL,
	"connection_code" varchar(50) NOT NULL,
	"connection_type" varchar(50) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"base_url" varchar(500),
	"auth_type" varchar(30) DEFAULT 'oauth2' NOT NULL,
	"auth_config" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"health_status" varchar(20) DEFAULT 'unknown' NOT NULL,
	"last_health_check_at" timestamp with time zone,
	"retry_policy" jsonb,
	"rate_limit_per_minute" integer,
	"timeout_ms" integer DEFAULT 30000,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_integration_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connection_id" uuid NOT NULL,
	"endpoint_name" varchar(255) NOT NULL,
	"endpoint_code" varchar(50) NOT NULL,
	"http_method" varchar(10) DEFAULT 'GET' NOT NULL,
	"path" varchar(500) NOT NULL,
	"request_schema" jsonb,
	"response_schema" jsonb,
	"transform_config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_oracle_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connection_id" uuid,
	"job_code" varchar(50) NOT NULL,
	"sync_type" varchar(30) NOT NULL,
	"direction" varchar(20) DEFAULT 'inbound' NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"records_total" integer DEFAULT 0,
	"records_processed" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"error_log" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"schedule_cron" varchar(100),
	"last_sync_at" timestamp with time zone,
	"sync_config" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_oracle_sync_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"job_id" uuid,
	"source_field" varchar(255) NOT NULL,
	"target_field" varchar(255) NOT NULL,
	"transform_expression" text,
	"default_value" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iel_port_connect_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"message_ref" varchar(50) NOT NULL,
	"message_type" varchar(50) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"port_code" varchar(20) NOT NULL,
	"terminal_code" varchar(20),
	"vessel_imo" varchar(20),
	"voyage_ref" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payload" jsonb,
	"response_payload" jsonb,
	"connection_id" uuid,
	"processed_at" timestamp with time zone,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iel_customs_filings" ADD CONSTRAINT "iel_customs_filings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_customs_filings" ADD CONSTRAINT "iel_customs_filings_connection_id_iel_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."iel_integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_customs_responses" ADD CONSTRAINT "iel_customs_responses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_customs_responses" ADD CONSTRAINT "iel_customs_responses_filing_id_iel_customs_filings_id_fk" FOREIGN KEY ("filing_id") REFERENCES "public"."iel_customs_filings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_edi_message_segments" ADD CONSTRAINT "iel_edi_message_segments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_edi_message_segments" ADD CONSTRAINT "iel_edi_message_segments_message_id_iel_edi_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."iel_edi_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_edi_messages" ADD CONSTRAINT "iel_edi_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_edi_messages" ADD CONSTRAINT "iel_edi_messages_connection_id_iel_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."iel_integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_edi_processing_logs" ADD CONSTRAINT "iel_edi_processing_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_edi_processing_logs" ADD CONSTRAINT "iel_edi_processing_logs_message_id_iel_edi_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."iel_edi_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_integration_connections" ADD CONSTRAINT "iel_integration_connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_integration_endpoints" ADD CONSTRAINT "iel_integration_endpoints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_integration_endpoints" ADD CONSTRAINT "iel_integration_endpoints_connection_id_iel_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."iel_integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_oracle_sync_jobs" ADD CONSTRAINT "iel_oracle_sync_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_oracle_sync_jobs" ADD CONSTRAINT "iel_oracle_sync_jobs_connection_id_iel_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."iel_integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_oracle_sync_mappings" ADD CONSTRAINT "iel_oracle_sync_mappings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_oracle_sync_mappings" ADD CONSTRAINT "iel_oracle_sync_mappings_job_id_iel_oracle_sync_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."iel_oracle_sync_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_port_connect_messages" ADD CONSTRAINT "iel_port_connect_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iel_port_connect_messages" ADD CONSTRAINT "iel_port_connect_messages_connection_id_iel_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."iel_integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "iel_customs_fil_tenant_id_idx" ON "iel_customs_filings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "iel_customs_fil_tenant_ref_idx" ON "iel_customs_filings" USING btree ("tenant_id","filing_ref");--> statement-breakpoint
CREATE INDEX "iel_customs_fil_type_idx" ON "iel_customs_filings" USING btree ("filing_type");--> statement-breakpoint
CREATE INDEX "iel_customs_fil_authority_idx" ON "iel_customs_filings" USING btree ("customs_authority");--> statement-breakpoint
CREATE INDEX "iel_customs_fil_country_idx" ON "iel_customs_filings" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "iel_customs_fil_status_idx" ON "iel_customs_filings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iel_customs_fil_decl_type_idx" ON "iel_customs_filings" USING btree ("declaration_type");--> statement-breakpoint
CREATE INDEX "iel_customs_fil_conn_id_idx" ON "iel_customs_filings" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "iel_customs_resp_tenant_id_idx" ON "iel_customs_responses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "iel_customs_resp_filing_id_idx" ON "iel_customs_responses" USING btree ("filing_id");--> statement-breakpoint
CREATE INDEX "iel_customs_resp_type_idx" ON "iel_customs_responses" USING btree ("response_type");--> statement-breakpoint
CREATE INDEX "iel_customs_resp_status_idx" ON "iel_customs_responses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iel_edi_seg_tenant_id_idx" ON "iel_edi_message_segments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "iel_edi_seg_message_id_idx" ON "iel_edi_message_segments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "iel_edi_seg_tag_idx" ON "iel_edi_message_segments" USING btree ("segment_tag");--> statement-breakpoint
CREATE INDEX "iel_edi_seg_validation_idx" ON "iel_edi_message_segments" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_tenant_id_idx" ON "iel_edi_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "iel_edi_msg_tenant_ref_idx" ON "iel_edi_messages" USING btree ("tenant_id","message_ref");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_type_idx" ON "iel_edi_messages" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_direction_idx" ON "iel_edi_messages" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_status_idx" ON "iel_edi_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_sender_idx" ON "iel_edi_messages" USING btree ("sender_code");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_receiver_idx" ON "iel_edi_messages" USING btree ("receiver_code");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_conn_id_idx" ON "iel_edi_messages" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "iel_edi_msg_related_idx" ON "iel_edi_messages" USING btree ("related_entity_type","related_entity_id");--> statement-breakpoint
CREATE INDEX "iel_edi_log_tenant_id_idx" ON "iel_edi_processing_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "iel_edi_log_message_id_idx" ON "iel_edi_processing_logs" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "iel_edi_log_level_idx" ON "iel_edi_processing_logs" USING btree ("log_level");--> statement-breakpoint
CREATE INDEX "iel_edi_log_step_idx" ON "iel_edi_processing_logs" USING btree ("step");--> statement-breakpoint
CREATE INDEX "iel_edi_log_created_at_idx" ON "iel_edi_processing_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "iel_conn_tenant_id_idx" ON "iel_integration_connections" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "iel_conn_tenant_code_idx" ON "iel_integration_connections" USING btree ("tenant_id","connection_code");--> statement-breakpoint
CREATE INDEX "iel_conn_type_idx" ON "iel_integration_connections" USING btree ("connection_type");--> statement-breakpoint
CREATE INDEX "iel_conn_provider_idx" ON "iel_integration_connections" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "iel_conn_status_idx" ON "iel_integration_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iel_ep_tenant_id_idx" ON "iel_integration_endpoints" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "iel_ep_connection_id_idx" ON "iel_integration_endpoints" USING btree ("connection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "iel_ep_conn_code_idx" ON "iel_integration_endpoints" USING btree ("connection_id","endpoint_code");--> statement-breakpoint
CREATE INDEX "iel_ep_method_idx" ON "iel_integration_endpoints" USING btree ("http_method");--> statement-breakpoint
CREATE INDEX "iel_ep_is_active_idx" ON "iel_integration_endpoints" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "iel_oracle_jobs_tenant_id_idx" ON "iel_oracle_sync_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "iel_oracle_jobs_tenant_code_idx" ON "iel_oracle_sync_jobs" USING btree ("tenant_id","job_code");--> statement-breakpoint
CREATE INDEX "iel_oracle_jobs_conn_id_idx" ON "iel_oracle_sync_jobs" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "iel_oracle_jobs_sync_type_idx" ON "iel_oracle_sync_jobs" USING btree ("sync_type");--> statement-breakpoint
CREATE INDEX "iel_oracle_jobs_status_idx" ON "iel_oracle_sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iel_oracle_jobs_entity_type_idx" ON "iel_oracle_sync_jobs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "iel_oracle_map_tenant_id_idx" ON "iel_oracle_sync_mappings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "iel_oracle_map_job_id_idx" ON "iel_oracle_sync_mappings" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "iel_port_msg_tenant_id_idx" ON "iel_port_connect_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "iel_port_msg_tenant_ref_idx" ON "iel_port_connect_messages" USING btree ("tenant_id","message_ref");--> statement-breakpoint
CREATE INDEX "iel_port_msg_type_idx" ON "iel_port_connect_messages" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "iel_port_msg_direction_idx" ON "iel_port_connect_messages" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "iel_port_msg_port_code_idx" ON "iel_port_connect_messages" USING btree ("port_code");--> statement-breakpoint
CREATE INDEX "iel_port_msg_status_idx" ON "iel_port_connect_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iel_port_msg_vessel_idx" ON "iel_port_connect_messages" USING btree ("vessel_imo");--> statement-breakpoint
CREATE INDEX "iel_port_msg_conn_id_idx" ON "iel_port_connect_messages" USING btree ("connection_id");