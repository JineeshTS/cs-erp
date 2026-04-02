CREATE TABLE "icm_cargo_insurance_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"policy_ref" varchar(50) NOT NULL,
	"policy_type" varchar(30) NOT NULL,
	"insurer_name" varchar(255) NOT NULL,
	"insured_party" varchar(255),
	"coverage_type" varchar(30),
	"cargo_description" text,
	"hs_code" varchar(20),
	"cargo_value" numeric(18, 2),
	"insured_value" numeric(18, 2),
	"value_currency" varchar(3) DEFAULT 'USD',
	"coverage_start" timestamp with time zone,
	"coverage_end" timestamp with time zone,
	"premium_amount" numeric(14, 2),
	"premium_rate" numeric(8, 4),
	"premium_currency" varchar(3) DEFAULT 'USD',
	"deductible_amount" numeric(14, 2),
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"certificate_number" varchar(50),
	"broker_name" varchar(255),
	"special_conditions" text,
	"exclusions" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_claims_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prediction_ref" varchar(50) NOT NULL,
	"prediction_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"voyage_number" varchar(50),
	"trade_route" varchar(255),
	"cargo_type" varchar(100),
	"risk_score" numeric(5, 2),
	"risk_level" varchar(20),
	"predicted_claim_type" varchar(30),
	"predicted_amount" numeric(18, 2),
	"prediction_currency" varchar(3) DEFAULT 'USD',
	"confidence_score" numeric(5, 2),
	"risk_factors" jsonb,
	"mitigation_actions" jsonb,
	"model_version" varchar(20),
	"data_inputs" jsonb,
	"actual_outcome" varchar(30),
	"actual_amount" numeric(18, 2),
	"prediction_accuracy" numeric(5, 2),
	"generated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_claims_recoveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"recovery_ref" varchar(50) NOT NULL,
	"recovery_type" varchar(30) NOT NULL,
	"claim_ref" varchar(50),
	"policy_ref" varchar(50),
	"vessel_name" varchar(255),
	"respondent_name" varchar(255),
	"respondent_contact" varchar(255),
	"respondent_insurer" varchar(255),
	"original_claim_amount" numeric(18, 2),
	"target_recovery_amount" numeric(18, 2),
	"recovered_amount" numeric(18, 2),
	"recovery_currency" varchar(3) DEFAULT 'USD',
	"recovery_basis" text,
	"legal_counsel" varchar(255),
	"legal_costs" numeric(14, 2),
	"filed_at" timestamp with time zone,
	"settled_at" timestamp with time zone,
	"limitation_date" timestamp with time zone,
	"court_jurisdiction" varchar(255),
	"arbitration_clause" text,
	"supporting_documents" jsonb,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_claims_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"claim_ref" varchar(50) NOT NULL,
	"claim_type" varchar(30) NOT NULL,
	"policy_ref" varchar(50),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"voyage_number" varchar(50),
	"incident_date" timestamp with time zone,
	"incident_location" varchar(255),
	"incident_description" text,
	"claimant_name" varchar(255),
	"claimant_contact" varchar(255),
	"claimant_type" varchar(30),
	"estimated_amount" numeric(18, 2),
	"reserve_amount" numeric(18, 2),
	"settled_amount" numeric(18, 2),
	"claim_currency" varchar(3) DEFAULT 'USD',
	"investigator_name" varchar(255),
	"investigation_findings" text,
	"supporting_documents" jsonb,
	"time_bar_date" timestamp with time zone,
	"registered_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"closure_reason" varchar(50),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_hull_machinery_insurances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"policy_ref" varchar(50) NOT NULL,
	"policy_type" varchar(30) NOT NULL,
	"insurer_name" varchar(255) NOT NULL,
	"insurer_contact_name" varchar(255),
	"insurer_contact_email" varchar(255),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"vessel_value" numeric(18, 2),
	"insured_value" numeric(18, 2),
	"value_currency" varchar(3) DEFAULT 'USD',
	"coverage_start" timestamp with time zone,
	"coverage_end" timestamp with time zone,
	"premium_amount" numeric(14, 2),
	"premium_currency" varchar(3) DEFAULT 'USD',
	"deductible_amount" numeric(14, 2),
	"trading_limits" text,
	"classification_required" varchar(255),
	"condition_survey_required" boolean DEFAULT false,
	"last_survey_date" timestamp with time zone,
	"renewal_date" timestamp with time zone,
	"broker_name" varchar(255),
	"broker_ref" varchar(50),
	"covered_perils" jsonb,
	"exclusions" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_loss_prevention_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_ref" varchar(50) NOT NULL,
	"report_type" varchar(30) NOT NULL,
	"report_title" varchar(255) NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"vessel_name" varchar(255),
	"fleet_scope" varchar(30),
	"total_claims" integer,
	"total_claim_amount" numeric(18, 2),
	"total_recovered" numeric(18, 2),
	"net_loss" numeric(18, 2),
	"report_currency" varchar(3) DEFAULT 'USD',
	"loss_ratio" numeric(8, 4),
	"claim_frequency" numeric(8, 4),
	"top_risk_categories" jsonb,
	"trend_analysis" jsonb,
	"recommendations" text,
	"preventive_actions" jsonb,
	"benchmark_data" jsonb,
	"document_url" varchar(500),
	"document_format" varchar(10),
	"approved_by" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_pi_club_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"policy_ref" varchar(50) NOT NULL,
	"policy_type" varchar(30) NOT NULL,
	"club_name" varchar(255) NOT NULL,
	"club_contact_name" varchar(255),
	"club_contact_email" varchar(255),
	"club_contact_phone" varchar(50),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"coverage_start" timestamp with time zone,
	"coverage_end" timestamp with time zone,
	"premium_amount" numeric(14, 2),
	"premium_currency" varchar(3) DEFAULT 'USD',
	"deductible_amount" numeric(14, 2),
	"coverage_limit" numeric(18, 2),
	"covered_risks" jsonb,
	"exclusions" jsonb,
	"correspondence_log" jsonb,
	"renewal_date" timestamp with time zone,
	"renewal_status" varchar(20),
	"broker_name" varchar(255),
	"broker_ref" varchar(50),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icm_survey_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"appointment_ref" varchar(50) NOT NULL,
	"appointment_type" varchar(30) NOT NULL,
	"claim_ref" varchar(50),
	"policy_ref" varchar(50),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"port_name" varchar(255),
	"terminal_name" varchar(255),
	"surveyor_name" varchar(255),
	"surveyor_company" varchar(255),
	"surveyor_email" varchar(255),
	"surveyor_phone" varchar(50),
	"appointed_by" varchar(255),
	"appointed_at" timestamp with time zone,
	"scheduled_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"survey_scope" text,
	"survey_findings" text,
	"report_url" varchar(500),
	"report_date" timestamp with time zone,
	"estimated_cost" numeric(14, 2),
	"actual_cost" numeric(14, 2),
	"cost_currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "icm_cargo_insurance_policies" ADD CONSTRAINT "icm_cargo_insurance_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_claims_predictions" ADD CONSTRAINT "icm_claims_predictions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_claims_recoveries" ADD CONSTRAINT "icm_claims_recoveries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_claims_registrations" ADD CONSTRAINT "icm_claims_registrations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_hull_machinery_insurances" ADD CONSTRAINT "icm_hull_machinery_insurances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_loss_prevention_reports" ADD CONSTRAINT "icm_loss_prevention_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_pi_club_policies" ADD CONSTRAINT "icm_pi_club_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icm_survey_appointments" ADD CONSTRAINT "icm_survey_appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "icm_cargo_ins_tenant_idx" ON "icm_cargo_insurance_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_cargo_ins_ref_idx" ON "icm_cargo_insurance_policies" USING btree ("policy_ref");--> statement-breakpoint
