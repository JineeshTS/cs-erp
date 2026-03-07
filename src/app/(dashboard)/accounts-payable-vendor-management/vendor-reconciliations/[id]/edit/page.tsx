import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVendorReconciliation } from "@/lib/accounts-payable-vendor-management/service";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditVendorReconciliationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:edit")))
    redirect("/accounts-payable-vendor-management");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    {
      name: "vendorName",
      label: "Vendor Name",
      type: "text",
      required: true,
    },
    {
      name: "reconciliationDate",
      label: "Reconciliation Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "periodFrom",
      label: "Period From",
      type: "datetime-local",
    },
    {
      name: "periodTo",
      label: "Period To",
      type: "datetime-local",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "ourBalance",
      label: "Our Balance",
      type: "number",
      required: true,
    },
    {
      name: "vendorBalance",
      label: "Vendor Balance",
      type: "number",
      required: true,
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  const { id } = await params;
  const record = await getVendorReconciliation(id, session.tenantId);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    vendorName: record.vendorName,
    reconciliationDate: record.reconciliationDate
      ? new Date(record.reconciliationDate).toISOString()
      : "",
    periodFrom: record.periodFrom
      ? new Date(record.periodFrom).toISOString()
      : "",
    periodTo: record.periodTo
      ? new Date(record.periodTo).toISOString()
      : "",
    currency: record.currency ?? "",
    ourBalance: record.ourBalance != null ? Number(record.ourBalance) : "",
    vendorBalance:
      record.vendorBalance != null ? Number(record.vendorBalance) : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/accounts-payable-vendor-management/vendor-reconciliations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Vendor Reconciliation
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Vendor Reconciliation"
          apiPath={`/api/v1/accounts-payable-vendor-management/vendor-reconciliations/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/accounts-payable-vendor-management/vendor-reconciliations/${id}`}
        />
      </div>
    </div>
  );
}
