import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewTcContractPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  const [vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const TC_FIELDS: FieldConfig[] = [
    {
      name: "direction",
      label: "Direction",
      type: "select",
      required: true,
      options: [
        { value: "tc_in", label: "TC In" },
        { value: "tc_out", label: "TC Out" },
      ],
    },
    { name: "contractReference", label: "Contract Reference", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "counterpartyName", label: "Counterparty Name", type: "select", options: customerOpts, required: true },
    { name: "brokerName", label: "Broker Name", type: "text" },
    { name: "hireRate", label: "Hire Rate", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "hirePeriodUnit",
      label: "Hire Period Unit",
      type: "select",
      options: [
        { value: "day", label: "Day" },
        { value: "month", label: "Month" },
      ],
    },
    { name: "deliveryPort", label: "Delivery Port", type: "text" },
    { name: "redeliveryPort", label: "Redelivery Port", type: "text" },
    { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
    { name: "redeliveryDate", label: "Redelivery Date", type: "datetime-local" },
    { name: "minDuration", label: "Min Duration", type: "number" },
    { name: "maxDuration", label: "Max Duration", type: "number" },
    {
      name: "durationUnit",
      label: "Duration Unit",
      type: "select",
      options: [
        { value: "days", label: "Days" },
        { value: "months", label: "Months" },
      ],
    },
    { name: "commissionPercent", label: "Commission %", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/tc-contracts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New TC Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="TC Contract"
          apiPath="/api/v1/chartering-vessel-management/tc-contracts"
          fields={TC_FIELDS}
          returnPath="/chartering-vessel-management/tc-contracts"
        />
      </div>
    </div>
  );
}
