CREATE TABLE "acm_ai_risk_detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"detection_ref" varchar(50) NOT NULL,
	"detection_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"model_name" varchar(255),
	"model_version" varchar(50),
	"entity_type" varchar(100),
	"entity_ref" varchar(100),
	"risk_score" numeric(6, 2),
	"confidence_score" numeric(6, 2),
	"risk_level" varchar(20),
	"risk_factors" jsonb,
	"alerts" jsonb,
	"threshold" numeric(6, 2),
	"is_above_threshold" boolean DEFAULT false,
	"recommendations" jsonb,
	"investigation_status" varchar(30),
	"investigated_by" varchar(255),
	"resolution_notes" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_internal_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"audit_ref" varchar(50) NOT NULL,
	"audit_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"scope" text,
	"objective" text,
	"lead_auditor" varchar(255),
	"audit_team" jsonb,
	"department" varchar(255),
	"planned_start_date" timestamp with time zone,
	"planned_end_date" timestamp with time zone,
	"actual_start_date" timestamp with time zone,
	"actual_end_date" timestamp with time zone,
	"total_findings" integer,
	"critical_findings" integer,
	"major_findings" integer,
	"minor_findings" integer,
	"risk_rating" varchar(20),
	"recommendations" jsonb,
	"action_items" jsonb,
	"report_url" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_iso_certification_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"certification_ref" varchar(50) NOT NULL,
	"certification_type" varchar(30) NOT NULL,
	"standard" varchar(100) NOT NULL,
	"scope" text,
	"certifying_body" varchar(255),
	"certificate_number" varchar(100),
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"renewal_date" timestamp with time zone,
	"last_surveillance_date" timestamp with time zone,
	"next_surveillance_date" timestamp with time zone,
	"surveillance_schedule" jsonb,
	"audit_findings" jsonb,
	"corrective_actions" jsonb,
	"non_conformities" integer DEFAULT 0,
	"major_non_conformities" integer DEFAULT 0,
	"document_url" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_policy_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"policy_ref" varchar(50) NOT NULL,
	"policy_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"version" varchar(20),
	"category" varchar(100),
	"department" varchar(255),
	"author" varchar(255),
	"approver" varchar(255),
	"approval_date" timestamp with time zone,
	"effective_date" timestamp with time zone,
	"review_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"document_url" text,
	"summary" text,
	"distribution_list" jsonb,
	"acknowledgment_count" integer DEFAULT 0,
	"total_distributed" integer DEFAULT 0,
	"related_policies" jsonb,
	"change_history" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_regulatory_compliance_calendars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"calendar_ref" varchar(50) NOT NULL,
	"compliance_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"regulation" varchar(255),
	"authority" varchar(255),
	"jurisdiction" varchar(100),
	"frequency" varchar(30),
	"due_date" timestamp with time zone,
	"reminder_days" integer,
	"responsible_person" varchar(255),
	"responsible_department" varchar(255),
	"completion_date" timestamp with time zone,
	"next_due_date" timestamp with time zone,
	"penalty_amount" numeric(14, 2),
	"penalty_currency" varchar(3) DEFAULT 'USD',
	"attachments" jsonb,
	"is_recurring" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_regulatory_reporting_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"submission_ref" varchar(50) NOT NULL,
	"submission_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"regulation" varchar(255),
	"authority" varchar(255),
	"jurisdiction" varchar(100),
	"reporting_period_start" timestamp with time zone,
	"reporting_period_end" timestamp with time zone,
	"due_date" timestamp with time zone,
	"submission_date" timestamp with time zone,
	"submission_format" varchar(50),
	"submission_channel" varchar(50),
	"data_payload" jsonb,
	"acknowledgment_ref" varchar(100),
	"acknowledgment_date" timestamp with time zone,
	"rejection_reason" text,
	"attachments" jsonb,
	"prepared_by" varchar(255),
	"reviewed_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_risk_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"risk_ref" varchar(50) NOT NULL,
	"risk_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"likelihood_score" integer,
	"impact_score" integer,
	"risk_score" numeric(6, 2),
	"risk_level" varchar(20),
	"risk_owner" varchar(255),
	"mitigation_strategy" text,
	"mitigation_actions" jsonb,
	"residual_likelihood" integer,
	"residual_impact" integer,
	"residual_risk_score" numeric(6, 2),
	"controls" jsonb,
	"review_date" timestamp with time zone,
	"last_assessed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'identified' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acm_sox_financial_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"control_ref" varchar(50) NOT NULL,
	"control_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"control_objective" text,
	"process_area" varchar(255),
	"control_owner" varchar(255),
	"control_frequency" varchar(30),
	"test_procedure" text,
	"test_frequency" varchar(30),
	"last_test_date" timestamp with time zone,
	"next_test_date" timestamp with time zone,
	"test_result" varchar(20),
	"deficiency_level" varchar(30),
	"remediation_plan" text,
	"remediation_due_date" timestamp with time zone,
	"remediation_completed_date" timestamp with time zone,
	"evidence_links" jsonb,
	"risk_rating" varchar(20),
	"key_control" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "acm_ai_risk_detections" ADD CONSTRAINT "acm_ai_risk_detections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_internal_audits" ADD CONSTRAINT "acm_internal_audits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_iso_certification_trackings" ADD CONSTRAINT "acm_iso_certification_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_policy_procedures" ADD CONSTRAINT "acm_policy_procedures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_regulatory_compliance_calendars" ADD CONSTRAINT "acm_regulatory_compliance_calendars_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_regulatory_reporting_submissions" ADD CONSTRAINT "acm_regulatory_reporting_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_risk_registers" ADD CONSTRAINT "acm_risk_registers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acm_sox_financial_controls" ADD CONSTRAINT "acm_sox_financial_controls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "acm_ai_risk_det_tenant_idx" ON "acm_ai_risk_detections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_ai_risk_det_ref_idx" ON "acm_ai_risk_detections" USING btree ("detection_ref");--> statement-breakpoint
