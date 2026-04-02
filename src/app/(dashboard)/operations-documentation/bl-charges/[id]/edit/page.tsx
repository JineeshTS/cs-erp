import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmBlCharges } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditBlChargePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation/bl-charges");

  const currencyOpts = await getCurrencyOptions();

  const CHARGE_FIELDS: FieldConfig[] = [
    { name: "chargeCode", label: "Charge Code", type: "text", required: true },
    { name: "chargeName", label: "Charge Name", type: "text", required: true },
    { name: "chargeType", label: "Charge Type", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "prepaidCollect", label: "Prepaid/Collect", type: "select", options: [
      { value: "prepaid", label: "Prepaid" },
      { value: "collect", label: "Collect" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(odmBlCharges)
    .where(
      and(
        eq(odmBlCharges.id, id),
        eq(odmBlCharges.tenantId, session.tenantId),
        isNull(odmBlCharges.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    chargeCode: record.chargeCode,
    chargeName: record.chargeName,
    chargeType: record.chargeType,
    amount: record.amount,
    currency: record.currency ?? "",
    prepaidCollect: record.prepaidCollect ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/operations-documentation/bl-charges/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit BL Charge</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="BL Charge"
          apiPath={`/api/v1/operations-documentation/bl-charges/${id}`}
          fields={CHARGE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/bl-charges/${id}`}
        />
      </div>
    </div>
  );
}
