CREATE TABLE "crm_certificate_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"certificate_ref" varchar(50) NOT NULL,
	"crew_member_name" varchar(255) NOT NULL,
	"rank" varchar(100),
	"certificate_type" varchar(30) NOT NULL,
	"certificate_name" varchar(255) NOT NULL,
	"certificate_number" varchar(100),
	"issuing_authority" varchar(255),
	"issuing_country" varchar(100),
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"last_verified" timestamp with time zone,
	"stcw_regulation" varchar(100),
	"competency_level" varchar(50),
	"revalidation_required" boolean DEFAULT false,
	"revalidation_date" timestamp with time zone,
	"document_url" varchar(500),
	"status" varchar(20) DEFAULT 'valid' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_crew_rotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rotation_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"crew_member_name" varchar(255) NOT NULL,
	"rank" varchar(100) NOT NULL,
	"nationality" varchar(100),
	"joining_date" timestamp with time zone NOT NULL,
	"relieving_date" timestamp with time zone,
	"contract_duration" integer,
	"rotation_type" varchar(30) NOT NULL,
	"relieving_crew_name" varchar(255),
	"handover_notes" text,
	"travel_arrangements" jsonb,
	"relief_port" varchar(255),
	"relief_country" varchar(100),
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_flag_state_compliance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"compliance_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"flag_state" varchar(100) NOT NULL,
	"inspection_type" varchar(30) NOT NULL,
	"inspection_date" timestamp with time zone NOT NULL,
	"inspector_name" varchar(255),
	"inspection_port" varchar(255),
	"deficiencies_found" integer DEFAULT 0 NOT NULL,
	"detainable" boolean DEFAULT false,
	"observations" jsonb,
	"findings" jsonb,
	"corrective_actions" jsonb,
	"rectification_deadline" timestamp with time zone,
	"rectified_date" timestamp with time zone,
	"report_number" varchar(100),
	"next_inspection_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_manning_agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agency_ref" varchar(50) NOT NULL,
	"agency_name" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"city" varchar(100),
	"address" text,
	"contact_person" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"license_number" varchar(100),
	"license_expiry" timestamp with time zone,
	"flag_states" jsonb,
	"specializations" jsonb,
	"active_crew_count" integer DEFAULT 0 NOT NULL,
	"performance_rating" integer,
	"contract_start_date" timestamp with time zone,
	"contract_end_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_mlc_compliance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"compliance_ref" varchar(50) NOT NULL,
	"vessel_id" uuid,
	"vessel_name" varchar(255) NOT NULL,
	"flag_state" varchar(100) NOT NULL,
	"mlc_standard" varchar(100) NOT NULL,
	"compliance_area" varchar(30) NOT NULL,
	"dmlc_part_i" boolean DEFAULT false,
	"dmlc_part_ii" boolean DEFAULT false,
	"last_inspection_date" timestamp with time zone,
	"next_inspection_date" timestamp with time zone,
	"inspector_name" varchar(255),
	"findings" jsonb,
	"corrective_actions" jsonb,
	"closure_deadline" timestamp with time zone,
	"certificate_number" varchar(100),
	"certificate_issue_date" timestamp with time zone,
	"certificate_expiry_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'compliant' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_payroll_allotments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"allotment_ref" varchar(50) NOT NULL,
	"crew_member_name" varchar(255) NOT NULL,
	"rank" varchar(100),
	"vessel_name" varchar(255) NOT NULL,
	"payroll_month" integer NOT NULL,
	"payroll_year" integer NOT NULL,
	"base_salary" integer DEFAULT 0 NOT NULL,
	"overtime_hours" integer DEFAULT 0 NOT NULL,
	"overtime_rate" integer DEFAULT 0 NOT NULL,
	"overtime_amount" integer DEFAULT 0 NOT NULL,
	"leave_pay" integer DEFAULT 0 NOT NULL,
	"bonuses" integer DEFAULT 0 NOT NULL,
	"deductions" integer DEFAULT 0 NOT NULL,
	"net_pay" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"allotment_amount" integer DEFAULT 0 NOT NULL,
	"allotment_beneficiary" varchar(255),
	"allotment_bank" varchar(255),
	"allotment_account" varchar(100),
	"payment_date" timestamp with time zone,
	"payment_method" varchar(50),
	"tax_withheld" integer DEFAULT 0 NOT NULL,
	"social_security" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_visa_travel_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"crew_member_name" varchar(255) NOT NULL,
	"nationality" varchar(100),
	"record_type" varchar(30) NOT NULL,
	"visa_type" varchar(50),
	"visa_country" varchar(100),
	"visa_number" varchar(100),
	"visa_issue_date" timestamp with time zone,
	"visa_expiry_date" timestamp with time zone,
	"travel_date" timestamp with time zone,
	"travel_from" varchar(255),
	"travel_to" varchar(255),
	"flight_number" varchar(50),
	"airline" varchar(100),
	"ticket_number" varchar(100),
	"ticket_cost" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"repatriation_reason" varchar(255),
	"repatriation_port" varchar(255),
	"arranged_by_name" varchar(255),
	"approved_by_name" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_welfare_medical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"crew_member_name" varchar(255) NOT NULL,
	"rank" varchar(100),
	"vessel_name" varchar(255),
	"record_type" varchar(30) NOT NULL,
	"description" text,
	"diagnosis" text,
	"medical_provider_name" varchar(255),
	"hospital_name" varchar(255),
	"examination_date" timestamp with time zone,
	"treatment_start_date" timestamp with time zone,
	"treatment_end_date" timestamp with time zone,
	"fit_for_duty" boolean DEFAULT true,
	"restriction_notes" text,
	"cost_amount" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"insurance_claim" boolean DEFAULT false,
	"claim_number" varchar(100),
	"prescriptions" jsonb,
	"follow_up_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_certificate_trackings" ADD CONSTRAINT "crm_certificate_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_crew_rotations" ADD CONSTRAINT "crm_crew_rotations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_flag_state_compliance" ADD CONSTRAINT "crm_flag_state_compliance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_manning_agencies" ADD CONSTRAINT "crm_manning_agencies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_mlc_compliance" ADD CONSTRAINT "crm_mlc_compliance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_payroll_allotments" ADD CONSTRAINT "crm_payroll_allotments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_visa_travel_records" ADD CONSTRAINT "crm_visa_travel_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_welfare_medical_records" ADD CONSTRAINT "crm_welfare_medical_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crm_ct_tenant_id_idx" ON "crm_certificate_trackings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_ct_tenant_ref_idx" ON "crm_certificate_trackings" USING btree ("tenant_id","certificate_ref");--> statement-breakpoint
