CREATE TABLE "sim_cargo_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"port_name" varchar(255),
	"terminal_name" varchar(255),
	"cargo_description" text,
	"hs_code" varchar(20),
	"package_type" varchar(50),
	"declared_quantity" integer,
	"surveyed_quantity" integer,
	"declared_weight_kg" numeric(12, 2),
	"surveyed_weight_kg" numeric(12, 2),
	"weight_variance_kg" numeric(12, 2),
	"cargo_condition" varchar(30),
	"damage_description" text,
	"damage_photos" jsonb,
	"surveyor_name" varchar(255),
	"surveyor_company" varchar(255),
	"surveyor_license" varchar(50),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"client_name" varchar(255),
	"client_ref" varchar(50),
	"findings" jsonb,
	"recommendations" text,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_classification_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"classification_society" varchar(255) NOT NULL,
	"class_notation" varchar(100),
	"surveyor_name" varchar(255),
	"surveyor_id" varchar(50),
	"survey_location" varchar(255),
	"certificate_type" varchar(100),
	"certificate_number" varchar(100),
	"certificate_issued_at" timestamp with time zone,
	"certificate_expires_at" timestamp with time zone,
	"window_start" timestamp with time zone,
	"window_end" timestamp with time zone,
	"conditions_of_class" jsonb,
	"recommendations" jsonb,
	"findings_count" integer DEFAULT 0,
	"non_conformities" jsonb,
	"rectification_deadline" timestamp with time zone,
	"rectified_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"overall_result" varchar(20),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_container_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_type" varchar(30),
	"container_size_iso" varchar(10),
	"owner_operator" varchar(255),
	"depot_name" varchar(255),
	"depot_location" varchar(255),
	"overall_condition" varchar(20),
	"structural_condition" varchar(20),
	"floor_condition" varchar(20),
	"roof_condition" varchar(20),
	"door_condition" varchar(20),
	"paint_condition" varchar(20),
	"csc_plate_valid" boolean,
	"csc_expiry_date" timestamp with time zone,
	"mnr_required" boolean DEFAULT false,
	"mnr_estimate_cost" numeric(12, 2),
	"mnr_currency" varchar(3),
	"mnr_approved" boolean,
	"mnr_completed_at" timestamp with time zone,
	"damage_details" jsonb,
	"photos" jsonb,
	"surveyor_name" varchar(255),
	"surveyor_company" varchar(255),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_draft_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"voyage_number" varchar(50),
	"port_name" varchar(255),
	"berth_name" varchar(100),
	"cargo_type" varchar(100),
	"draft_fore" numeric(8, 3),
	"draft_aft" numeric(8, 3),
	"draft_mid_port" numeric(8, 3),
	"draft_mid_starboard" numeric(8, 3),
	"mean_draft" numeric(8, 3),
	"trim" numeric(8, 3),
	"displacement" numeric(14, 2),
	"ballast_weight" numeric(14, 2),
	"constants_weight" numeric(14, 2),
	"fresh_water_weight" numeric(14, 2),
	"fuel_weight" numeric(14, 2),
	"net_cargo_weight" numeric(14, 2),
	"water_density" numeric(6, 4),
	"water_temp" numeric(5, 2),
	"surveyor_name" varchar(255),
	"surveyor_company" varchar(255),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"calculations" jsonb,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_hatch_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"inspection_ref" varchar(50) NOT NULL,
	"inspection_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"voyage_number" varchar(50),
	"port_name" varchar(255),
	"hold_number" varchar(20),
	"hatch_cover_type" varchar(50),
	"cleanliness" varchar(20),
	"dryness" varchar(20),
	"odor_free" boolean,
	"previous_cargo" varchar(255),
	"residue_found" boolean,
	"residue_description" text,
	"hatch_cover_seal" varchar(20),
	"water_tightness" varchar(20),
	"ventilation_ok" boolean,
	"bilges_clean" boolean,
	"ladder_condition" varchar(20),
	"lighting_ok" boolean,
	"cargo_fitness" varchar(20),
	"deficiencies" jsonb,
	"photos" jsonb,
	"inspector_name" varchar(255),
	"inspector_company" varchar(255),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_hire_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"charterer_name" varchar(255),
	"owner_name" varchar(255),
	"charter_party_ref" varchar(50),
	"port_name" varchar(255),
	"hull_condition" varchar(20),
	"deck_condition" varchar(20),
	"engine_condition" varchar(20),
	"accommodation_condition" varchar(20),
	"safety_equipment_ok" boolean,
	"bunker_rob_fuel" numeric(12, 2),
	"bunker_rob_diesel" numeric(12, 2),
	"bunker_rob_lube_oil" numeric(12, 2),
	"fresh_water_rob" numeric(12, 2),
	"constants_weight" numeric(12, 2),
	"deficiencies" jsonb,
	"previous_damages" jsonb,
	"photos" jsonb,
	"surveyor_name" varchar(255),
	"surveyor_company" varchar(255),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"delivery_date" timestamp with time zone,
	"redelivery_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_reefer_pti_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(50) NOT NULL,
	"survey_type" varchar(30) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_type" varchar(30),
	"unit_manufacturer" varchar(100),
	"unit_model" varchar(100),
	"unit_serial_number" varchar(50),
	"depot_name" varchar(255),
	"depot_location" varchar(255),
	"set_point_temp" numeric(6, 2),
	"supply_air_temp" numeric(6, 2),
	"return_air_temp" numeric(6, 2),
	"ambient_temp" numeric(6, 2),
	"humidity_percent" numeric(5, 2),
	"vent_setting" varchar(20),
	"defrost_ok" boolean,
	"compressor_ok" boolean,
	"condenser_ok" boolean,
	"evaporator_ok" boolean,
	"controller_ok" boolean,
	"gasket_ok" boolean,
	"power_supply_ok" boolean,
	"data_logger_downloaded" boolean,
	"overall_result" varchar(20),
	"defects" jsonb,
	"photos" jsonb,
	"technician_name" varchar(255),
	"technician_company" varchar(255),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"next_pti_due" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sim_survey_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"source_module" varchar(50),
	"source_survey_ref" varchar(50),
	"title" varchar(500) NOT NULL,
	"vessel_name" varchar(255),
	"container_number" varchar(20),
	"surveyor_name" varchar(255),
	"surveyor_company" varchar(255),
	"survey_date" timestamp with time zone,
	"report_date" timestamp with time zone,
	"document_url" varchar(500),
	"document_format" varchar(20),
	"file_size_bytes" integer,
	"summary" text,
	"findings" jsonb,
	"recommendations" jsonb,
	"attachments" jsonb,
	"retention_years" integer,
	"expires_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"approved_by" varchar(255),
	"approved_at" timestamp with time zone,
	"tags" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sim_cargo_surveys" ADD CONSTRAINT "sim_cargo_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_classification_surveys" ADD CONSTRAINT "sim_classification_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_container_surveys" ADD CONSTRAINT "sim_container_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_draft_surveys" ADD CONSTRAINT "sim_draft_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_hatch_inspections" ADD CONSTRAINT "sim_hatch_inspections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_hire_surveys" ADD CONSTRAINT "sim_hire_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_reefer_pti_surveys" ADD CONSTRAINT "sim_reefer_pti_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sim_survey_reports" ADD CONSTRAINT "sim_survey_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sim_cargo_survey_tenant_idx" ON "sim_cargo_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_cargo_survey_ref_idx" ON "sim_cargo_surveys" USING btree ("survey_ref");--> statement-breakpoint
