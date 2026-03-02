CREATE TABLE "dgm_booking_screenings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"screening_ref" varchar(50) NOT NULL,
	"booking_ref" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"container_number" varchar(20),
	"un_number" varchar(10) NOT NULL,
	"proper_shipping_name" varchar(500) NOT NULL,
	"imdg_class" varchar(10) NOT NULL,
	"packing_group" varchar(10),
	"gross_weight" numeric(12, 3),
	"net_weight" numeric(12, 3),
	"weight_unit" varchar(5) DEFAULT 'KG',
	"number_of_packages" integer,
	"package_type" varchar(50),
	"marine_pollutant" boolean DEFAULT false,
	"limited_quantity" boolean DEFAULT false,
	"inner_packaging_details" text,
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"screening_result" varchar(20),
	"screening_notes" text,
	"risk_score" numeric(5, 2),
	"validation_errors" jsonb,
	"screened_by_name" varchar(255),
	"screened_at" timestamp with time zone,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgm_chemical_safety_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"safety_data_ref" varchar(50) NOT NULL,
	"chemical_name" varchar(500) NOT NULL,
	"cas_number" varchar(30),
	"un_number" varchar(10),
	"imdg_class" varchar(10),
	"manufacturer" varchar(255),
	"supplier_name" varchar(255),
	"sds_version" varchar(20),
	"sds_date" timestamp with time zone,
	"hazard_identification" text,
	"composition_info" jsonb,
	"first_aid_measures" text,
	"firefighting_measures" text,
	"accidental_release" text,
	"handling_and_storage" text,
	"exposure_controls" text,
	"physical_properties" jsonb,
	"stability_reactivity" text,
	"toxicological_info" text,
	"ecological_info" text,
	"disposal_considerations" text,
	"transport_info" text,
	"regulatory_info" text,
	"sds_document_url" varchar(500),
	"expiry_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgm_emergency_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"procedure_ref" varchar(50) NOT NULL,
	"procedure_name" varchar(255) NOT NULL,
	"procedure_type" varchar(30) NOT NULL,
	"ems_number" varchar(20),
	"mfag_table_number" varchar(20),
	"applicable_classes" jsonb,
	"applicable_un_numbers" jsonb,
	"fire_response" text,
	"spillage_response" text,
	"first_aid_measures" text,
	"personal_protection" text,
	"evacuation_procedure" text,
	"decontamination" text,
	"special_equipment" jsonb,
	"emergency_contacts" jsonb,
	"training_requirements" text,
	"drill_frequency" varchar(30),
	"last_drill_date" timestamp with time zone,
	"next_drill_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgm_imdg_compliance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"compliance_ref" varchar(50) NOT NULL,
	"un_number" varchar(10) NOT NULL,
	"proper_shipping_name" varchar(500) NOT NULL,
	"technical_name" varchar(500),
	"imdg_class" varchar(10) NOT NULL,
	"imdg_subsidiary_risk" varchar(50),
	"packing_group" varchar(10),
	"marine_pollutant" boolean DEFAULT false,
	"ems_number" varchar(20),
	"flash_point" varchar(20),
	"limited_quantity" boolean DEFAULT false,
	"excepted_quantity" boolean DEFAULT false,
	"special_provisions" jsonb,
	"stowage_category" varchar(10),
	"stowage_requirements" jsonb,
	"segregation_group" varchar(50),
	"imdg_code_edition" varchar(20),
	"amendment_number" varchar(20),
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgm_incident_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"incident_ref" varchar(50) NOT NULL,
	"incident_type" varchar(30) NOT NULL,
	"severity_level" varchar(20) NOT NULL,
	"incident_date" timestamp with time zone NOT NULL,
	"location_description" varchar(500) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"container_number" varchar(20),
	"un_number" varchar(10),
	"proper_shipping_name" varchar(500),
	"imdg_class" varchar(10),
	"description" text NOT NULL,
	"immediate_actions" text,
	"casualties" integer DEFAULT 0,
	"injuries" integer DEFAULT 0,
	"environmental_impact" text,
	"property_damage" text,
	"estimated_cost" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"reported_by_name" varchar(255),
	"reported_at" timestamp with time zone,
	"investigator_name" varchar(255),
	"investigation_started" timestamp with time zone,
	"investigation_findings" text,
	"root_cause" text,
	"corrective_actions" jsonb,
	"preventive_measures" jsonb,
	"lessons_learned" text,
	"regulatory_notifications" jsonb,
	"closed_at" timestamp with time zone,
	"closed_by_name" varchar(255),
	"status" varchar(20) DEFAULT 'reported' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgm_manifests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"manifest_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"voyage_number" varchar(50) NOT NULL,
	"imo_number" varchar(20),
	"call_sign" varchar(20),
	"master_name" varchar(255),
	"port_of_loading" varchar(255) NOT NULL,
	"port_of_discharge" varchar(255) NOT NULL,
	"departure_date" timestamp with time zone,
	"arrival_date" timestamp with time zone,
	"total_dg_containers" integer DEFAULT 0,
	"total_dg_weight" numeric(12, 3),
	"weight_unit" varchar(5) DEFAULT 'KG',
	"dg_items" jsonb,
	"stowage_plan" jsonb,
	"compliance_checks" jsonb,
	"submitted_to_authority" varchar(255),
	"submission_date" timestamp with time zone,
	"submission_reference" varchar(100),
	"acknowledged_at" timestamp with time zone,
	"prepared_by_name" varchar(255),
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
CREATE TABLE "dgm_placard_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"placard_ref" varchar(50) NOT NULL,
	"un_number" varchar(10),
	"imdg_class" varchar(10) NOT NULL,
	"subsidiary_risk" varchar(50),
	"placard_type" varchar(30) NOT NULL,
	"label_code" varchar(30),
	"label_description" varchar(255),
	"placement_position" varchar(100),
	"size_requirements" varchar(100),
	"color_specification" varchar(100),
	"symbol_description" text,
	"applicable_to_container" boolean DEFAULT true,
	"applicable_to_vehicle" boolean DEFAULT false,
	"applicable_to_package" boolean DEFAULT true,
	"marine_pollutant_mark" boolean DEFAULT false,
	"elevated_temperature" boolean DEFAULT false,
	"fumigation_warning" boolean DEFAULT false,
	"orientation_arrows" boolean DEFAULT false,
	"imdg_reference" varchar(100),
	"image_url" varchar(500),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgm_segregation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rule_ref" varchar(50) NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"rule_type" varchar(30) NOT NULL,
	"source_class" varchar(10) NOT NULL,
	"target_class" varchar(10) NOT NULL,
	"segregation_level" varchar(30) NOT NULL,
	"stowage_position" varchar(30),
	"stowage_category" varchar(10),
	"on_deck" boolean,
	"under_deck" boolean,
	"away_from_sources" jsonb,
	"minimum_distance" numeric(8, 2),
	"distance_unit" varchar(5) DEFAULT 'M',
	"closed_vs_closed" varchar(30),
	"closed_vs_open" varchar(30),
	"open_vs_open" varchar(30),
	"imdg_reference" varchar(100),
	"special_conditions" jsonb,
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"priority" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dgm_booking_screenings" ADD CONSTRAINT "dgm_booking_screenings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_chemical_safety_data" ADD CONSTRAINT "dgm_chemical_safety_data_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_emergency_procedures" ADD CONSTRAINT "dgm_emergency_procedures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_imdg_compliance" ADD CONSTRAINT "dgm_imdg_compliance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_incident_reports" ADD CONSTRAINT "dgm_incident_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_manifests" ADD CONSTRAINT "dgm_manifests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_placard_requirements" ADD CONSTRAINT "dgm_placard_requirements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgm_segregation_rules" ADD CONSTRAINT "dgm_segregation_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_tenant_idx" ON "dgm_booking_screenings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_booking_screen_ref_tenant_idx" ON "dgm_booking_screenings" USING btree ("tenant_id","screening_ref");--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_booking_idx" ON "dgm_booking_screenings" USING btree ("tenant_id","booking_ref");--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_un_idx" ON "dgm_booking_screenings" USING btree ("tenant_id","un_number");--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_customer_idx" ON "dgm_booking_screenings" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_status_idx" ON "dgm_booking_screenings" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_created_idx" ON "dgm_booking_screenings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_booking_screen_deleted_idx" ON "dgm_booking_screenings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_tenant_idx" ON "dgm_chemical_safety_data" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_chem_safety_ref_tenant_idx" ON "dgm_chemical_safety_data" USING btree ("tenant_id","safety_data_ref");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_chemical_idx" ON "dgm_chemical_safety_data" USING btree ("tenant_id","chemical_name");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_un_idx" ON "dgm_chemical_safety_data" USING btree ("tenant_id","un_number");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_cas_idx" ON "dgm_chemical_safety_data" USING btree ("tenant_id","cas_number");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_status_idx" ON "dgm_chemical_safety_data" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_created_idx" ON "dgm_chemical_safety_data" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_chem_safety_deleted_idx" ON "dgm_chemical_safety_data" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_emerg_proc_tenant_idx" ON "dgm_emergency_procedures" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_emerg_proc_ref_tenant_idx" ON "dgm_emergency_procedures" USING btree ("tenant_id","procedure_ref");--> statement-breakpoint
CREATE INDEX "dgm_emerg_proc_type_idx" ON "dgm_emergency_procedures" USING btree ("tenant_id","procedure_type");--> statement-breakpoint
CREATE INDEX "dgm_emerg_proc_ems_idx" ON "dgm_emergency_procedures" USING btree ("tenant_id","ems_number");--> statement-breakpoint
CREATE INDEX "dgm_emerg_proc_status_idx" ON "dgm_emergency_procedures" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_emerg_proc_created_idx" ON "dgm_emergency_procedures" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_emerg_proc_deleted_idx" ON "dgm_emergency_procedures" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_imdg_compliance_tenant_idx" ON "dgm_imdg_compliance" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_imdg_compliance_ref_tenant_idx" ON "dgm_imdg_compliance" USING btree ("tenant_id","compliance_ref");--> statement-breakpoint
CREATE INDEX "dgm_imdg_compliance_un_idx" ON "dgm_imdg_compliance" USING btree ("tenant_id","un_number");--> statement-breakpoint
CREATE INDEX "dgm_imdg_compliance_class_idx" ON "dgm_imdg_compliance" USING btree ("tenant_id","imdg_class");--> statement-breakpoint
CREATE INDEX "dgm_imdg_compliance_status_idx" ON "dgm_imdg_compliance" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_imdg_compliance_created_idx" ON "dgm_imdg_compliance" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_imdg_compliance_deleted_idx" ON "dgm_imdg_compliance" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_tenant_idx" ON "dgm_incident_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_incident_rpt_ref_tenant_idx" ON "dgm_incident_reports" USING btree ("tenant_id","incident_ref");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_type_idx" ON "dgm_incident_reports" USING btree ("tenant_id","incident_type");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_severity_idx" ON "dgm_incident_reports" USING btree ("tenant_id","severity_level");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_vessel_idx" ON "dgm_incident_reports" USING btree ("tenant_id","vessel_name");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_date_idx" ON "dgm_incident_reports" USING btree ("tenant_id","incident_date");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_status_idx" ON "dgm_incident_reports" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_created_idx" ON "dgm_incident_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_incident_rpt_deleted_idx" ON "dgm_incident_reports" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_manifests_tenant_idx" ON "dgm_manifests" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_manifests_ref_tenant_idx" ON "dgm_manifests" USING btree ("tenant_id","manifest_ref");--> statement-breakpoint
CREATE INDEX "dgm_manifests_vessel_idx" ON "dgm_manifests" USING btree ("tenant_id","vessel_name");--> statement-breakpoint
CREATE INDEX "dgm_manifests_voyage_idx" ON "dgm_manifests" USING btree ("tenant_id","voyage_number");--> statement-breakpoint
CREATE INDEX "dgm_manifests_port_load_idx" ON "dgm_manifests" USING btree ("tenant_id","port_of_loading");--> statement-breakpoint
CREATE INDEX "dgm_manifests_status_idx" ON "dgm_manifests" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_manifests_created_idx" ON "dgm_manifests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_manifests_deleted_idx" ON "dgm_manifests" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_placard_req_tenant_idx" ON "dgm_placard_requirements" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_placard_req_ref_tenant_idx" ON "dgm_placard_requirements" USING btree ("tenant_id","placard_ref");--> statement-breakpoint
CREATE INDEX "dgm_placard_req_class_idx" ON "dgm_placard_requirements" USING btree ("tenant_id","imdg_class");--> statement-breakpoint
CREATE INDEX "dgm_placard_req_type_idx" ON "dgm_placard_requirements" USING btree ("tenant_id","placard_type");--> statement-breakpoint
CREATE INDEX "dgm_placard_req_status_idx" ON "dgm_placard_requirements" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_placard_req_created_idx" ON "dgm_placard_requirements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_placard_req_deleted_idx" ON "dgm_placard_requirements" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_tenant_idx" ON "dgm_segregation_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dgm_seg_rules_ref_tenant_idx" ON "dgm_segregation_rules" USING btree ("tenant_id","rule_ref");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_source_idx" ON "dgm_segregation_rules" USING btree ("tenant_id","source_class");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_target_idx" ON "dgm_segregation_rules" USING btree ("tenant_id","target_class");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_level_idx" ON "dgm_segregation_rules" USING btree ("tenant_id","segregation_level");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_status_idx" ON "dgm_segregation_rules" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_created_idx" ON "dgm_segregation_rules" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dgm_seg_rules_deleted_idx" ON "dgm_segregation_rules" USING btree ("deleted_at");