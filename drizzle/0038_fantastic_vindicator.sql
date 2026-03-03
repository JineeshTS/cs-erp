CREATE TABLE "hps_attendance_time_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"attendance_ref" varchar(50) NOT NULL,
	"attendance_type" varchar(30) NOT NULL,
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"attendance_date" timestamp with time zone,
	"check_in_time" timestamp with time zone,
	"check_out_time" timestamp with time zone,
	"work_hours" numeric(6, 2),
	"overtime_hours" numeric(6, 2),
	"break_hours" numeric(6, 2),
	"location" varchar(255),
	"shift_name" varchar(100),
	"is_late" boolean DEFAULT false,
	"late_minutes" integer,
	"is_early_leave" boolean DEFAULT false,
	"early_leave_minutes" integer,
	"status" varchar(20) DEFAULT 'present' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_employee_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_ref" varchar(50) NOT NULL,
	"employee_type" varchar(30) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"national_id" varchar(100),
	"passport_number" varchar(100),
	"nationality" varchar(100),
	"date_of_birth" timestamp with time zone,
	"gender" varchar(20),
	"marital_status" varchar(20),
	"department" varchar(255),
	"designation" varchar(255),
	"grade" varchar(50),
	"reporting_manager" varchar(255),
	"join_date" timestamp with time zone,
	"probation_end_date" timestamp with time zone,
	"basic_salary" numeric(14, 2),
	"salary_currency" varchar(3) DEFAULT 'QAR',
	"bank_name" varchar(255),
	"bank_account_number" varchar(100),
	"iban" varchar(50),
	"emergency_contact" jsonb,
	"address" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_gratuity_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"calculation_ref" varchar(50) NOT NULL,
	"calculation_type" varchar(30) NOT NULL,
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"join_date" timestamp with time zone,
	"last_working_date" timestamp with time zone,
	"total_years" numeric(6, 2),
	"total_months" integer,
	"basic_salary" numeric(14, 2),
	"gratuity_rate" numeric(6, 4),
	"gross_gratuity" numeric(14, 2),
	"deductions" numeric(14, 2),
	"net_gratuity" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"calculation_method" varchar(50),
	"calculation_breakdown" jsonb,
	"deduction_details" jsonb,
	"approved_by" varchar(255),
	"approval_date" timestamp with time zone,
	"payment_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_leave_absences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"leave_ref" varchar(50) NOT NULL,
	"leave_type" varchar(30) NOT NULL,
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"total_days" numeric(6, 1),
	"reason" text,
	"approver" varchar(255),
	"approval_date" timestamp with time zone,
	"leave_balance" numeric(6, 1),
	"is_half_day" boolean DEFAULT false,
	"attachment_url" text,
	"rejection_reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_payroll_processings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payroll_ref" varchar(50) NOT NULL,
	"payroll_type" varchar(30) NOT NULL,
	"payroll_period" varchar(20),
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"basic_salary" numeric(14, 2),
	"housing_allowance" numeric(14, 2),
	"transport_allowance" numeric(14, 2),
	"other_allowances" numeric(14, 2),
	"total_allowances" numeric(14, 2),
	"total_deductions" numeric(14, 2),
	"gross_pay" numeric(14, 2),
	"net_pay" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"wps_file_ref" varchar(100),
	"wps_submission_date" timestamp with time zone,
	"wps_status" varchar(20),
	"bank_name" varchar(255),
	"iban" varchar(50),
	"deduction_breakdown" jsonb,
	"allowance_breakdown" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_performance_appraisals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"appraisal_ref" varchar(50) NOT NULL,
	"appraisal_type" varchar(30) NOT NULL,
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"review_period_start" timestamp with time zone,
	"review_period_end" timestamp with time zone,
	"reviewer" varchar(255),
	"reviewer_designation" varchar(255),
	"overall_score" numeric(4, 2),
	"overall_rating" varchar(30),
	"goals" jsonb,
	"competencies" jsonb,
	"strengths" text,
	"areas_for_improvement" text,
	"development_plan" jsonb,
	"promotion_recommendation" boolean DEFAULT false,
	"salary_revision" numeric(6, 2),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_social_insurance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_ref" varchar(50) NOT NULL,
	"record_type" varchar(30) NOT NULL,
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"scheme_name" varchar(255),
	"registration_number" varchar(100),
	"contribution_period" varchar(20),
	"employee_contribution" numeric(14, 2),
	"employer_contribution" numeric(14, 2),
	"total_contribution" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"contribution_rate" numeric(6, 2),
	"base_salary" numeric(14, 2),
	"filing_date" timestamp with time zone,
	"filing_ref" varchar(100),
	"filing_status" varchar(20),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hps_visa_residency_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"visa_ref" varchar(50) NOT NULL,
	"visa_type" varchar(30) NOT NULL,
	"employee_ref" varchar(50),
	"employee_name" varchar(255),
	"passport_number" varchar(100),
	"nationality" varchar(100),
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"sponsor_name" varchar(255),
	"sponsor_id" varchar(100),
	"residency_permit_no" varchar(100),
	"residency_issue_date" timestamp with time zone,
	"residency_expiry_date" timestamp with time zone,
	"medical_status" varchar(30),
	"medical_date" timestamp with time zone,
	"biometric_status" varchar(30),
	"biometric_date" timestamp with time zone,
	"renewal_date" timestamp with time zone,
	"cost" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "hps_attendance_time_trackings" ADD CONSTRAINT "hps_attendance_time_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_employee_profiles" ADD CONSTRAINT "hps_employee_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_gratuity_calculations" ADD CONSTRAINT "hps_gratuity_calculations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_leave_absences" ADD CONSTRAINT "hps_leave_absences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_payroll_processings" ADD CONSTRAINT "hps_payroll_processings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_performance_appraisals" ADD CONSTRAINT "hps_performance_appraisals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_social_insurance_records" ADD CONSTRAINT "hps_social_insurance_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hps_visa_residency_records" ADD CONSTRAINT "hps_visa_residency_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hps_attendance_tenant_idx" ON "hps_attendance_time_trackings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_attendance_ref_idx" ON "hps_attendance_time_trackings" USING btree ("attendance_ref");--> statement-breakpoint
