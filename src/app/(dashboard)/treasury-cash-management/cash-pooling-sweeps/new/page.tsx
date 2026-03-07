import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewCashPoolingSweepPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/cash-pooling-sweeps");

  const currencyOpts = await getCurrencyOptions();

  const SWEEP_FIELDS: FieldConfig[] = [
    {
      name: "sweepType",
      label: "Sweep Type",
      type: "select",
      required: true,
      options: [
        { value: "zero_balance", label: "Zero Balance" },
        { value: "target_balance", label: "Target Balance" },
        { value: "threshold", label: "Threshold" },
        { value: "notional_pooling", label: "Notional Pooling" },
      ],
    },
    { name: "poolName", label: "Pool Name", type: "text" },
    { name: "masterAccountRef", label: "Master Account Ref", type: "text" },
    {
      name: "sweepDirection",
      label: "Sweep Direction",
      type: "select",
      options: [
        { value: "to_master", label: "To Master" },
        { value: "from_master", label: "From Master" },
        { value: "bidirectional", label: "Bidirectional" },
      ],
    },
    {
      name: "triggerBalance",
      label: "Trigger Balance",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "targetBalance",
      label: "Target Balance",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "sweepAmount",
      label: "Sweep Amount",
      type: "text",
      placeholder: "0.00",
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "frequency",
      label: "Frequency",
      type: "select",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "on_demand", label: "On Demand" },
      ],
    },
    {
      name: "lastExecutedAt",
      label: "Last Executed At",
      type: "datetime-local",
    },
    {
      name: "nextScheduledAt",
      label: "Next Scheduled At",
      type: "datetime-local",
    },
    {
      name: "interestRate",
      label: "Interest Rate",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "totalPoolBalance",
      label: "Total Pool Balance",
      type: "text",
      placeholder: "0.00",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/cash-pooling-sweeps"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cash Pooling Sweep
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Cash Pooling Sweep"
          apiPath="/api/v1/treasury-cash-management/cash-pooling-sweeps"
          fields={SWEEP_FIELDS}
          returnPath="/treasury-cash-management/cash-pooling-sweeps"
        />
      </div>
    </div>
  );
}
