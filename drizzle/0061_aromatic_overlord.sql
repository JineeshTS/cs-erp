CREATE TABLE "lpr_continuity_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(100) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"scope" text,
	"rto_hours" integer,
	"rpo_hours" integer,
	"critical_processes" text,
	"recovery_steps" text,
	"test_date" timestamp with time zone,
	"test_result" varchar(50),
	"next_review_date" timestamp with time zone,
	"plan_owner" varchar(255),
	"approved_by" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_emergency_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"procedure_ref" varchar(100) NOT NULL,
	"procedure_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_type" varchar(100),
	"applicable_to" varchar(255),
	"response_steps" text,
	"equipment_required" text,
	"personnel_roles" text,
	"drill_frequency" varchar(50),
	"last_drill_date" timestamp with time zone,
	"next_drill_date" timestamp with time zone,
	"revision_number" integer,
	"approved_by" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_hsse_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"hsse_ref" varchar(100) NOT NULL,
	"hsse_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"location_name" varchar(255),
	"conducted_by" varchar(255),
	"conducted_date" timestamp with time zone,
	"findings_count" integer,
	"critical_findings" integer,
	"corrective_actions" text,
	"next_due_date" timestamp with time zone,
	"is_compliant" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_incident_investigations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"investigation_ref" varchar(100) NOT NULL,
	"investigation_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"location_name" varchar(255),
	"incident_date" timestamp with time zone,
	"investigator" varchar(255),
	"severity" varchar(20),
	"injured_persons" integer,
	"root_cause_method" varchar(50),
	"root_cause_findings" text,
	"corrective_actions" text,
	"estimated_cost" numeric(14, 2),
	"closed_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_near_miss_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"near_miss_ref" varchar(100) NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"location_name" varchar(255),
	"reported_by" varchar(255),
	"reported_date" timestamp with time zone,
	"potential_severity" varchar(20),
	"description" text,
	"immediate_action" text,
	"root_cause" text,
	"preventive_measure" text,
	"is_anonymous" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_pi_club_scorings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"scoring_ref" varchar(100) NOT NULL,
	"scoring_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"pi_club_name" varchar(255),
	"assessment_date" timestamp with time zone,
	"overall_score" numeric(5, 2),
	"safety_score" numeric(5, 2),
	"claims_score" numeric(5, 2),
	"compliance_score" numeric(5, 2),
	"risk_grade" varchar(10),
	"premium_impact" numeric(14, 2),
	"recommendations" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_risk_kpi_dashboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dashboard_ref" varchar(100) NOT NULL,
	"dashboard_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"reporting_period" varchar(50),
	"total_risks" integer,
	"high_risks" integer,
	"incident_count" integer,
	"near_miss_count" integer,
	"ltif_rate" numeric(8, 4),
	"trif_rate" numeric(8, 4),
	"insurance_claims" numeric(14, 2),
	"compliance_rate" numeric(5, 2),
	"board_presented_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lpr_risk_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"risk_ref" varchar(100) NOT NULL,
	"risk_type" varchar(50) NOT NULL,
	"title" varchar(255),
	"description" text,
	"risk_category" varchar(100),
	"likelihood" integer,
	"impact" integer,
	"risk_score" integer,
	"risk_owner" varchar(255),
	"mitigation_strategy" text,
	"residual_likelihood" integer,
	"residual_impact" integer,
	"residual_score" integer,
	"review_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "lpr_continuity_plans" ADD CONSTRAINT "lpr_continuity_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_emergency_procedures" ADD CONSTRAINT "lpr_emergency_procedures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_hsse_records" ADD CONSTRAINT "lpr_hsse_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_incident_investigations" ADD CONSTRAINT "lpr_incident_investigations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_near_miss_reports" ADD CONSTRAINT "lpr_near_miss_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_pi_club_scorings" ADD CONSTRAINT "lpr_pi_club_scorings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_risk_kpi_dashboards" ADD CONSTRAINT "lpr_risk_kpi_dashboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpr_risk_registers" ADD CONSTRAINT "lpr_risk_registers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;