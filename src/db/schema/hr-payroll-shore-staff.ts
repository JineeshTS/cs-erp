import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Employee Master & Profile Management
// ==========================================
export const hpsEmployeeProfiles = pgTable(
  "hps_employee_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    employeeRef: varchar("employee_ref", { length: 50 }).notNull(),
    employeeType: varchar("employee_type", { length: 30 }).notNull(), // full_time, part_time, contract, probation, intern
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    nationalId: varchar("national_id", { length: 100 }),
    passportNumber: varchar("passport_number", { length: 100 }),
    nationality: varchar("nationality", { length: 100 }),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    gender: varchar("gender", { length: 20 }),
    maritalStatus: varchar("marital_status", { length: 20 }),
    department: varchar("department", { length: 255 }),
    designation: varchar("designation", { length: 255 }),
    grade: varchar("grade", { length: 50 }),
    reportingManager: varchar("reporting_manager", { length: 255 }),
    joinDate: timestamp("join_date", { withTimezone: true }),
    probationEndDate: timestamp("probation_end_date", { withTimezone: true }),
    basicSalary: decimal("basic_salary", { precision: 14, scale: 2 }),
    salaryCurrency: varchar("salary_currency", { length: 3 }).default("QAR"),
    bankName: varchar("bank_name", { length: 255 }),
    bankAccountNumber: varchar("bank_account_number", { length: 100 }),
    iban: varchar("iban", { length: 50 }),
    emergencyContact: jsonb("emergency_contact"), // { name, phone, relation }
    address: jsonb("address"), // { line1, line2, city, state, country, postalCode }
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_employee_profiles_tenant_idx").on(t.tenantId),
    index("hps_employee_profiles_ref_idx").on(t.employeeRef),
    index("hps_employee_profiles_status_idx").on(t.status),
    index("hps_employee_profiles_dept_idx").on(t.department),
  ]
);

