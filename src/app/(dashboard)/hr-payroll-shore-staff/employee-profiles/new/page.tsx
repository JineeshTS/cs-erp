import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

const EMPLOYEE_PROFILE_FIELDS: FieldConfig[] = [
  {
    name: "employeeType",
    label: "Employee Type",
    type: "select",
    required: true,
    options: [
      { value: "full_time", label: "Full Time" },
      { value: "part_time", label: "Part Time" },
      { value: "contract", label: "Contract" },
      { value: "probation", label: "Probation" },
      { value: "intern", label: "Intern" },
    ],
  },
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "nationalId", label: "National ID", type: "text" },
  { name: "passportNumber", label: "Passport Number", type: "text" },
  { name: "nationality", label: "Nationality", type: "text" },
  { name: "dateOfBirth", label: "Date of Birth", type: "datetime-local" },
  { name: "gender", label: "Gender", type: "text" },
  { name: "maritalStatus", label: "Marital Status", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "designation", label: "Designation", type: "text" },
  { name: "grade", label: "Grade", type: "text" },
  { name: "reportingManager", label: "Reporting Manager", type: "text" },
  { name: "joinDate", label: "Join Date", type: "datetime-local" },
  {
    name: "probationEndDate",
    label: "Probation End Date",
    type: "datetime-local",
  },
  { name: "basicSalary", label: "Basic Salary", type: "text" },
  {
    name: "salaryCurrency",
    label: "Salary Currency",
    type: "text",
    placeholder: "QAR",
  },
  { name: "bankName", label: "Bank Name", type: "text" },
  { name: "iban", label: "IBAN", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewEmployeeProfilePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "hr:create"))
  )
    redirect("/hr-payroll-shore-staff/employee-profiles");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/employee-profiles"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Employee Profile
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Employee Profile"
          apiPath="/api/v1/hr-payroll-shore-staff/employee-profiles"
          fields={EMPLOYEE_PROFILE_FIELDS}
          returnPath="/hr-payroll-shore-staff/employee-profiles"
        />
      </div>
    </div>
  );
}
