import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmCoaContracts } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

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
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCoaContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const row = await db
    .select()
    .from(cvmCoaContracts)
    .where(
      and(
        eq(cvmCoaContracts.id, id),
        eq(cvmCoaContracts.tenantId, session.tenantId),
        isNull(cvmCoaContracts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!row) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/coa-contracts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit COA Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="COA Contract"
          apiPath={`/api/v1/chartering-vessel-management/coa-contracts/${id}`}
          fields={COA_FIELDS}
          initialData={{
            contractReference: row.contractReference,
            chartererName: row.chartererName,
            cargoType: row.cargoType,
            cargoDescription: row.cargoDescription ?? "",
            quantityMin: row.quantityMin ?? "",
            quantityMax: row.quantityMax ?? "",
            quantityUnit: row.quantityUnit,
            liftingsPerPeriod: row.liftingsPerPeriod ?? "",
            periodFrom: row.periodFrom ? row.periodFrom.toISOString() : "",
            periodTo: row.periodTo ? row.periodTo.toISOString() : "",
            rate: row.rate,
            rateBasis: row.rateBasis,
            currency: row.currency,
            originPort: row.originPort ?? "",
            destinationPort: row.destinationPort ?? "",
            notes: row.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/coa-contracts/${id}`}
        />
      </div>
    </div>
  );
}
