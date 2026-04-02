import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewOnHireOffHirePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:create")))
    redirect("/equipment-control-yard-managem/on-hire-off-hire");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const HIRE_FIELDS: FieldConfig[] = [
    { name: "contractReference", label: "Contract Reference", type: "text", required: true, placeholder: "HC-2026-001" },
    { name: "containerNumber", label: "Container Number", type: "text", required: true, placeholder: "ABCU1234567" },
    { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
    { name: "lessorName", label: "Lessor Name", type: "select", options: customerOpts },
    { name: "lesseeName", label: "Lessee Name", type: "select", options: customerOpts },
    { name: "hireType", label: "Hire Type", type: "select", required: true, options: [
      { value: "on_hire", label: "On Hire" },
      { value: "off_hire", label: "Off Hire" },
    ]},
    { name: "onHireDate", label: "On-Hire Date", type: "datetime-local", required: true },
    { name: "offHireDate", label: "Off-Hire Date", type: "datetime-local" },
    { name: "onHireLocation", label: "On-Hire Location", type: "select", options: portOpts },
    { name: "offHireLocation", label: "Off-Hire Location", type: "select", options: portOpts },
    { name: "dailyRate", label: "Daily Rate", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "totalDays", label: "Total Days", type: "number" },
    { name: "totalCost", label: "Total Cost", type: "number" },
    { name: "conditionOnHire", label: "Condition On Hire", type: "text" },
    { name: "conditionOffHire", label: "Condition Off Hire", type: "text" },
    { name: "damageCharges", label: "Damage Charges", type: "number" },
    { name: "cleaningCharges", label: "Cleaning Charges", type: "number" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "pending_off_hire", label: "Pending Off-Hire" },
      { value: "off_hired", label: "Off-Hired" },
      { value: "disputed", label: "Disputed" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/on-hire-off-hire"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Hire Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="On-Hire/Off-Hire"
          apiPath="/api/v1/equipment-control-yard-managem/on-hire-off-hire"
          fields={HIRE_FIELDS}
          returnPath="/equipment-control-yard-managem/on-hire-off-hire"
        />
      </div>
    </div>
  );
}
