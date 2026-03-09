import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewLeasedContainerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:create")))
    redirect("/equipment-control-yard-managem/leased-containers");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const LEASE_FIELDS: FieldConfig[] = [
    { name: "leaseReference", label: "Lease Reference", type: "text", required: true, placeholder: "LSE-2026-001" },
    { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text", required: true, placeholder: "ABCU1234567" },
    { name: "lessorName", label: "Lessor Name", type: "select", required: true, options: customerOpts },
    { name: "lessorCode", label: "Lessor Code", type: "text" },
    { name: "leaseType", label: "Lease Type", type: "select", options: [
      { value: "master", label: "Master" },
      { value: "spot", label: "Spot" },
      { value: "long_term", label: "Long Term" },
      { value: "short_term", label: "Short Term" },
    ]},
    { name: "leaseStartDate", label: "Lease Start Date", type: "datetime-local", required: true },
    { name: "leaseEndDate", label: "Lease End Date", type: "datetime-local" },
    { name: "dailyRate", label: "Daily Rate", type: "number" },
    { name: "monthlyRate", label: "Monthly Rate", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "billingCycle", label: "Billing Cycle", type: "select", options: [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
    ]},
    { name: "pickUpLocation", label: "Pick-Up Location", type: "select", options: portOpts },
    { name: "dropOffLocation", label: "Drop-Off Location", type: "select", options: portOpts },
    { name: "minimumLeaseDays", label: "Minimum Lease Days", type: "number" },
    { name: "penaltyRate", label: "Penalty Rate", type: "number" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "expiring", label: "Expiring" },
      { value: "expired", label: "Expired" },
      { value: "terminated", label: "Terminated" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/leased-containers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Lease Agreement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Leased Container"
          apiPath="/api/v1/equipment-control-yard-managem/leased-containers"
          fields={LEASE_FIELDS}
          returnPath="/equipment-control-yard-managem/leased-containers"
        />
      </div>
    </div>
  );
}
