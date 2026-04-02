CREATE TABLE "ser_alt_fuel_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tracking_ref" varchar(100) NOT NULL,
	"tracking_type" varchar(50) NOT NULL,
	"fuel_name" varchar(100),
	"fuel_category" varchar(50),
	"vessel_name" varchar(255),
	"quantity_mt" numeric(10, 3),
	"cost_per_mt" numeric(10, 2),
	"total_cost" numeric(14, 2),
	"fuel_currency" varchar(3),
	"co2_reduction_pct" numeric(8, 4),
	"supplier_name" varchar(255),
	"certification_ref" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_carbon_footprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"footprint_ref" varchar(100) NOT NULL,
	"footprint_type" varchar(50) NOT NULL,
	"voyage_ref" varchar(100),
	"vessel_name" varchar(255),
	"vessel_imo" varchar(20),
	"route_description" text,
	"distance_nm" numeric(10, 2),
	"fuel_consumed_mt" numeric(10, 3),
	"fuel_type" varchar(50),
	"co2_emissions_mt" numeric(12, 4),
	"ch4_emissions_mt" numeric(12, 6),
	"n2o_emissions_mt" numeric(12, 6),
	"co2e_emissions_mt" numeric(12, 4),
	"emission_intensity" numeric(10, 4),
	"cargo_carried_mt" numeric(12, 2),
	"calculation_method" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_decarb_roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"roadmap_ref" varchar(100) NOT NULL,
	"roadmap_type" varchar(50) NOT NULL,
	"milestone_name" varchar(255),
	"target_year" integer,
	"target_reduction_pct" numeric(8, 4),
	"current_reduction_pct" numeric(8, 4),
	"investment_required" numeric(14, 2),
	"investment_currency" varchar(3),
	"technology_area" varchar(100),
	"implementation_status" varchar(50),
	"risk_level" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_esg_kpis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"kpi_ref" varchar(100) NOT NULL,
	"kpi_type" varchar(50) NOT NULL,
	"kpi_name" varchar(255),
	"kpi_category" varchar(50),
	"reporting_period" varchar(20),
	"target_value" numeric(14, 4),
	"actual_value" numeric(14, 4),
	"achievement_pct" numeric(8, 4),
	"benchmark_value" numeric(14, 4),
	"benchmark_source" varchar(255),
	"trend_direction" varchar(20),
	"rating" varchar(10),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_ghg_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(100) NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"reporting_period" varchar(20),
	"reporting_year" integer,
	"scope1_emissions_mt" numeric(14, 4),
	"scope2_emissions_mt" numeric(14, 4),
	"scope3_emissions_mt" numeric(14, 4),
	"total_emissions_mt" numeric(14, 4),
	"baseline_year" integer,
	"baseline_emissions" numeric(14, 4),
	"reduction_pct" numeric(8, 4),
	"verification_body" varchar(255),
	"verified_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_poseidon_alignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"alignment_ref" varchar(100) NOT NULL,
	"alignment_type" varchar(50) NOT NULL,
	"reporting_year" integer,
	"vessel_name" varchar(255),
	"vessel_imo" varchar(20),
	"vessel_type" varchar(50),
	"aeoi" numeric(10, 4),
	"required_aeoi" numeric(10, 4),
	"alignment_delta" numeric(10, 4),
	"climate_aligned" boolean,
	"portfolio_score" numeric(8, 4),
	"trajectory_target" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_sea_cargo_charters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"charter_ref" varchar(100) NOT NULL,
	"charter_type" varchar(50) NOT NULL,
	"reporting_year" integer,
	"total_voyages" integer,
	"aligned_voyages" integer,
	"alignment_score" numeric(8, 4),
	"climate_target" varchar(100),
	"trajectory_year" integer,
	"required_intensity" numeric(10, 4),
	"actual_intensity" numeric(10, 4),
	"gap_to_target" numeric(10, 4),
	"disclosure_level" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ser_tcfd_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tcfd_ref" varchar(100) NOT NULL,
	"tcfd_type" varchar(50) NOT NULL,
	"reporting_year" integer,
	"pillar_area" varchar(50),
	"disclosure_title" varchar(255),
	"scenario_name" varchar(100),
	"temperature_pathway" varchar(20),
	"financial_impact" numeric(14, 2),
	"impact_currency" varchar(3),
	"risk_category" varchar(50),
	"opportunity_category" varchar(50),
	"maturity_level" varchar(20),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ser_alt_fuel_trackings" ADD CONSTRAINT "ser_alt_fuel_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_carbon_footprints" ADD CONSTRAINT "ser_carbon_footprints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_decarb_roadmaps" ADD CONSTRAINT "ser_decarb_roadmaps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_esg_kpis" ADD CONSTRAINT "ser_esg_kpis_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_ghg_reports" ADD CONSTRAINT "ser_ghg_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_poseidon_alignments" ADD CONSTRAINT "ser_poseidon_alignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_sea_cargo_charters" ADD CONSTRAINT "ser_sea_cargo_charters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ser_tcfd_reports" ADD CONSTRAINT "ser_tcfd_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;