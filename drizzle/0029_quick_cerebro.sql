CREATE TABLE "rcm_breakdown_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"breakdown_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"booking_ref" varchar(50),
	"breakdown_type" varchar(30) NOT NULL,
	"severity_level" varchar(20) NOT NULL,
	"reported_at" timestamp with time zone NOT NULL,
	"location_description" varchar(500),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"fault_description" text NOT NULL,
	"fault_code" varchar(30),
	"last_known_temp_c" numeric(6, 2),
	"cargo_at_risk" boolean DEFAULT false,
	"commodity_name" varchar(255),
	"immediate_action" text,
	"technician_name" varchar(255),
	"response_started_at" timestamp with time zone,
	"repair_description" text,
	"parts_used" jsonb,
	"resolved_at" timestamp with time zone,
	"total_downtime_minutes" integer,
	"repair_cost" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"container_swapped" boolean DEFAULT false,
	"swapped_to_container" varchar(20),
	"status" varchar(20) DEFAULT 'reported' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_claim_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"booking_ref" varchar(50),
	"customer_name" varchar(255),
	"commodity_name" varchar(255),
	"analysis_type" varchar(30) NOT NULL,
	"risk_level" varchar(20) NOT NULL,
	"risk_score" numeric(5, 2),
	"temp_exceedance_count" integer DEFAULT 0,
	"total_exceedance_minutes" integer DEFAULT 0,
	"max_deviation_c" numeric(6, 2),
	"claim_probability" numeric(5, 2),
	"estimated_claim_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"preventive_actions" jsonb,
	"ai_recommendations" text,
	"model_version" varchar(50),
	"confidence_score" numeric(5, 2),
	"actual_claim_filed" boolean DEFAULT false,
	"actual_claim_amount" numeric(12, 2),
	"prediction_accuracy" numeric(5, 2),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_cold_chain_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_ref" varchar(50) NOT NULL,
	"document_type" varchar(30) NOT NULL,
	"container_number" varchar(20),
	"booking_ref" varchar(50),
	"customer_name" varchar(255),
	"commodity_name" varchar(255),
	"origin_country" varchar(100),
	"destination_country" varchar(100),
	"phytosanitary_cert" varchar(100),
	"health_cert" varchar(100),
	"fumigation_cert" varchar(100),
	"temperature_log_url" varchar(500),
	"compliance_standard" varchar(100),
	"regulatory_body" varchar(255),
	"inspection_result" varchar(20),
	"inspection_date" timestamp with time zone,
	"inspector_name" varchar(255),
	"expiry_date" timestamp with time zone,
	"document_url" varchar(500),
	"verified_by_name" varchar(255),
	"verified_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_power_management" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"power_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"location_name" varchar(255) NOT NULL,
	"location_type" varchar(30) NOT NULL,
	"plug_type" varchar(30),
	"voltage" varchar(20),
	"amperage" varchar(20),
	"bay_position" varchar(30),
	"tier_position" varchar(30),
	"plugged_in_at" timestamp with time zone,
	"unplugged_at" timestamp with time zone,
	"total_plug_hours" numeric(8, 2),
	"power_consumption_kwh" numeric(10, 2),
	"cost_per_kwh" numeric(8, 4),
	"total_cost" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"power_interruptions" integer DEFAULT 0,
	"last_interruption_at" timestamp with time zone,
	"genset_backup" boolean DEFAULT false,
	"monitored_by_name" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_pti_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"inspection_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"booking_ref" varchar(50),
	"inspection_type" varchar(30) NOT NULL,
	"inspection_date" timestamp with time zone NOT NULL,
	"depot_name" varchar(255),
	"depot_location" varchar(255),
	"inspector_name" varchar(255),
	"set_point_temp_c" numeric(6, 2),
	"achieved_temp_c" numeric(6, 2),
	"cooldown_minutes" integer,
	"compressor_ok" boolean,
	"evaporator_ok" boolean,
	"condenser_ok" boolean,
	"controller_ok" boolean,
	"door_seals_ok" boolean,
	"drain_holes_ok" boolean,
	"power_cable_ok" boolean,
	"cleanliness_ok" boolean,
	"overall_result" varchar(20),
	"defects_found" jsonb,
	"repairs_required" text,
	"certificate_number" varchar(50),
	"certificate_expiry" timestamp with time zone,
	"photos_urls" jsonb,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_reefer_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_ref" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"container_number" varchar(20),
	"container_size" varchar(10) NOT NULL,
	"container_type" varchar(30) NOT NULL,
	"commodity_name" varchar(255) NOT NULL,
	"commodity_code" varchar(50),
	"required_temp_c" numeric(6, 2) NOT NULL,
	"required_humidity" numeric(5, 2),
	"ventilation_setting" varchar(50),
	"atmosphere_control" varchar(30),
	"o2_level" numeric(5, 2),
	"co2_level" numeric(5, 2),
	"origin_port" varchar(255) NOT NULL,
	"destination_port" varchar(255) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"load_date" timestamp with time zone,
	"discharge_date" timestamp with time zone,
	"transit_days" integer,
	"special_instructions" text,
	"acceptance_checklist" jsonb,
	"accepted_by_name" varchar(255),
	"accepted_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_temp_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"alert_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"booking_ref" varchar(50),
	"alert_type" varchar(30) NOT NULL,
	"alert_severity" varchar(20) NOT NULL,
	"set_point_temp_c" numeric(6, 2) NOT NULL,
	"actual_temp_c" numeric(6, 2) NOT NULL,
	"deviation_c" numeric(6, 2),
	"threshold_c" numeric(6, 2),
	"exceedance_duration_minutes" integer,
	"triggered_at" timestamp with time zone NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by_name" varchar(255),
	"escalation_level" integer DEFAULT 0,
	"escalated_to_name" varchar(255),
	"escalated_at" timestamp with time zone,
	"correction_action" text,
	"resolved_at" timestamp with time zone,
	"resolved_by_name" varchar(255),
	"cargo_impact" varchar(30),
	"notifications_sent" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rcm_temp_monitorings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"monitoring_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"booking_ref" varchar(50),
	"sensor_id" varchar(50),
	"sensor_type" varchar(30),
	"set_point_temp_c" numeric(6, 2) NOT NULL,
	"actual_temp_c" numeric(6, 2),
	"set_point_humidity" numeric(5, 2),
	"actual_humidity" numeric(5, 2),
	"supply_air_temp_c" numeric(6, 2),
	"return_air_temp_c" numeric(6, 2),
	"o2_level" numeric(5, 2),
	"co2_level" numeric(5, 2),
	"power_status" varchar(20),
	"compressor_status" varchar(20),
	"defrost_cycle_active" boolean DEFAULT false,
	"reading_timestamp" timestamp with time zone NOT NULL,
	"location_description" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"alert_triggered" boolean DEFAULT false,
	"alert_type" varchar(30),
	"data_source" varchar(30),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rcm_breakdown_responses" ADD CONSTRAINT "rcm_breakdown_responses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_claim_analytics" ADD CONSTRAINT "rcm_claim_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_cold_chain_docs" ADD CONSTRAINT "rcm_cold_chain_docs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_power_management" ADD CONSTRAINT "rcm_power_management_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_pti_inspections" ADD CONSTRAINT "rcm_pti_inspections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_reefer_bookings" ADD CONSTRAINT "rcm_reefer_bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_temp_alerts" ADD CONSTRAINT "rcm_temp_alerts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rcm_temp_monitorings" ADD CONSTRAINT "rcm_temp_monitorings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rcm_breakdown_tenant_idx" ON "rcm_breakdown_responses" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_breakdown_ref_tenant_idx" ON "rcm_breakdown_responses" USING btree ("tenant_id","breakdown_ref");--> statement-breakpoint
