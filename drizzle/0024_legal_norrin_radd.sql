CREATE TABLE "vtm_compliance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"compliance_type" varchar(30) NOT NULL,
	"certificate_name" varchar(255),
	"certificate_number" varchar(100),
	"issuing_authority" varchar(255),
	"issued_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"audit_date" timestamp with time zone,
	"auditor_name" varchar(255),
	"audit_findings" jsonb,
	"non_conformities" integer DEFAULT 0 NOT NULL,
	"major_nc" integer DEFAULT 0 NOT NULL,
	"minor_nc" integer DEFAULT 0 NOT NULL,
	"observations" integer DEFAULT 0 NOT NULL,
	"corrective_actions" jsonb,
	"closure_deadline" timestamp with time zone,
	"last_inspection_date" timestamp with time zone,
	"next_inspection_date" timestamp with time zone,
	"document_refs" jsonb,
	"status" varchar(20) DEFAULT 'valid' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_defect_repairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"defect_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"equipment_code" varchar(50),
	"equipment_name" varchar(255),
	"defect_category" varchar(30) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"reported_date" timestamp with time zone NOT NULL,
	"reported_by_name" varchar(255),
	"description" text NOT NULL,
	"root_cause" text,
	"repair_method" text,
	"estimated_cost" integer,
	"actual_cost" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"repair_start_date" timestamp with time zone,
	"repair_end_date" timestamp with time zone,
	"repaired_by_name" varchar(255),
	"class_notification_required" boolean DEFAULT false,
	"class_notified" boolean DEFAULT false,
	"spares_used" jsonb,
	"photos" jsonb,
	"status" varchar(20) DEFAULT 'reported' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_dry_dock_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"dock_yard_name" varchar(255) NOT NULL,
	"dock_yard_location" varchar(255),
	"dock_yard_country" varchar(100),
	"planned_start_date" timestamp with time zone NOT NULL,
	"planned_end_date" timestamp with time zone NOT NULL,
	"actual_start_date" timestamp with time zone,
	"actual_end_date" timestamp with time zone,
	"scope" text,
	"specifications" jsonb,
	"estimated_cost" integer DEFAULT 0 NOT NULL,
	"actual_cost" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"quotations" jsonb,
	"selected_contractor" varchar(255),
	"class_name" varchar(100),
	"class_approval" boolean DEFAULT false,
	"project_manager_name" varchar(255),
	"work_items" jsonb,
	"status" varchar(20) DEFAULT 'planning' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_planned_maintenance_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"task_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"equipment_code" varchar(50) NOT NULL,
	"equipment_name" varchar(255) NOT NULL,
	"component_name" varchar(255),
	"maintenance_type" varchar(30) NOT NULL,
	"interval_type" varchar(30) NOT NULL,
	"interval_value" integer NOT NULL,
	"last_done_date" timestamp with time zone,
	"last_done_hours" integer,
	"next_due_date" timestamp with time zone,
	"next_due_hours" integer,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"assigned_to" uuid,
	"assigned_to_name" varchar(255),
	"department" varchar(100),
	"estimated_hours" integer,
	"actual_hours" integer,
	"spare_parts" jsonb,
	"instructions" text,
	"completed_at" timestamp with time zone,
	"completed_by_name" varchar(255),
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_predictive_maintenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prediction_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"equipment_code" varchar(50) NOT NULL,
	"equipment_name" varchar(255) NOT NULL,
	"model_type" varchar(30) NOT NULL,
	"input_parameters" jsonb,
	"model_version" varchar(50),
	"prediction_date" timestamp with time zone NOT NULL,
	"predicted_failure_date" timestamp with time zone,
	"confidence_score" integer,
	"risk_level" varchar(20) DEFAULT 'medium' NOT NULL,
	"current_condition" text,
	"degradation_rate" integer,
	"recommendations" jsonb,
	"ai_insights" text,
	"alerts_generated" integer DEFAULT 0 NOT NULL,
	"alerts_sent" boolean DEFAULT false,
	"action_taken" text,
	"action_date" timestamp with time zone,
	"accuracy" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_spare_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"part_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255),
	"part_number" varchar(100) NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(30) NOT NULL,
	"manufacturer" varchar(255),
	"model_number" varchar(100),
	"unit_of_measure" varchar(30),
	"minimum_stock" integer DEFAULT 0 NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"last_order_date" timestamp with time zone,
	"last_order_quantity" integer,
	"last_unit_price" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"storage_location" varchar(255),
	"critical_part" boolean DEFAULT false,
	"lead_time_days" integer,
	"preferred_supplier_name" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_survey_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"survey_authority" varchar(255) NOT NULL,
	"surveyor_name" varchar(255),
	"due_date" timestamp with time zone NOT NULL,
	"window_start_date" timestamp with time zone,
	"window_end_date" timestamp with time zone,
	"survey_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"certificate_name" varchar(255),
	"certificate_number" varchar(100),
	"issued_by" varchar(255),
	"findings" jsonb,
	"conditions" jsonb,
	"remediation_required" boolean DEFAULT false,
	"remediation_deadline" timestamp with time zone,
	"status" varchar(20) DEFAULT 'upcoming' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vtm_technical_procurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"procurement_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"request_type" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"line_items" jsonb,
	"requested_by_name" varchar(255),
	"department" varchar(100),
	"urgency" varchar(20) DEFAULT 'routine' NOT NULL,
	"estimated_budget" integer DEFAULT 0 NOT NULL,
	"approved_budget" integer,
	"actual_cost" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"supplier_name" varchar(255),
	"quotations" jsonb,
	"purchase_order_ref" varchar(100),
	"delivery_date" timestamp with time zone,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vtm_compliance_records" ADD CONSTRAINT "vtm_compliance_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_defect_repairs" ADD CONSTRAINT "vtm_defect_repairs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_dry_dock_plans" ADD CONSTRAINT "vtm_dry_dock_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_planned_maintenance_tasks" ADD CONSTRAINT "vtm_planned_maintenance_tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_predictive_maintenance" ADD CONSTRAINT "vtm_predictive_maintenance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_spare_parts" ADD CONSTRAINT "vtm_spare_parts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_survey_trackings" ADD CONSTRAINT "vtm_survey_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vtm_technical_procurements" ADD CONSTRAINT "vtm_technical_procurements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vtm_cr_tenant_id_idx" ON "vtm_compliance_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_cr_tenant_ref_idx" ON "vtm_compliance_records" USING btree ("tenant_id","record_ref");--> statement-breakpoint