CREATE INDEX "crm_ct_crew_member_idx" ON "crm_certificate_trackings" USING btree ("crew_member_name");--> statement-breakpoint
CREATE INDEX "crm_ct_certificate_type_idx" ON "crm_certificate_trackings" USING btree ("certificate_type");--> statement-breakpoint
CREATE INDEX "crm_ct_certificate_name_idx" ON "crm_certificate_trackings" USING btree ("certificate_name");--> statement-breakpoint
CREATE INDEX "crm_ct_expiry_date_idx" ON "crm_certificate_trackings" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "crm_ct_issuing_country_idx" ON "crm_certificate_trackings" USING btree ("issuing_country");--> statement-breakpoint
CREATE INDEX "crm_ct_status_idx" ON "crm_certificate_trackings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_ct_created_at_idx" ON "crm_certificate_trackings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_cr_tenant_id_idx" ON "crm_crew_rotations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_cr_tenant_ref_idx" ON "crm_crew_rotations" USING btree ("tenant_id","rotation_ref");--> statement-breakpoint
CREATE INDEX "crm_cr_vessel_id_idx" ON "crm_crew_rotations" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "crm_cr_vessel_name_idx" ON "crm_crew_rotations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "crm_cr_crew_member_idx" ON "crm_crew_rotations" USING btree ("crew_member_name");--> statement-breakpoint
CREATE INDEX "crm_cr_rank_idx" ON "crm_crew_rotations" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "crm_cr_joining_date_idx" ON "crm_crew_rotations" USING btree ("joining_date");--> statement-breakpoint
CREATE INDEX "crm_cr_rotation_type_idx" ON "crm_crew_rotations" USING btree ("rotation_type");--> statement-breakpoint
CREATE INDEX "crm_cr_status_idx" ON "crm_crew_rotations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_cr_created_at_idx" ON "crm_crew_rotations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_fsc_tenant_id_idx" ON "crm_flag_state_compliance" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_fsc_tenant_ref_idx" ON "crm_flag_state_compliance" USING btree ("tenant_id","compliance_ref");--> statement-breakpoint
CREATE INDEX "crm_fsc_vessel_id_idx" ON "crm_flag_state_compliance" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "crm_fsc_vessel_name_idx" ON "crm_flag_state_compliance" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "crm_fsc_flag_state_idx" ON "crm_flag_state_compliance" USING btree ("flag_state");--> statement-breakpoint
CREATE INDEX "crm_fsc_inspection_type_idx" ON "crm_flag_state_compliance" USING btree ("inspection_type");--> statement-breakpoint
CREATE INDEX "crm_fsc_inspection_date_idx" ON "crm_flag_state_compliance" USING btree ("inspection_date");--> statement-breakpoint
CREATE INDEX "crm_fsc_status_idx" ON "crm_flag_state_compliance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_fsc_created_at_idx" ON "crm_flag_state_compliance" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_ma_tenant_id_idx" ON "crm_manning_agencies" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_ma_tenant_ref_idx" ON "crm_manning_agencies" USING btree ("tenant_id","agency_ref");--> statement-breakpoint
CREATE INDEX "crm_ma_agency_name_idx" ON "crm_manning_agencies" USING btree ("agency_name");--> statement-breakpoint
CREATE INDEX "crm_ma_country_idx" ON "crm_manning_agencies" USING btree ("country");--> statement-breakpoint
CREATE INDEX "crm_ma_license_expiry_idx" ON "crm_manning_agencies" USING btree ("license_expiry");--> statement-breakpoint
CREATE INDEX "crm_ma_status_idx" ON "crm_manning_agencies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_ma_created_at_idx" ON "crm_manning_agencies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_mlc_tenant_id_idx" ON "crm_mlc_compliance" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_mlc_tenant_ref_idx" ON "crm_mlc_compliance" USING btree ("tenant_id","compliance_ref");--> statement-breakpoint
CREATE INDEX "crm_mlc_vessel_id_idx" ON "crm_mlc_compliance" USING btree ("vessel_id");--> statement-breakpoint
CREATE INDEX "crm_mlc_vessel_name_idx" ON "crm_mlc_compliance" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "crm_mlc_flag_state_idx" ON "crm_mlc_compliance" USING btree ("flag_state");--> statement-breakpoint
CREATE INDEX "crm_mlc_compliance_area_idx" ON "crm_mlc_compliance" USING btree ("compliance_area");--> statement-breakpoint
CREATE INDEX "crm_mlc_next_inspection_idx" ON "crm_mlc_compliance" USING btree ("next_inspection_date");--> statement-breakpoint
CREATE INDEX "crm_mlc_certificate_expiry_idx" ON "crm_mlc_compliance" USING btree ("certificate_expiry_date");--> statement-breakpoint
CREATE INDEX "crm_mlc_status_idx" ON "crm_mlc_compliance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_mlc_created_at_idx" ON "crm_mlc_compliance" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_pa_tenant_id_idx" ON "crm_payroll_allotments" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_pa_tenant_ref_idx" ON "crm_payroll_allotments" USING btree ("tenant_id","allotment_ref");--> statement-breakpoint
CREATE INDEX "crm_pa_crew_member_idx" ON "crm_payroll_allotments" USING btree ("crew_member_name");--> statement-breakpoint
CREATE INDEX "crm_pa_vessel_name_idx" ON "crm_payroll_allotments" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "crm_pa_payroll_period_idx" ON "crm_payroll_allotments" USING btree ("payroll_year","payroll_month");--> statement-breakpoint
CREATE INDEX "crm_pa_payment_date_idx" ON "crm_payroll_allotments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "crm_pa_status_idx" ON "crm_payroll_allotments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_pa_created_at_idx" ON "crm_payroll_allotments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_vtr_tenant_id_idx" ON "crm_visa_travel_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_vtr_tenant_ref_idx" ON "crm_visa_travel_records" USING btree ("tenant_id","record_ref");--> statement-breakpoint
CREATE INDEX "crm_vtr_crew_member_idx" ON "crm_visa_travel_records" USING btree ("crew_member_name");--> statement-breakpoint
CREATE INDEX "crm_vtr_record_type_idx" ON "crm_visa_travel_records" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "crm_vtr_visa_country_idx" ON "crm_visa_travel_records" USING btree ("visa_country");--> statement-breakpoint
CREATE INDEX "crm_vtr_visa_expiry_idx" ON "crm_visa_travel_records" USING btree ("visa_expiry_date");--> statement-breakpoint
CREATE INDEX "crm_vtr_travel_date_idx" ON "crm_visa_travel_records" USING btree ("travel_date");--> statement-breakpoint
CREATE INDEX "crm_vtr_status_idx" ON "crm_visa_travel_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_vtr_created_at_idx" ON "crm_visa_travel_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crm_wmr_tenant_id_idx" ON "crm_welfare_medical_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_wmr_tenant_ref_idx" ON "crm_welfare_medical_records" USING btree ("tenant_id","record_ref");--> statement-breakpoint
CREATE INDEX "crm_wmr_crew_member_idx" ON "crm_welfare_medical_records" USING btree ("crew_member_name");--> statement-breakpoint
CREATE INDEX "crm_wmr_vessel_name_idx" ON "crm_welfare_medical_records" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "crm_wmr_record_type_idx" ON "crm_welfare_medical_records" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "crm_wmr_examination_date_idx" ON "crm_welfare_medical_records" USING btree ("examination_date");--> statement-breakpoint
CREATE INDEX "crm_wmr_follow_up_idx" ON "crm_welfare_medical_records" USING btree ("follow_up_date");--> statement-breakpoint
CREATE INDEX "crm_wmr_status_idx" ON "crm_welfare_medical_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_wmr_created_at_idx" ON "crm_welfare_medical_records" USING btree ("created_at");