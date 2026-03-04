CREATE TABLE "mob_container_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_ref" varchar(100) NOT NULL,
	"survey_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"container_size" varchar(10),
	"container_condition" varchar(30),
	"surveyor_name" varchar(255),
	"survey_location" varchar(255),
	"damage_count" integer,
	"estimated_repair_cost" numeric(14, 2),
	"repair_currency" varchar(3),
	"csc_plate_valid" boolean,
	"surveyed_at" timestamp with time zone,
	"photo_count" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_damage_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_ref" varchar(100) NOT NULL,
	"assessment_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"damage_location" varchar(100),
	"damage_category" varchar(50),
	"severity_level" varchar(20),
	"ai_confidence" numeric(5, 2),
	"ai_detected_type" varchar(100),
	"estimated_repair_cost" numeric(14, 2),
	"repair_currency" varchar(3),
	"photo_url" text,
	"photo_count" integer,
	"assessed_by" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_driver_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"delivery_ref" varchar(100) NOT NULL,
	"delivery_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"driver_name" varchar(255),
	"truck_plate" varchar(20),
	"origin_location" varchar(255),
	"destination_location" varchar(255),
	"pod_received_by" varchar(255),
	"pod_signature_url" text,
	"delivered_at" timestamp with time zone,
	"pod_photo_count" integer,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_executive_dashboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dashboard_ref" varchar(100) NOT NULL,
	"dashboard_type" varchar(50) NOT NULL,
	"dashboard_name" varchar(255),
	"reporting_period" varchar(20),
	"widget_count" integer,
	"refresh_interval" integer,
	"last_refreshed_at" timestamp with time zone,
	"access_level" varchar(20),
	"favorited" boolean,
	"shared_with" text,
	"dashboard_config" jsonb,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_gate_processings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"gate_ref" varchar(100) NOT NULL,
	"gate_type" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"container_size" varchar(10),
	"container_type" varchar(50),
	"truck_plate" varchar(20),
	"driver_name" varchar(255),
	"driver_license" varchar(50),
	"seal_number" varchar(50),
	"gate_number" varchar(10),
	"processed_at" timestamp with time zone,
	"yard_location" varchar(100),
	"damage_found" boolean,
	"photo_count" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_offline_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sync_ref" varchar(100) NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"device_id" varchar(100),
	"device_name" varchar(255),
	"user_name" varchar(255),
	"records_synced" integer,
	"records_failed" integer,
	"conflicts_detected" integer,
	"conflicts_resolved" integer,
	"sync_started_at" timestamp with time zone,
	"sync_completed_at" timestamp with time zone,
	"data_size_kb" numeric(12, 2),
	"sync_duration_ms" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_push_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"notification_ref" varchar(100) NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"body" text,
	"channel" varchar(50),
	"priority" varchar(20),
	"target_audience" varchar(100),
	"recipient_count" integer,
	"delivered_count" integer,
	"read_count" integer,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mob_yard_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"inspection_ref" varchar(100) NOT NULL,
	"inspection_type" varchar(50) NOT NULL,
	"yard_section" varchar(50),
	"inspector_name" varchar(255),
	"containers_checked" integer,
	"issues_found" integer,
	"critical_issues" integer,
	"completion_pct" numeric(5, 2),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"weather_condition" varchar(50),
	"photo_count" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mob_container_surveys" ADD CONSTRAINT "mob_container_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_damage_assessments" ADD CONSTRAINT "mob_damage_assessments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_driver_deliveries" ADD CONSTRAINT "mob_driver_deliveries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_executive_dashboards" ADD CONSTRAINT "mob_executive_dashboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_gate_processings" ADD CONSTRAINT "mob_gate_processings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_offline_syncs" ADD CONSTRAINT "mob_offline_syncs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_push_notifications" ADD CONSTRAINT "mob_push_notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mob_yard_inspections" ADD CONSTRAINT "mob_yard_inspections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;