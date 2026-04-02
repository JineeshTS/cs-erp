import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmQuotationLineItems } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditQuotationLineItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const currencyOpts = await getCurrencyOptions();

  const LINE_ITEM_FIELDS: FieldConfig[] = [
    { name: "quotationId", label: "Quotation ID", type: "text", required: true, placeholder: "UUID of the quotation" },
    { name: "chargeCode", label: "Charge Code", type: "text", required: true },
    { name: "chargeName", label: "Charge Name", type: "text", required: true },
    { name: "chargeType", label: "Charge Type", type: "select", required: true, options: [
      { value: "ocean_freight", label: "Ocean Freight" },
      { value: "thc", label: "THC" },
      { value: "documentation", label: "Documentation" },
      { value: "customs", label: "Customs" },
      { value: "inland", label: "Inland" },
      { value: "surcharge", label: "Surcharge" },
      { value: "other", label: "Other" },
    ]},
    { name: "basis", label: "Basis", type: "select", required: true, options: [
      { value: "per_container", label: "Per Container" },
      { value: "per_teu", label: "Per TEU" },
      { value: "per_bl", label: "Per B/L" },
      { value: "per_shipment", label: "Per Shipment" },
      { value: "lumpsum", label: "Lumpsum" },
    ]},
    { name: "unitPrice", label: "Unit Price", type: "number", required: true },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "totalPrice", label: "Total Price", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "isMandatory", label: "Mandatory", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(scmQuotationLineItems)
    .where(
      and(
        eq(scmQuotationLineItems.id, id),
        eq(scmQuotationLineItems.tenantId, session.tenantId),
        isNull(scmQuotationLineItems.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    quotationId: record.quotationId,
    chargeCode: record.chargeCode,
    chargeName: record.chargeName,
    chargeType: record.chargeType,
    basis: record.basis,
    unitPrice: record.unitPrice,
    quantity: record.quantity,
    totalPrice: record.totalPrice,
    currency: record.currency ?? "",
    containerType: record.containerType ?? "",
    containerSize: record.containerSize ?? "",
    isMandatory: record.isMandatory ?? false,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/quotation-line-items/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Line Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Quotation Line Item"
          apiPath={`/api/v1/sales-crm/quotation-line-items/${id}`}
          fields={LINE_ITEM_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/quotation-line-items/${id}`}
        />
      </div>
    </div>
  );
}
