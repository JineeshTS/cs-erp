CREATE TABLE "iot_container_gps_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tracking_ref" varchar(100) NOT NULL,
	"tracking_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"container_type" varchar(50),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"altitude" numeric(8, 2),
	"speed" numeric(6, 2),
	"heading" numeric(5, 2),
	"location_name" varchar(255),
	"geofence_id" varchar(100),
	"device_id" varchar(100),
	"battery_level" numeric(5, 2),
	"signal_strength" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_data_lake_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(100) NOT NULL,
	"analytics_type" varchar(50) NOT NULL,
	"report_name" varchar(255),
	"reporting_period" varchar(20),
	"data_source_count" integer,
	"records_processed" integer,
	"anomalies_detected" integer,
	"avg_response_time" numeric(8, 2),
	"uptime_pct" numeric(5, 2),
	"dashboard_config" jsonb,
	"last_refreshed_at" timestamp with time zone,
	"schedule_cron" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_electronic_seals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"seal_ref" varchar(100) NOT NULL,
	"seal_type" varchar(50) NOT NULL,
	"seal_number" varchar(50),
	"container_number" varchar(20),
	"seal_status" varchar(30),
	"integrity_check" boolean,
	"tamper_detected" boolean,
	"last_verified_at" timestamp with time zone,
	"applied_at" timestamp with time zone,
	"removed_at" timestamp with time zone,
	"applied_by" varchar(255),
	"applied_location" varchar(255),
	"device_id" varchar(100),
	"battery_level" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_port_equipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"equipment_ref" varchar(100) NOT NULL,
	"equipment_type" varchar(50) NOT NULL,
	"equipment_name" varchar(255),
	"equipment_id" varchar(50),
	"port_code" varchar(10),
	"terminal_name" varchar(255),
	"operational_status" varchar(30),
	"utilization_pct" numeric(5, 2),
	"fuel_consumption" numeric(10, 2),
	"hours_operated" numeric(10, 2),
	"last_maintenance_at" timestamp with time zone,
	"next_maintenance_due" timestamp with time zone,
	"sensor_id" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_predictive_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"alert_ref" varchar(100) NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"asset_type" varchar(50),
	"asset_identifier" varchar(100),
	"alert_severity" varchar(20),
	"prediction_confidence" numeric(5, 2),
	"predicted_failure_date" timestamp with time zone,
	"recommended_action" text,
	"estimated_cost" numeric(14, 2),
	"cost_currency" varchar(3),
	"acknowledged" boolean,
	"acknowledged_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_reefer_monitorings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"monitoring_ref" varchar(100) NOT NULL,
	"monitoring_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"set_temperature" numeric(6, 2),
	"actual_temperature" numeric(6, 2),
	"return_air_temp" numeric(6, 2),
	"supply_air_temp" numeric(6, 2),
	"humidity" numeric(5, 2),
	"vent_setting" varchar(20),
	"o2_level" numeric(5, 2),
	"co2_level" numeric(5, 2),
	"power_status" varchar(20),
	"alarm_code" varchar(20),
	"sensor_id" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_shock_detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"detection_ref" varchar(100) NOT NULL,
	"detection_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"shock_intensity_g" numeric(8, 4),
	"tilt_angle" numeric(6, 2),
	"vibration_frequency" numeric(8, 2),
	"duration" numeric(10, 2),
	"threshold_exceeded" boolean,
	"severity_level" varchar(20),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"sensor_id" varchar(100),
	"cargo_description" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_vessel_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"position_ref" varchar(100) NOT NULL,
	"position_type" varchar(50) NOT NULL,
	"vessel_name" varchar(255),
	"vessel_imo" varchar(20),
	"mmsi" varchar(20),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"course_over_ground" numeric(5, 2),
	"speed_over_ground" numeric(5, 2),
	"nav_status" varchar(50),
	"destination" varchar(255),
	"eta" timestamp with time zone,
	"draught" numeric(5, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "iot_container_gps_trackings" ADD CONSTRAINT "iot_container_gps_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_data_lake_analytics" ADD CONSTRAINT "iot_data_lake_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_electronic_seals" ADD CONSTRAINT "iot_electronic_seals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_port_equipments" ADD CONSTRAINT "iot_port_equipments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_predictive_alerts" ADD CONSTRAINT "iot_predictive_alerts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_reefer_monitorings" ADD CONSTRAINT "iot_reefer_monitorings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_shock_detections" ADD CONSTRAINT "iot_shock_detections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_vessel_positions" ADD CONSTRAINT "iot_vessel_positions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;