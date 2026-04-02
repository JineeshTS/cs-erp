import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFreightContract } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditFreightContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/freight-contracts");

  const currencyOpts = await getCurrencyOptions();

  const FREIGHT_CONTRACT_FIELDS: FieldConfig[] = [
    {
      name: "contractType",
      label: "Contract Type",
      type: "select",
      required: true,
      options: [
        { value: "spot_rate", label: "Spot Rate" },
        { value: "long_term", label: "Long Term" },
        { value: "ffa_settlement", label: "FFA Settlement" },
        { value: "index_linked", label: "Index Linked" },
        { value: "hybrid_contract", label: "Hybrid Contract" },
      ],
    },
    { name: "counterparty", label: "Counterparty", type: "text" },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "contractedRate", label: "Contracted Rate", type: "text" },
    { name: "spotRate", label: "Spot Rate", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "volumeTeu", label: "Volume TEU", type: "number" },
    { name: "startDate", label: "Start Date", type: "datetime-local" },
    { name: "endDate", label: "End Date", type: "datetime-local" },
    { name: "settlementBasis", label: "Settlement Basis", type: "text" },
    { name: "indexReference", label: "Index Reference", type: "text" },
    { name: "markToMarketValue", label: "Mark to Market Value", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getFreightContract(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/freight-contracts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Freight Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Freight Contract"
          apiPath={`/api/v1/liner-revenue-management/freight-contracts/${id}`}
          fields={FREIGHT_CONTRACT_FIELDS}
          initialData={{
            contractType: record.contractType,
            counterparty: record.counterparty ?? "",
            tradeLane: record.tradeLane ?? "",
            contractedRate: record.contractedRate ?? "",
            spotRate: record.spotRate ?? "",
            currency: record.currency ?? "",
            volumeTeu: record.volumeTeu ?? "",
            startDate: record.startDate ? record.startDate.toISOString().slice(0, 16) : "",
            endDate: record.endDate ? record.endDate.toISOString().slice(0, 16) : "",
            settlementBasis: record.settlementBasis ?? "",
            indexReference: record.indexReference ?? "",
            markToMarketValue: record.markToMarketValue ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/freight-contracts/${id}`}
        />
      </div>
    </div>
  );
}