CREATE INDEX "sim_cargo_survey_status_idx" ON "sim_cargo_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_cargo_survey_type_idx" ON "sim_cargo_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "sim_cargo_survey_vessel_idx" ON "sim_cargo_surveys" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "sim_cargo_survey_deleted_idx" ON "sim_cargo_surveys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_class_survey_tenant_idx" ON "sim_classification_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_class_survey_ref_idx" ON "sim_classification_surveys" USING btree ("survey_ref");--> statement-breakpoint
CREATE INDEX "sim_class_survey_status_idx" ON "sim_classification_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_class_survey_vessel_idx" ON "sim_classification_surveys" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "sim_class_survey_type_idx" ON "sim_classification_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "sim_class_survey_society_idx" ON "sim_classification_surveys" USING btree ("classification_society");--> statement-breakpoint
CREATE INDEX "sim_class_survey_deleted_idx" ON "sim_classification_surveys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_container_surv_tenant_idx" ON "sim_container_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_container_surv_ref_idx" ON "sim_container_surveys" USING btree ("survey_ref");--> statement-breakpoint
CREATE INDEX "sim_container_surv_status_idx" ON "sim_container_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_container_surv_cntr_idx" ON "sim_container_surveys" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "sim_container_surv_type_idx" ON "sim_container_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "sim_container_surv_deleted_idx" ON "sim_container_surveys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_draft_survey_tenant_idx" ON "sim_draft_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_draft_survey_ref_idx" ON "sim_draft_surveys" USING btree ("survey_ref");--> statement-breakpoint
CREATE INDEX "sim_draft_survey_status_idx" ON "sim_draft_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_draft_survey_vessel_idx" ON "sim_draft_surveys" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "sim_draft_survey_type_idx" ON "sim_draft_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "sim_draft_survey_deleted_idx" ON "sim_draft_surveys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_hatch_insp_tenant_idx" ON "sim_hatch_inspections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_hatch_insp_ref_idx" ON "sim_hatch_inspections" USING btree ("inspection_ref");--> statement-breakpoint
CREATE INDEX "sim_hatch_insp_status_idx" ON "sim_hatch_inspections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_hatch_insp_vessel_idx" ON "sim_hatch_inspections" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "sim_hatch_insp_type_idx" ON "sim_hatch_inspections" USING btree ("inspection_type");--> statement-breakpoint
CREATE INDEX "sim_hatch_insp_deleted_idx" ON "sim_hatch_inspections" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_hire_survey_tenant_idx" ON "sim_hire_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_hire_survey_ref_idx" ON "sim_hire_surveys" USING btree ("survey_ref");--> statement-breakpoint
CREATE INDEX "sim_hire_survey_status_idx" ON "sim_hire_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_hire_survey_vessel_idx" ON "sim_hire_surveys" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "sim_hire_survey_type_idx" ON "sim_hire_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "sim_hire_survey_deleted_idx" ON "sim_hire_surveys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_reefer_pti_tenant_idx" ON "sim_reefer_pti_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_reefer_pti_ref_idx" ON "sim_reefer_pti_surveys" USING btree ("survey_ref");--> statement-breakpoint
CREATE INDEX "sim_reefer_pti_status_idx" ON "sim_reefer_pti_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_reefer_pti_cntr_idx" ON "sim_reefer_pti_surveys" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "sim_reefer_pti_type_idx" ON "sim_reefer_pti_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "sim_reefer_pti_deleted_idx" ON "sim_reefer_pti_surveys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sim_survey_report_tenant_idx" ON "sim_survey_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sim_survey_report_ref_idx" ON "sim_survey_reports" USING btree ("report_ref");--> statement-breakpoint
CREATE INDEX "sim_survey_report_status_idx" ON "sim_survey_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sim_survey_report_type_idx" ON "sim_survey_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "sim_survey_report_vessel_idx" ON "sim_survey_reports" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "sim_survey_report_source_idx" ON "sim_survey_reports" USING btree ("source_survey_ref");--> statement-breakpoint
CREATE INDEX "sim_survey_report_deleted_idx" ON "sim_survey_reports" USING btree ("deleted_at");