import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPayrollAllotment } from "@/lib/crew-management/service";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditPayrollAllotmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:edit")))
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

  const { id } = await params;
  const record = await getPayrollAllotment(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/crew-management/payroll-allotments/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.allotmentRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.allotmentRef}
        </h1>
      </div>

      <CrmForm
        entityType="Payroll Allotment"
        apiPath={`/api/v1/crew-management/payroll-allotments/${record.id}`}
        fields={fields}
        initialData={record as unknown as Record<string, unknown>}
        isEdit
        returnPath={`/crew-management/payroll-allotments/${record.id}`}
      />
    </div>
  );
}