CREATE INDEX "vtm_cr_vessel_id_idx" ON "vtm_compliance_records" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_cr_vessel_name_idx" ON "vtm_compliance_records" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_cr_compliance_type_idx" ON "vtm_compliance_records" USING btree ("compliance_type");--> statement-breakpoint
CREATE INDEX "vtm_cr_expiry_date_idx" ON "vtm_compliance_records" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "vtm_cr_next_inspection_idx" ON "vtm_compliance_records" USING btree ("next_inspection_date");--> statement-breakpoint
CREATE INDEX "vtm_cr_status_idx" ON "vtm_compliance_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_cr_created_at_idx" ON "vtm_compliance_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_dr_tenant_id_idx" ON "vtm_defect_repairs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_dr_tenant_ref_idx" ON "vtm_defect_repairs" USING btree ("tenant_id","defect_ref");--> statement-breakpoint
CREATE INDEX "vtm_dr_vessel_id_idx" ON "vtm_defect_repairs" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_dr_vessel_name_idx" ON "vtm_defect_repairs" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_dr_equipment_code_idx" ON "vtm_defect_repairs" USING btree ("equipment_code");--> statement-breakpoint
CREATE INDEX "vtm_dr_defect_category_idx" ON "vtm_defect_repairs" USING btree ("defect_category");--> statement-breakpoint
CREATE INDEX "vtm_dr_severity_idx" ON "vtm_defect_repairs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "vtm_dr_reported_date_idx" ON "vtm_defect_repairs" USING btree ("reported_date");--> statement-breakpoint
CREATE INDEX "vtm_dr_status_idx" ON "vtm_defect_repairs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_dr_created_at_idx" ON "vtm_defect_repairs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_ddp_tenant_id_idx" ON "vtm_dry_dock_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_ddp_tenant_ref_idx" ON "vtm_dry_dock_plans" USING btree ("tenant_id","plan_ref");--> statement-breakpoint
CREATE INDEX "vtm_ddp_vessel_id_idx" ON "vtm_dry_dock_plans" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_ddp_vessel_name_idx" ON "vtm_dry_dock_plans" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_ddp_planned_start_idx" ON "vtm_dry_dock_plans" USING btree ("planned_start_date");--> statement-breakpoint
CREATE INDEX "vtm_ddp_planned_end_idx" ON "vtm_dry_dock_plans" USING btree ("planned_end_date");--> statement-breakpoint
CREATE INDEX "vtm_ddp_status_idx" ON "vtm_dry_dock_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_ddp_created_at_idx" ON "vtm_dry_dock_plans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_pmt_tenant_id_idx" ON "vtm_planned_maintenance_tasks" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_pmt_tenant_ref_idx" ON "vtm_planned_maintenance_tasks" USING btree ("tenant_id","task_ref");--> statement-breakpoint
CREATE INDEX "vtm_pmt_vessel_id_idx" ON "vtm_planned_maintenance_tasks" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_pmt_vessel_name_idx" ON "vtm_planned_maintenance_tasks" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_pmt_equipment_code_idx" ON "vtm_planned_maintenance_tasks" USING btree ("equipment_code");--> statement-breakpoint
CREATE INDEX "vtm_pmt_maintenance_type_idx" ON "vtm_planned_maintenance_tasks" USING btree ("maintenance_type");--> statement-breakpoint
CREATE INDEX "vtm_pmt_next_due_date_idx" ON "vtm_planned_maintenance_tasks" USING btree ("next_due_date");--> statement-breakpoint
CREATE INDEX "vtm_pmt_priority_idx" ON "vtm_planned_maintenance_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "vtm_pmt_status_idx" ON "vtm_planned_maintenance_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_pmt_created_at_idx" ON "vtm_planned_maintenance_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_pm_tenant_id_idx" ON "vtm_predictive_maintenance" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_pm_tenant_ref_idx" ON "vtm_predictive_maintenance" USING btree ("tenant_id","prediction_ref");--> statement-breakpoint
CREATE INDEX "vtm_pm_vessel_id_idx" ON "vtm_predictive_maintenance" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_pm_vessel_name_idx" ON "vtm_predictive_maintenance" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_pm_equipment_code_idx" ON "vtm_predictive_maintenance" USING btree ("equipment_code");--> statement-breakpoint
CREATE INDEX "vtm_pm_model_type_idx" ON "vtm_predictive_maintenance" USING btree ("model_type");--> statement-breakpoint
CREATE INDEX "vtm_pm_prediction_date_idx" ON "vtm_predictive_maintenance" USING btree ("prediction_date");--> statement-breakpoint
CREATE INDEX "vtm_pm_risk_level_idx" ON "vtm_predictive_maintenance" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "vtm_pm_status_idx" ON "vtm_predictive_maintenance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_pm_created_at_idx" ON "vtm_predictive_maintenance" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_sp_tenant_id_idx" ON "vtm_spare_parts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_sp_tenant_ref_idx" ON "vtm_spare_parts" USING btree ("tenant_id","part_ref");--> statement-breakpoint
CREATE INDEX "vtm_sp_vessel_id_idx" ON "vtm_spare_parts" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_sp_part_number_idx" ON "vtm_spare_parts" USING btree ("part_number");--> statement-breakpoint
CREATE INDEX "vtm_sp_part_name_idx" ON "vtm_spare_parts" USING btree ("part_name");--> statement-breakpoint
CREATE INDEX "vtm_sp_category_idx" ON "vtm_spare_parts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "vtm_sp_manufacturer_idx" ON "vtm_spare_parts" USING btree ("manufacturer");--> statement-breakpoint
CREATE INDEX "vtm_sp_critical_part_idx" ON "vtm_spare_parts" USING btree ("critical_part");--> statement-breakpoint
CREATE INDEX "vtm_sp_status_idx" ON "vtm_spare_parts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_sp_created_at_idx" ON "vtm_spare_parts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_st_tenant_id_idx" ON "vtm_survey_trackings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_st_tenant_ref_idx" ON "vtm_survey_trackings" USING btree ("tenant_id","survey_ref");--> statement-breakpoint
CREATE INDEX "vtm_st_vessel_id_idx" ON "vtm_survey_trackings" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_st_vessel_name_idx" ON "vtm_survey_trackings" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_st_survey_type_idx" ON "vtm_survey_trackings" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "vtm_st_due_date_idx" ON "vtm_survey_trackings" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "vtm_st_expiry_date_idx" ON "vtm_survey_trackings" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "vtm_st_status_idx" ON "vtm_survey_trackings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_st_created_at_idx" ON "vtm_survey_trackings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vtm_tp_tenant_id_idx" ON "vtm_technical_procurements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vtm_tp_tenant_ref_idx" ON "vtm_technical_procurements" USING btree ("tenant_id","procurement_ref");--> statement-breakpoint
CREATE INDEX "vtm_tp_vessel_id_idx" ON "vtm_technical_procurements" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "vtm_tp_vessel_name_idx" ON "vtm_technical_procurements" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "vtm_tp_request_type_idx" ON "vtm_technical_procurements" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "vtm_tp_urgency_idx" ON "vtm_technical_procurements" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "vtm_tp_delivery_date_idx" ON "vtm_technical_procurements" USING btree ("delivery_date");--> statement-breakpoint
CREATE INDEX "vtm_tp_status_idx" ON "vtm_technical_procurements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vtm_tp_created_at_idx" ON "vtm_technical_procurements" USING btree ("created_at");