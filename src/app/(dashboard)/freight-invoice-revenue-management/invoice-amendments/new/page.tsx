import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FirmForm } from "@/components/freight-invoice-revenue-management/firm-form";
import type { FieldConfig } from "@/components/freight-invoice-revenue-management/firm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewInvoiceAmendmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "invoice:create"))
  )
    redirect("/freight-invoice-revenue-management/invoice-amendments");

  const currencyOpts = await getCurrencyOptions();

  const AMENDMENT_FIELDS: FieldConfig[] = [
    {
      name: "originalInvoiceId",
      label: "Original Invoice ID",
      type: "text",
      required: true,
    },
    {
      name: "originalInvoiceNumber",
      label: "Original Invoice Number",
      type: "text",
      required: true,
    },
    {
      name: "amendmentType",
      label: "Amendment Type",
      type: "select",
      required: true,
      options: [
        { value: "correction", label: "Correction" },
        { value: "rate_change", label: "Rate Change" },
        { value: "quantity_change", label: "Quantity Change" },
        { value: "charge_addition", label: "Charge Addition" },
        { value: "charge_removal", label: "Charge Removal" },
        { value: "full_reissue", label: "Full Reissue" },
      ],
    },
    { name: "reason", label: "Reason", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "previousAmount",
      label: "Previous Amount",
      type: "number",
      required: true,
    },
    {
      name: "newAmount",
      label: "New Amount",
      type: "number",
      required: true,
    },
    {
      name: "adjustmentAmount",
      label: "Adjustment Amount",
      type: "number",
      required: true,
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/invoice-amendments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Invoice Amendment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Amendment"
          apiPath="/api/v1/freight-invoice-revenue-management/invoice-amendments"
          fields={AMENDMENT_FIELDS}
          returnPath="/freight-invoice-revenue-management/invoice-amendments"
        />
      </div>
    </div>
  );
}