CREATE INDEX "acm_ai_risk_det_status_idx" ON "acm_ai_risk_detections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_ai_risk_det_level_idx" ON "acm_ai_risk_detections" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "acm_ai_risk_det_entity_idx" ON "acm_ai_risk_detections" USING btree ("entity_type","entity_ref");--> statement-breakpoint
CREATE INDEX "acm_internal_audits_tenant_idx" ON "acm_internal_audits" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_internal_audits_ref_idx" ON "acm_internal_audits" USING btree ("audit_ref");--> statement-breakpoint
CREATE INDEX "acm_internal_audits_status_idx" ON "acm_internal_audits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_internal_audits_type_idx" ON "acm_internal_audits" USING btree ("audit_type");--> statement-breakpoint
CREATE INDEX "acm_iso_cert_tenant_idx" ON "acm_iso_certification_trackings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_iso_cert_ref_idx" ON "acm_iso_certification_trackings" USING btree ("certification_ref");--> statement-breakpoint
CREATE INDEX "acm_iso_cert_status_idx" ON "acm_iso_certification_trackings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_iso_cert_expiry_idx" ON "acm_iso_certification_trackings" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "acm_policy_procedures_tenant_idx" ON "acm_policy_procedures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_policy_procedures_ref_idx" ON "acm_policy_procedures" USING btree ("policy_ref");--> statement-breakpoint
CREATE INDEX "acm_policy_procedures_status_idx" ON "acm_policy_procedures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_policy_procedures_type_idx" ON "acm_policy_procedures" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "acm_reg_compliance_cal_tenant_idx" ON "acm_regulatory_compliance_calendars" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_reg_compliance_cal_ref_idx" ON "acm_regulatory_compliance_calendars" USING btree ("calendar_ref");--> statement-breakpoint
CREATE INDEX "acm_reg_compliance_cal_status_idx" ON "acm_regulatory_compliance_calendars" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_reg_compliance_cal_due_idx" ON "acm_regulatory_compliance_calendars" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "acm_reg_report_sub_tenant_idx" ON "acm_regulatory_reporting_submissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_reg_report_sub_ref_idx" ON "acm_regulatory_reporting_submissions" USING btree ("submission_ref");--> statement-breakpoint
CREATE INDEX "acm_reg_report_sub_status_idx" ON "acm_regulatory_reporting_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_reg_report_sub_due_idx" ON "acm_regulatory_reporting_submissions" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "acm_risk_registers_tenant_idx" ON "acm_risk_registers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_risk_registers_ref_idx" ON "acm_risk_registers" USING btree ("risk_ref");--> statement-breakpoint
CREATE INDEX "acm_risk_registers_status_idx" ON "acm_risk_registers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_risk_registers_level_idx" ON "acm_risk_registers" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "acm_sox_controls_tenant_idx" ON "acm_sox_financial_controls" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "acm_sox_controls_ref_idx" ON "acm_sox_financial_controls" USING btree ("control_ref");--> statement-breakpoint
CREATE INDEX "acm_sox_controls_status_idx" ON "acm_sox_financial_controls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "acm_sox_controls_type_idx" ON "acm_sox_financial_controls" USING btree ("control_type");