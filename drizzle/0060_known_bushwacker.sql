CREATE TABLE "mec_annex_compliances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"compliance_ref" varchar(100) NOT NULL,
	"compliance_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"inspection_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"certificate_number" varchar(100),
	"issuing_authority" varchar(255),
	"is_compliant" boolean DEFAULT true,
	"findings_count" integer,
	"corrective_actions" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_anti_foulings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"afs_ref" varchar(100) NOT NULL,
	"afs_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"coating_type" varchar(255),
	"application_date" timestamp with time zone,
	"survey_date" timestamp with time zone,
	"certificate_number" varchar(100),
	"issuing_authority" varchar(255),
	"is_tbt_free" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_ballast_waters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ballast_ref" varchar(100) NOT NULL,
	"ballast_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"treatment_system" varchar(255),
	"operation_date" timestamp with time zone,
	"port_name" varchar(255),
	"volume_cubic_meters" numeric(12, 2),
	"exchange_latitude" numeric(10, 6),
	"exchange_longitude" numeric(10, 6),
	"is_compliant" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_cargo_charters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_ref" varchar(100) NOT NULL,
	"charter_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"reporting_year" integer,
	"trade_lane" varchar(255),
	"total_voyages" integer,
	"total_cargo_tonnes" numeric(14, 2),
	"total_co2_tonnes" numeric(14, 2),
	"carbon_intensity" numeric(10, 4),
	"alignment_status" varchar(50),
	"disclosure_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_cii_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cii_ref" varchar(100) NOT NULL,
	"cii_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"reporting_year" integer,
	"attained_cii" numeric(10, 4),
	"required_cii" numeric(10, 4),
	"rating" varchar(1),
	"improvement_target" numeric(5, 2),
	"correction_plan" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_environmental_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"incident_ref" varchar(100) NOT NULL,
	"incident_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"incident_date" timestamp with time zone,
	"location_description" varchar(255),
	"severity" varchar(20),
	"quantity_spilled" numeric(14, 2),
	"root_cause" text,
	"corrective_actions" text,
	"reported_to_authority" boolean DEFAULT false,
	"fine_amount" numeric(14, 2),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_sulphur_caps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sulphur_ref" varchar(100) NOT NULL,
	"sulphur_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"fuel_type" varchar(100),
	"sulphur_content" numeric(5, 3),
	"sample_date" timestamp with time zone,
	"lab_reference" varchar(100),
	"has_scrubber" boolean DEFAULT false,
	"is_compliant" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mec_waste_managements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"waste_ref" varchar(100) NOT NULL,
	"waste_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"disposal_method" varchar(100),
	"disposal_date" timestamp with time zone,
	"port_name" varchar(255),
	"quantity_kg" numeric(10, 2),
	"receiving_facility" varchar(255),
	"receipt_number" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mec_annex_compliances" ADD CONSTRAINT "mec_annex_compliances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_anti_foulings" ADD CONSTRAINT "mec_anti_foulings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_ballast_waters" ADD CONSTRAINT "mec_ballast_waters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_cargo_charters" ADD CONSTRAINT "mec_cargo_charters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_cii_ratings" ADD CONSTRAINT "mec_cii_ratings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_environmental_incidents" ADD CONSTRAINT "mec_environmental_incidents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_sulphur_caps" ADD CONSTRAINT "mec_sulphur_caps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mec_waste_managements" ADD CONSTRAINT "mec_waste_managements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;