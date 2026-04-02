CREATE TABLE "dms_document_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_document_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"version_id" uuid,
	"signer_id" uuid NOT NULL,
	"signer_name" varchar(255) NOT NULL,
	"signer_email" varchar(255),
	"signature_type" varchar(30) DEFAULT 'electronic' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"signed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"signature_data" text,
	"certificate_serial" varchar(255),
	"ip_address" varchar(45),
	"reason" text,
	"stamp_type" varchar(30),
	"stamp_data" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"category_id" uuid,
	"document_type" varchar(50) NOT NULL,
	"template_format" varchar(30) DEFAULT 'html' NOT NULL,
	"body_template" text NOT NULL,
	"header_template" text,
	"footer_template" text,
	"variables" jsonb,
	"sample_data" jsonb,
	"output_format" varchar(20) DEFAULT 'pdf' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"storage_path" varchar(1000) NOT NULL,
	"change_notes" text,
	"uploaded_by" uuid NOT NULL,
	"checksum" varchar(128),
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category_id" uuid,
	"title" varchar(500) NOT NULL,
	"description" text,
	"document_number" varchar(100),
	"document_type" varchar(50) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"file_name" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"storage_path" varchar(1000) NOT NULL,
	"storage_provider" varchar(50) DEFAULT 'local' NOT NULL,
	"current_version_id" uuid,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"classification" varchar(30) DEFAULT 'internal' NOT NULL,
	"tags" jsonb,
	"uploaded_by" uuid NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_expiry_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"alert_type" varchar(30) DEFAULT 'expiry' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"alert_days_before" integer DEFAULT 30 NOT NULL,
	"alert_date" timestamp with time zone NOT NULL,
	"notified_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" uuid,
	"renewal_date" timestamp with time zone,
	"renewal_document_id" uuid,
	"assigned_to" uuid,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_ocr_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"version_id" uuid,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"extracted_text" text,
	"extracted_data" jsonb,
	"confidence" integer,
	"language" varchar(10),
	"page_count" integer,
	"processing_time_ms" integer,
	"ocr_engine" varchar(50),
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_retention_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"document_type" varchar(50) NOT NULL,
	"retention_days" integer NOT NULL,
	"archive_after_days" integer,
	"auto_archive" boolean DEFAULT false NOT NULL,
	"auto_delete" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_executed_at" timestamp with time zone,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_search_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"version_id" uuid,
	"indexed_content" text,
	"keywords" jsonb,
	"entities" jsonb,
	"summary" text,
	"language" varchar(10),
	"index_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"last_indexed_at" timestamp with time zone,
	"error_message" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dms_document_categories" ADD CONSTRAINT "dms_document_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_signatures" ADD CONSTRAINT "dms_document_signatures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_signatures" ADD CONSTRAINT "dms_document_signatures_document_id_dms_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."dms_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_signatures" ADD CONSTRAINT "dms_document_signatures_version_id_dms_document_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."dms_document_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_templates" ADD CONSTRAINT "dms_document_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_templates" ADD CONSTRAINT "dms_document_templates_category_id_dms_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."dms_document_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_versions" ADD CONSTRAINT "dms_document_versions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_document_versions" ADD CONSTRAINT "dms_document_versions_document_id_dms_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."dms_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_documents" ADD CONSTRAINT "dms_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_documents" ADD CONSTRAINT "dms_documents_category_id_dms_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."dms_document_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_expiry_alerts" ADD CONSTRAINT "dms_expiry_alerts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_expiry_alerts" ADD CONSTRAINT "dms_expiry_alerts_document_id_dms_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."dms_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_ocr_results" ADD CONSTRAINT "dms_ocr_results_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_ocr_results" ADD CONSTRAINT "dms_ocr_results_document_id_dms_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."dms_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_ocr_results" ADD CONSTRAINT "dms_ocr_results_version_id_dms_document_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."dms_document_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_retention_policies" ADD CONSTRAINT "dms_retention_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_search_index" ADD CONSTRAINT "dms_search_index_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_search_index" ADD CONSTRAINT "dms_search_index_document_id_dms_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."dms_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_search_index" ADD CONSTRAINT "dms_search_index_version_id_dms_document_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."dms_document_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dms_doc_categories_tenant_id_idx" ON "dms_document_categories" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dms_doc_categories_tenant_slug_idx" ON "dms_document_categories" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "dms_doc_categories_parent_id_idx" ON "dms_document_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "dms_doc_categories_is_active_idx" ON "dms_document_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "dms_doc_signatures_tenant_id_idx" ON "dms_document_signatures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_doc_signatures_document_id_idx" ON "dms_document_signatures" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "dms_doc_signatures_version_id_idx" ON "dms_document_signatures" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "dms_doc_signatures_signer_id_idx" ON "dms_document_signatures" USING btree ("signer_id");--> statement-breakpoint
CREATE INDEX "dms_doc_signatures_status_idx" ON "dms_document_signatures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dms_doc_templates_tenant_id_idx" ON "dms_document_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dms_doc_templates_tenant_slug_idx" ON "dms_document_templates" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "dms_doc_templates_category_id_idx" ON "dms_document_templates" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "dms_doc_templates_document_type_idx" ON "dms_document_templates" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "dms_doc_templates_is_active_idx" ON "dms_document_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "dms_doc_versions_tenant_id_idx" ON "dms_document_versions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_doc_versions_document_id_idx" ON "dms_document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dms_doc_versions_doc_version_idx" ON "dms_document_versions" USING btree ("document_id","version_number");--> statement-breakpoint
CREATE INDEX "dms_doc_versions_uploaded_by_idx" ON "dms_document_versions" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "dms_documents_tenant_id_idx" ON "dms_documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_documents_category_id_idx" ON "dms_documents" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "dms_documents_document_type_idx" ON "dms_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "dms_documents_entity_idx" ON "dms_documents" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "dms_documents_status_idx" ON "dms_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dms_documents_classification_idx" ON "dms_documents" USING btree ("classification");--> statement-breakpoint
CREATE INDEX "dms_documents_uploaded_by_idx" ON "dms_documents" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "dms_documents_is_archived_idx" ON "dms_documents" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "dms_documents_expires_at_idx" ON "dms_documents" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "dms_documents_created_at_idx" ON "dms_documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dms_expiry_alerts_tenant_id_idx" ON "dms_expiry_alerts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_expiry_alerts_document_id_idx" ON "dms_expiry_alerts" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "dms_expiry_alerts_status_idx" ON "dms_expiry_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dms_expiry_alerts_alert_date_idx" ON "dms_expiry_alerts" USING btree ("alert_date");--> statement-breakpoint
CREATE INDEX "dms_expiry_alerts_assigned_to_idx" ON "dms_expiry_alerts" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "dms_ocr_results_tenant_id_idx" ON "dms_ocr_results" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_ocr_results_document_id_idx" ON "dms_ocr_results" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "dms_ocr_results_version_id_idx" ON "dms_ocr_results" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "dms_ocr_results_status_idx" ON "dms_ocr_results" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dms_retention_policies_tenant_id_idx" ON "dms_retention_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_retention_policies_doc_type_idx" ON "dms_retention_policies" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "dms_retention_policies_is_active_idx" ON "dms_retention_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "dms_search_index_tenant_id_idx" ON "dms_search_index" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dms_search_index_document_id_idx" ON "dms_search_index" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "dms_search_index_version_id_idx" ON "dms_search_index" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "dms_search_index_status_idx" ON "dms_search_index" USING btree ("index_status");