CREATE INDEX "icm_cargo_ins_status_idx" ON "icm_cargo_insurance_policies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_cargo_ins_type_idx" ON "icm_cargo_insurance_policies" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "icm_cargo_ins_vessel_idx" ON "icm_cargo_insurance_policies" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_cargo_ins_deleted_idx" ON "icm_cargo_insurance_policies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_tenant_idx" ON "icm_claims_predictions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_ref_idx" ON "icm_claims_predictions" USING btree ("prediction_ref");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_status_idx" ON "icm_claims_predictions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_type_idx" ON "icm_claims_predictions" USING btree ("prediction_type");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_vessel_idx" ON "icm_claims_predictions" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_risk_idx" ON "icm_claims_predictions" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "icm_claim_pred_deleted_idx" ON "icm_claims_predictions" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_claim_rec_tenant_idx" ON "icm_claims_recoveries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_claim_rec_ref_idx" ON "icm_claims_recoveries" USING btree ("recovery_ref");--> statement-breakpoint
CREATE INDEX "icm_claim_rec_status_idx" ON "icm_claims_recoveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_claim_rec_type_idx" ON "icm_claims_recoveries" USING btree ("recovery_type");--> statement-breakpoint
CREATE INDEX "icm_claim_rec_vessel_idx" ON "icm_claims_recoveries" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_claim_rec_deleted_idx" ON "icm_claims_recoveries" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_claim_reg_tenant_idx" ON "icm_claims_registrations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_claim_reg_ref_idx" ON "icm_claims_registrations" USING btree ("claim_ref");--> statement-breakpoint
CREATE INDEX "icm_claim_reg_status_idx" ON "icm_claims_registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_claim_reg_type_idx" ON "icm_claims_registrations" USING btree ("claim_type");--> statement-breakpoint
CREATE INDEX "icm_claim_reg_vessel_idx" ON "icm_claims_registrations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_claim_reg_deleted_idx" ON "icm_claims_registrations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_hull_mach_tenant_idx" ON "icm_hull_machinery_insurances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_hull_mach_ref_idx" ON "icm_hull_machinery_insurances" USING btree ("policy_ref");--> statement-breakpoint
CREATE INDEX "icm_hull_mach_status_idx" ON "icm_hull_machinery_insurances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_hull_mach_type_idx" ON "icm_hull_machinery_insurances" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "icm_hull_mach_vessel_idx" ON "icm_hull_machinery_insurances" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_hull_mach_deleted_idx" ON "icm_hull_machinery_insurances" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_loss_prev_tenant_idx" ON "icm_loss_prevention_reports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_loss_prev_ref_idx" ON "icm_loss_prevention_reports" USING btree ("report_ref");--> statement-breakpoint
CREATE INDEX "icm_loss_prev_status_idx" ON "icm_loss_prevention_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_loss_prev_type_idx" ON "icm_loss_prevention_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "icm_loss_prev_vessel_idx" ON "icm_loss_prevention_reports" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_loss_prev_deleted_idx" ON "icm_loss_prevention_reports" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_pi_club_policy_tenant_idx" ON "icm_pi_club_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_pi_club_policy_ref_idx" ON "icm_pi_club_policies" USING btree ("policy_ref");--> statement-breakpoint
CREATE INDEX "icm_pi_club_policy_status_idx" ON "icm_pi_club_policies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_pi_club_policy_type_idx" ON "icm_pi_club_policies" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "icm_pi_club_policy_vessel_idx" ON "icm_pi_club_policies" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_pi_club_policy_deleted_idx" ON "icm_pi_club_policies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icm_survey_appt_tenant_idx" ON "icm_survey_appointments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icm_survey_appt_ref_idx" ON "icm_survey_appointments" USING btree ("appointment_ref");--> statement-breakpoint
CREATE INDEX "icm_survey_appt_status_idx" ON "icm_survey_appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icm_survey_appt_type_idx" ON "icm_survey_appointments" USING btree ("appointment_type");--> statement-breakpoint
CREATE INDEX "icm_survey_appt_vessel_idx" ON "icm_survey_appointments" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "icm_survey_appt_deleted_idx" ON "icm_survey_appointments" USING btree ("deleted_at");