// ==========================================
// Leave & Absence Management
// ==========================================
export const hpsLeaveAbsences = pgTable(
  "hps_leave_absences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    leaveRef: varchar("leave_ref", { length: 50 }).notNull(),
    leaveType: varchar("leave_type", { length: 30 }).notNull(), // annual, sick, maternity, paternity, hajj, compassionate, unpaid, study
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    totalDays: decimal("total_days", { precision: 6, scale: 1 }),
    reason: text("reason"),
    approver: varchar("approver", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    leaveBalance: decimal("leave_balance", { precision: 6, scale: 1 }),
    isHalfDay: boolean("is_half_day").default(false),
    attachmentUrl: text("attachment_url"),
    rejectionReason: text("rejection_reason"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_leave_absences_tenant_idx").on(t.tenantId),
    index("hps_leave_absences_ref_idx").on(t.leaveRef),
    index("hps_leave_absences_status_idx").on(t.status),
    index("hps_leave_absences_employee_idx").on(t.employeeRef),
  ]
);

// ==========================================
// Attendance & Time Tracking
// ==========================================
export const hpsAttendanceTimeTrackings = pgTable(
  "hps_attendance_time_trackings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    attendanceRef: varchar("attendance_ref", { length: 50 }).notNull(),
    attendanceType: varchar("attendance_type", { length: 30 }).notNull(), // regular, overtime, remote, field, shift
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    attendanceDate: timestamp("attendance_date", { withTimezone: true }),
    checkInTime: timestamp("check_in_time", { withTimezone: true }),
    checkOutTime: timestamp("check_out_time", { withTimezone: true }),
    workHours: decimal("work_hours", { precision: 6, scale: 2 }),
    overtimeHours: decimal("overtime_hours", { precision: 6, scale: 2 }),
    breakHours: decimal("break_hours", { precision: 6, scale: 2 }),
    location: varchar("location", { length: 255 }),
    shiftName: varchar("shift_name", { length: 100 }),
    isLate: boolean("is_late").default(false),
    lateMinutes: integer("late_minutes"),
    isEarlyLeave: boolean("is_early_leave").default(false),
    earlyLeaveMinutes: integer("early_leave_minutes"),
    status: varchar("status", { length: 20 }).notNull().default("present"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_attendance_tenant_idx").on(t.tenantId),
    index("hps_attendance_ref_idx").on(t.attendanceRef),
    index("hps_attendance_status_idx").on(t.status),
    index("hps_attendance_employee_idx").on(t.employeeRef),
    index("hps_attendance_date_idx").on(t.attendanceDate),
  ]
);

// ==========================================
// Performance Appraisal Management
// ==========================================
export const hpsPerformanceAppraisals = pgTable(
  "hps_performance_appraisals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    appraisalRef: varchar("appraisal_ref", { length: 50 }).notNull(),
    appraisalType: varchar("appraisal_type", { length: 30 }).notNull(), // annual, mid_year, quarterly, probation, 360_degree
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    reviewPeriodStart: timestamp("review_period_start", { withTimezone: true }),
    reviewPeriodEnd: timestamp("review_period_end", { withTimezone: true }),
    reviewer: varchar("reviewer", { length: 255 }),
    reviewerDesignation: varchar("reviewer_designation", { length: 255 }),
    overallScore: decimal("overall_score", { precision: 4, scale: 2 }),
    overallRating: varchar("overall_rating", { length: 30 }), // exceptional, exceeds, meets, needs_improvement, unsatisfactory
    goals: jsonb("goals"), // [{ goal, weight, score, comments }]
    competencies: jsonb("competencies"), // [{ competency, weight, score, comments }]
    strengths: text("strengths"),
    areasForImprovement: text("areas_for_improvement"),
    developmentPlan: jsonb("development_plan"), // [{ action, timeline, status }]
    promotionRecommendation: boolean("promotion_recommendation").default(false),
    salaryRevision: decimal("salary_revision", { precision: 6, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_perf_appraisals_tenant_idx").on(t.tenantId),
    index("hps_perf_appraisals_ref_idx").on(t.appraisalRef),
    index("hps_perf_appraisals_status_idx").on(t.status),
    index("hps_perf_appraisals_employee_idx").on(t.employeeRef),
  ]
);

// ==========================================
// Payroll Processing WPS Compliance
// ==========================================
export const hpsPayrollProcessings = pgTable(
  "hps_payroll_processings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    payrollRef: varchar("payroll_ref", { length: 50 }).notNull(),
    payrollType: varchar("payroll_type", { length: 30 }).notNull(), // monthly, supplementary, final_settlement, bonus
    payrollPeriod: varchar("payroll_period", { length: 20 }), // YYYY-MM
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    basicSalary: decimal("basic_salary", { precision: 14, scale: 2 }),
    housingAllowance: decimal("housing_allowance", { precision: 14, scale: 2 }),
    transportAllowance: decimal("transport_allowance", { precision: 14, scale: 2 }),
    otherAllowances: decimal("other_allowances", { precision: 14, scale: 2 }),
    totalAllowances: decimal("total_allowances", { precision: 14, scale: 2 }),
    totalDeductions: decimal("total_deductions", { precision: 14, scale: 2 }),
    grossPay: decimal("gross_pay", { precision: 14, scale: 2 }),
    netPay: decimal("net_pay", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    wpsFileRef: varchar("wps_file_ref", { length: 100 }),
    wpsSubmissionDate: timestamp("wps_submission_date", { withTimezone: true }),
    wpsStatus: varchar("wps_status", { length: 20 }), // pending, submitted, accepted, rejected
    bankName: varchar("bank_name", { length: 255 }),
    iban: varchar("iban", { length: 50 }),
    deductionBreakdown: jsonb("deduction_breakdown"), // [{ type, amount }]
    allowanceBreakdown: jsonb("allowance_breakdown"), // [{ type, amount }]
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_payroll_tenant_idx").on(t.tenantId),
    index("hps_payroll_ref_idx").on(t.payrollRef),
    index("hps_payroll_status_idx").on(t.status),
    index("hps_payroll_employee_idx").on(t.employeeRef),
    index("hps_payroll_period_idx").on(t.payrollPeriod),
  ]
);

// ==========================================
// GOSI PIFSS EPF Social Insurance
// ==========================================
export const hpsSocialInsuranceRecords = pgTable(
  "hps_social_insurance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    recordType: varchar("record_type", { length: 30 }).notNull(), // gosi, pifss, epf, pension, social_security
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    schemeName: varchar("scheme_name", { length: 255 }),
    registrationNumber: varchar("registration_number", { length: 100 }),
    contributionPeriod: varchar("contribution_period", { length: 20 }), // YYYY-MM
    employeeContribution: decimal("employee_contribution", { precision: 14, scale: 2 }),
    employerContribution: decimal("employer_contribution", { precision: 14, scale: 2 }),
    totalContribution: decimal("total_contribution", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    contributionRate: decimal("contribution_rate", { precision: 6, scale: 2 }),
    baseSalary: decimal("base_salary", { precision: 14, scale: 2 }),
    filingDate: timestamp("filing_date", { withTimezone: true }),
    filingRef: varchar("filing_ref", { length: 100 }),
    filingStatus: varchar("filing_status", { length: 20 }), // pending, filed, accepted, rejected
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_social_ins_tenant_idx").on(t.tenantId),
    index("hps_social_ins_ref_idx").on(t.recordRef),
    index("hps_social_ins_status_idx").on(t.status),
    index("hps_social_ins_employee_idx").on(t.employeeRef),
  ]
);

// ==========================================
// End of Service Gratuity Calculation
// ==========================================
export const hpsGratuityCalculations = pgTable(
  "hps_gratuity_calculations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    calculationRef: varchar("calculation_ref", { length: 50 }).notNull(),
    calculationType: varchar("calculation_type", { length: 30 }).notNull(), // resignation, termination, retirement, end_of_contract, death
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    joinDate: timestamp("join_date", { withTimezone: true }),
    lastWorkingDate: timestamp("last_working_date", { withTimezone: true }),
    totalYears: decimal("total_years", { precision: 6, scale: 2 }),
    totalMonths: integer("total_months"),
    basicSalary: decimal("basic_salary", { precision: 14, scale: 2 }),
    gratuityRate: decimal("gratuity_rate", { precision: 6, scale: 4 }),
    grossGratuity: decimal("gross_gratuity", { precision: 14, scale: 2 }),
    deductions: decimal("deductions", { precision: 14, scale: 2 }),
    netGratuity: decimal("net_gratuity", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    calculationMethod: varchar("calculation_method", { length: 50 }), // qatar_labor_law, uae_labor_law, ksa_labor_law, india_gratuity_act
    calculationBreakdown: jsonb("calculation_breakdown"), // { firstFiveYears, afterFiveYears, ... }
    deductionDetails: jsonb("deduction_details"), // [{ type, amount }]
    approvedBy: varchar("approved_by", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    paymentDate: timestamp("payment_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_gratuity_tenant_idx").on(t.tenantId),
    index("hps_gratuity_ref_idx").on(t.calculationRef),
    index("hps_gratuity_status_idx").on(t.status),
    index("hps_gratuity_employee_idx").on(t.employeeRef),
  ]
);

// ==========================================
// Visa & Residency Lifecycle Management
// ==========================================
export const hpsVisaResidencyRecords = pgTable(
  "hps_visa_residency_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    visaRef: varchar("visa_ref", { length: 50 }).notNull(),
    visaType: varchar("visa_type", { length: 30 }).notNull(), // employment, visit, transit, family, investor, golden
    employeeRef: varchar("employee_ref", { length: 50 }),
    employeeName: varchar("employee_name", { length: 255 }),
    passportNumber: varchar("passport_number", { length: 100 }),
    nationality: varchar("nationality", { length: 100 }),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    sponsorName: varchar("sponsor_name", { length: 255 }),
    sponsorId: varchar("sponsor_id", { length: 100 }),
    residencyPermitNo: varchar("residency_permit_no", { length: 100 }),
    residencyIssueDate: timestamp("residency_issue_date", { withTimezone: true }),
    residencyExpiryDate: timestamp("residency_expiry_date", { withTimezone: true }),
    medicalStatus: varchar("medical_status", { length: 30 }), // pending, cleared, failed
    medicalDate: timestamp("medical_date", { withTimezone: true }),
    biometricStatus: varchar("biometric_status", { length: 30 }), // pending, completed
    biometricDate: timestamp("biometric_date", { withTimezone: true }),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    cost: decimal("cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("hps_visa_tenant_idx").on(t.tenantId),
    index("hps_visa_ref_idx").on(t.visaRef),
    index("hps_visa_status_idx").on(t.status),
    index("hps_visa_employee_idx").on(t.employeeRef),
    index("hps_visa_expiry_idx").on(t.expiryDate),
  ]
);
