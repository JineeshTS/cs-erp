import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewCoaContractPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const COA_FIELDS: FieldConfig[] = [
    { name: "contractReference", label: "Contract Reference", type: "text", required: true },
    { name: "chartererName", label: "Charterer Name", type: "text", required: true },
    { name: "cargoType", label: "Cargo Type", type: "text", required: true },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "quantityMin", label: "Quantity Min", type: "number" },
    { name: "quantityMax", label: "Quantity Max", type: "number" },
    {
      name: "quantityUnit",
      label: "Quantity Unit",
      type: "select",
      options: [
        { value: "MT", label: "MT" },
        { value: "TEU", label: "TEU" },
      ],
    },
    { name: "liftingsPerPeriod", label: "Liftings Per Period", type: "number" },
    { name: "periodFrom", label: "Period From", type: "datetime-local", required: true },
    { name: "periodTo", label: "Period To", type: "datetime-local", required: true },
    { name: "rate", label: "Rate", type: "number", required: true },
    {
      name: "rateBasis",
      label: "Rate Basis",
      type: "select",
      options: [
        { value: "per_mt", label: "Per MT" },
        { value: "per_teu", label: "Per TEU" },
        { value: "lumpsum", label: "Lumpsum" },
      ],
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/coa-contracts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New COA Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="COA Contract"
          apiPath="/api/v1/chartering-vessel-management/coa-contracts"
          fields={COA_FIELDS}
          returnPath="/chartering-vessel-management/coa-contracts"
        />
      </div>
    </div>
  );
}
