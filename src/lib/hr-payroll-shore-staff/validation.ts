import { z } from "zod/v4";

// ==========================================
// Employee Master & Profile Management
// ==========================================
export const createEmployeeProfileSchema = z.object({
  employeeType: z.enum(["full_time", "part_time", "contract", "probation", "intern"]),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  nationalId: z.string().max(100).optional(),
  passportNumber: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().max(20).optional(),
  maritalStatus: z.string().max(20).optional(),
  department: z.string().max(255).optional(),
  designation: z.string().max(255).optional(),
  grade: z.string().max(50).optional(),
  reportingManager: z.string().max(255).optional(),
  joinDate: z.coerce.date().optional(),
  probationEndDate: z.coerce.date().optional(),
  basicSalary: z.string().optional(),
  salaryCurrency: z.string().max(3).optional(),
  bankName: z.string().max(255).optional(),
  bankAccountNumber: z.string().max(100).optional(),
  iban: z.string().max(50).optional(),
  emergencyContact: z.record(z.string(), z.unknown()).optional(),
  address: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateEmployeeProfileSchema = createEmployeeProfileSchema.partial();

// ==========================================
// Leave & Absence Management
// ==========================================
export const createLeaveAbsenceSchema = z.object({
  leaveType: z.enum(["annual", "sick", "maternity", "paternity", "hajj", "compassionate", "unpaid", "study"]),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  totalDays: z.string().optional(),
  reason: z.string().optional(),
  approver: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  leaveBalance: z.string().optional(),
  isHalfDay: z.boolean().optional(),
  attachmentUrl: z.string().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLeaveAbsenceSchema = createLeaveAbsenceSchema.partial();

// ==========================================
// Attendance & Time Tracking
// ==========================================
export const createAttendanceTimeTrackingSchema = z.object({
  attendanceType: z.enum(["regular", "overtime", "remote", "field", "shift"]),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  attendanceDate: z.coerce.date().optional(),
  checkInTime: z.coerce.date().optional(),
  checkOutTime: z.coerce.date().optional(),
  workHours: z.string().optional(),
  overtimeHours: z.string().optional(),
  breakHours: z.string().optional(),
  location: z.string().max(255).optional(),
  shiftName: z.string().max(100).optional(),
  isLate: z.boolean().optional(),
  lateMinutes: z.number().int().optional(),
  isEarlyLeave: z.boolean().optional(),
  earlyLeaveMinutes: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAttendanceTimeTrackingSchema = createAttendanceTimeTrackingSchema.partial();

// ==========================================
// Performance Appraisal Management
// ==========================================
export const createPerformanceAppraisalSchema = z.object({
  appraisalType: z.enum(["annual", "mid_year", "quarterly", "probation", "360_degree"]),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  reviewPeriodStart: z.coerce.date().optional(),
  reviewPeriodEnd: z.coerce.date().optional(),
  reviewer: z.string().max(255).optional(),
  reviewerDesignation: z.string().max(255).optional(),
  overallScore: z.string().optional(),
  overallRating: z.enum(["exceptional", "exceeds", "meets", "needs_improvement", "unsatisfactory"]).optional(),
  goals: z.array(z.record(z.string(), z.unknown())).optional(),
  competencies: z.array(z.record(z.string(), z.unknown())).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  developmentPlan: z.array(z.record(z.string(), z.unknown())).optional(),
  promotionRecommendation: z.boolean().optional(),
  salaryRevision: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePerformanceAppraisalSchema = createPerformanceAppraisalSchema.partial();

// ==========================================
// Payroll Processing WPS Compliance
// ==========================================
export const createPayrollProcessingSchema = z.object({
  payrollType: z.enum(["monthly", "supplementary", "final_settlement", "bonus"]),
  payrollPeriod: z.string().max(20).optional(),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  basicSalary: z.string().optional(),
  housingAllowance: z.string().optional(),
  transportAllowance: z.string().optional(),
  otherAllowances: z.string().optional(),
  totalAllowances: z.string().optional(),
  totalDeductions: z.string().optional(),
  grossPay: z.string().optional(),
  netPay: z.string().optional(),
  currency: z.string().max(3).optional(),
  wpsFileRef: z.string().max(100).optional(),
  wpsSubmissionDate: z.coerce.date().optional(),
  wpsStatus: z.enum(["pending", "submitted", "accepted", "rejected"]).optional(),
  bankName: z.string().max(255).optional(),
  iban: z.string().max(50).optional(),
  deductionBreakdown: z.array(z.record(z.string(), z.unknown())).optional(),
  allowanceBreakdown: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePayrollProcessingSchema = createPayrollProcessingSchema.partial();

// ==========================================
// GOSI PIFSS EPF Social Insurance
// ==========================================
export const createSocialInsuranceRecordSchema = z.object({
  recordType: z.enum(["gosi", "pifss", "epf", "pension", "social_security"]),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  schemeName: z.string().max(255).optional(),
  registrationNumber: z.string().max(100).optional(),
  contributionPeriod: z.string().max(20).optional(),
  employeeContribution: z.string().optional(),
  employerContribution: z.string().optional(),
  totalContribution: z.string().optional(),
  currency: z.string().max(3).optional(),
  contributionRate: z.string().optional(),
  baseSalary: z.string().optional(),
  filingDate: z.coerce.date().optional(),
  filingRef: z.string().max(100).optional(),
  filingStatus: z.enum(["pending", "filed", "accepted", "rejected"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSocialInsuranceRecordSchema = createSocialInsuranceRecordSchema.partial();

// ==========================================
// End of Service Gratuity Calculation
// ==========================================
export const createGratuityCalculationSchema = z.object({
  calculationType: z.enum(["resignation", "termination", "retirement", "end_of_contract", "death"]),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  joinDate: z.coerce.date().optional(),
  lastWorkingDate: z.coerce.date().optional(),
  totalYears: z.string().optional(),
  totalMonths: z.number().int().optional(),
  basicSalary: z.string().optional(),
  gratuityRate: z.string().optional(),
  grossGratuity: z.string().optional(),
  deductions: z.string().optional(),
  netGratuity: z.string().optional(),
  currency: z.string().max(3).optional(),
  calculationMethod: z.string().max(50).optional(),
  calculationBreakdown: z.record(z.string(), z.unknown()).optional(),
  deductionDetails: z.array(z.record(z.string(), z.unknown())).optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateGratuityCalculationSchema = createGratuityCalculationSchema.partial();

// ==========================================
// Visa & Residency Lifecycle Management
// ==========================================
export const createVisaResidencyRecordSchema = z.object({
  visaType: z.enum(["employment", "visit", "transit", "family", "investor", "golden"]),
  employeeRef: z.string().max(50).optional(),
  employeeName: z.string().max(255).optional(),
  passportNumber: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  sponsorName: z.string().max(255).optional(),
  sponsorId: z.string().max(100).optional(),
  residencyPermitNo: z.string().max(100).optional(),
  residencyIssueDate: z.coerce.date().optional(),
  residencyExpiryDate: z.coerce.date().optional(),
  medicalStatus: z.enum(["pending", "cleared", "failed"]).optional(),
  medicalDate: z.coerce.date().optional(),
  biometricStatus: z.enum(["pending", "completed"]).optional(),
  biometricDate: z.coerce.date().optional(),
  renewalDate: z.coerce.date().optional(),
  cost: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVisaResidencyRecordSchema = createVisaResidencyRecordSchema.partial();