CREATE INDEX "hps_attendance_status_idx" ON "hps_attendance_time_trackings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_attendance_employee_idx" ON "hps_attendance_time_trackings" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_attendance_date_idx" ON "hps_attendance_time_trackings" USING btree ("attendance_date");--> statement-breakpoint
CREATE INDEX "hps_employee_profiles_tenant_idx" ON "hps_employee_profiles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_employee_profiles_ref_idx" ON "hps_employee_profiles" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_employee_profiles_status_idx" ON "hps_employee_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_employee_profiles_dept_idx" ON "hps_employee_profiles" USING btree ("department");--> statement-breakpoint
CREATE INDEX "hps_gratuity_tenant_idx" ON "hps_gratuity_calculations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_gratuity_ref_idx" ON "hps_gratuity_calculations" USING btree ("calculation_ref");--> statement-breakpoint
CREATE INDEX "hps_gratuity_status_idx" ON "hps_gratuity_calculations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_gratuity_employee_idx" ON "hps_gratuity_calculations" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_leave_absences_tenant_idx" ON "hps_leave_absences" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_leave_absences_ref_idx" ON "hps_leave_absences" USING btree ("leave_ref");--> statement-breakpoint
CREATE INDEX "hps_leave_absences_status_idx" ON "hps_leave_absences" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_leave_absences_employee_idx" ON "hps_leave_absences" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_payroll_tenant_idx" ON "hps_payroll_processings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_payroll_ref_idx" ON "hps_payroll_processings" USING btree ("payroll_ref");--> statement-breakpoint
CREATE INDEX "hps_payroll_status_idx" ON "hps_payroll_processings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_payroll_employee_idx" ON "hps_payroll_processings" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_payroll_period_idx" ON "hps_payroll_processings" USING btree ("payroll_period");--> statement-breakpoint
CREATE INDEX "hps_perf_appraisals_tenant_idx" ON "hps_performance_appraisals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_perf_appraisals_ref_idx" ON "hps_performance_appraisals" USING btree ("appraisal_ref");--> statement-breakpoint
CREATE INDEX "hps_perf_appraisals_status_idx" ON "hps_performance_appraisals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_perf_appraisals_employee_idx" ON "hps_performance_appraisals" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_social_ins_tenant_idx" ON "hps_social_insurance_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_social_ins_ref_idx" ON "hps_social_insurance_records" USING btree ("record_ref");--> statement-breakpoint
CREATE INDEX "hps_social_ins_status_idx" ON "hps_social_insurance_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_social_ins_employee_idx" ON "hps_social_insurance_records" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_visa_tenant_idx" ON "hps_visa_residency_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hps_visa_ref_idx" ON "hps_visa_residency_records" USING btree ("visa_ref");--> statement-breakpoint
CREATE INDEX "hps_visa_status_idx" ON "hps_visa_residency_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hps_visa_employee_idx" ON "hps_visa_residency_records" USING btree ("employee_ref");--> statement-breakpoint
CREATE INDEX "hps_visa_expiry_idx" ON "hps_visa_residency_records" USING btree ("expiry_date");