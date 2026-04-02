import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewPayrollAllotmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:create")))
    redirect("/");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "crewMemberName", label: "Crew Member Name", type: "text", required: true },
    { name: "rank", label: "Rank", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "payrollMonth", label: "Payroll Month", type: "number", required: true },
    { name: "payrollYear", label: "Payroll Year", type: "number", required: true },
    { name: "baseSalary", label: "Base Salary", type: "number" },
    { name: "overtimeHours", label: "Overtime Hours", type: "number" },
    { name: "overtimeRate", label: "Overtime Rate", type: "number" },
    { name: "overtimeAmount", label: "Overtime Amount", type: "number" },
    { name: "leavePay", label: "Leave Pay", type: "number" },
    { name: "bonuses", label: "Bonuses", type: "number" },
    { name: "deductions", label: "Deductions", type: "number" },
    { name: "netPay", label: "Net Pay", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "allotmentAmount", label: "Allotment Amount", type: "number" },
    { name: "allotmentBeneficiary", label: "Allotment Beneficiary", type: "text" },
    { name: "allotmentBank", label: "Allotment Bank", type: "text" },
    { name: "allotmentAccount", label: "Allotment Account", type: "text" },
    { name: "paymentMethod", label: "Payment Method", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/crew-management/payroll-allotments"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Payroll Allotments
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New Payroll Allotment
        </h1>
      </div>

      <CrmForm
        entityType="Payroll Allotment"
        apiPath="/api/v1/crew-management/payroll-allotments"
        fields={fields}
        returnPath="/crew-management/payroll-allotments"
      />
    </div>
  );
}