CREATE INDEX "rcm_breakdown_container_idx" ON "rcm_breakdown_responses" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_breakdown_type_idx" ON "rcm_breakdown_responses" USING btree ("tenant_id","breakdown_type");--> statement-breakpoint
CREATE INDEX "rcm_breakdown_severity_idx" ON "rcm_breakdown_responses" USING btree ("tenant_id","severity_level");--> statement-breakpoint
CREATE INDEX "rcm_breakdown_status_idx" ON "rcm_breakdown_responses" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_breakdown_created_idx" ON "rcm_breakdown_responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_breakdown_deleted_idx" ON "rcm_breakdown_responses" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_tenant_idx" ON "rcm_claim_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_claim_analytics_ref_tenant_idx" ON "rcm_claim_analytics" USING btree ("tenant_id","analytics_ref");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_container_idx" ON "rcm_claim_analytics" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_customer_idx" ON "rcm_claim_analytics" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_risk_idx" ON "rcm_claim_analytics" USING btree ("tenant_id","risk_level");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_type_idx" ON "rcm_claim_analytics" USING btree ("tenant_id","analysis_type");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_status_idx" ON "rcm_claim_analytics" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_created_idx" ON "rcm_claim_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_claim_analytics_deleted_idx" ON "rcm_claim_analytics" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_tenant_idx" ON "rcm_cold_chain_docs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_cold_chain_ref_tenant_idx" ON "rcm_cold_chain_docs" USING btree ("tenant_id","document_ref");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_type_idx" ON "rcm_cold_chain_docs" USING btree ("tenant_id","document_type");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_container_idx" ON "rcm_cold_chain_docs" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_customer_idx" ON "rcm_cold_chain_docs" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_status_idx" ON "rcm_cold_chain_docs" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_created_idx" ON "rcm_cold_chain_docs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_cold_chain_deleted_idx" ON "rcm_cold_chain_docs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_tenant_idx" ON "rcm_power_management" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_power_mgmt_ref_tenant_idx" ON "rcm_power_management" USING btree ("tenant_id","power_ref");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_container_idx" ON "rcm_power_management" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_location_idx" ON "rcm_power_management" USING btree ("tenant_id","location_name");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_type_idx" ON "rcm_power_management" USING btree ("tenant_id","location_type");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_status_idx" ON "rcm_power_management" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_created_idx" ON "rcm_power_management" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_power_mgmt_deleted_idx" ON "rcm_power_management" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_tenant_idx" ON "rcm_pti_inspections" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_pti_insp_ref_tenant_idx" ON "rcm_pti_inspections" USING btree ("tenant_id","inspection_ref");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_container_idx" ON "rcm_pti_inspections" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_type_idx" ON "rcm_pti_inspections" USING btree ("tenant_id","inspection_type");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_date_idx" ON "rcm_pti_inspections" USING btree ("tenant_id","inspection_date");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_result_idx" ON "rcm_pti_inspections" USING btree ("tenant_id","overall_result");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_status_idx" ON "rcm_pti_inspections" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_created_idx" ON "rcm_pti_inspections" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_pti_insp_deleted_idx" ON "rcm_pti_inspections" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_tenant_idx" ON "rcm_reefer_bookings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_reefer_book_ref_tenant_idx" ON "rcm_reefer_bookings" USING btree ("tenant_id","booking_ref");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_customer_idx" ON "rcm_reefer_bookings" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_container_idx" ON "rcm_reefer_bookings" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_commodity_idx" ON "rcm_reefer_bookings" USING btree ("tenant_id","commodity_name");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_status_idx" ON "rcm_reefer_bookings" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_created_idx" ON "rcm_reefer_bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_reefer_book_deleted_idx" ON "rcm_reefer_bookings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_tenant_idx" ON "rcm_temp_alerts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_temp_alert_ref_tenant_idx" ON "rcm_temp_alerts" USING btree ("tenant_id","alert_ref");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_container_idx" ON "rcm_temp_alerts" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_type_idx" ON "rcm_temp_alerts" USING btree ("tenant_id","alert_type");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_severity_idx" ON "rcm_temp_alerts" USING btree ("tenant_id","alert_severity");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_triggered_idx" ON "rcm_temp_alerts" USING btree ("tenant_id","triggered_at");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_status_idx" ON "rcm_temp_alerts" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_created_idx" ON "rcm_temp_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_temp_alert_deleted_idx" ON "rcm_temp_alerts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_tenant_idx" ON "rcm_temp_monitorings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rcm_temp_mon_ref_tenant_idx" ON "rcm_temp_monitorings" USING btree ("tenant_id","monitoring_ref");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_container_idx" ON "rcm_temp_monitorings" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_sensor_idx" ON "rcm_temp_monitorings" USING btree ("tenant_id","sensor_id");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_reading_idx" ON "rcm_temp_monitorings" USING btree ("tenant_id","reading_timestamp");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_status_idx" ON "rcm_temp_monitorings" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_created_idx" ON "rcm_temp_monitorings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rcm_temp_mon_deleted_idx" ON "rcm_temp_monitorings" USING btree ("deleted_at");