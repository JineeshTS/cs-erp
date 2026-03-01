import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVendorMaster } from "@/lib/accounts-payable-vendor-management/service";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";

const VENDOR_MASTER_FIELDS: FieldConfig[] = [
  { name: "vendorName", label: "Vendor Name", type: "text", required: true },
  { name: "tradingName", label: "Trading Name", type: "text" },
  {
    name: "vendorType",
    label: "Vendor Type",
    type: "select",
    required: true,
    options: [
      { value: "supplier", label: "Supplier" },
      { value: "contractor", label: "Contractor" },
      { value: "agent", label: "Agent" },
      { value: "port_authority", label: "Port Authority" },
      { value: "terminal", label: "Terminal" },
      { value: "carrier", label: "Carrier" },
      { value: "freight_forwarder", label: "Freight Forwarder" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "registrationNumber", label: "Registration Number", type: "text" },
  { name: "taxId", label: "Tax ID", type: "text" },
  { name: "industry", label: "Industry", type: "text" },
  { name: "country", label: "Country", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "paymentTerms", label: "Payment Terms", type: "text" },
  { name: "bankName", label: "Bank Name", type: "text" },
  { name: "bankAccountNumber", label: "Bank Account Number", type: "text" },
  { name: "bankSwiftCode", label: "Bank SWIFT Code", type: "text" },
  { name: "bankIban", label: "Bank IBAN", type: "text" },
  { name: "contactName", label: "Contact Name", type: "text" },
  { name: "contactEmail", label: "Contact Email", type: "text" },
  { name: "contactPhone", label: "Contact Phone", type: "text" },
  { name: "address", label: "Address", type: "textarea" },
  {
    name: "riskRating",
    label: "Risk Rating",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVendorMasterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:edit")))
    redirect("/accounts-payable-vendor-management/vendor-masters");

  const { id } = await params;
  const record = await getVendorMaster(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/accounts-payable-vendor-management/vendor-masters/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Vendor"
          apiPath={`/api/v1/accounts-payable-vendor-management/vendor-masters/${id}`}
          fields={VENDOR_MASTER_FIELDS}
          initialData={{
            vendorName: record.vendorName,
            tradingName: record.tradingName ?? "",
            vendorType: record.vendorType,
            registrationNumber: record.registrationNumber ?? "",
            taxId: record.taxId ?? "",
            industry: record.industry ?? "",
            country: record.country ?? "",
            currency: record.currency,
            paymentTerms: record.paymentTerms ?? "",
            bankName: record.bankName ?? "",
            bankAccountNumber: record.bankAccountNumber ?? "",
            bankSwiftCode: record.bankSwiftCode ?? "",
            bankIban: record.bankIban ?? "",
            contactName: record.contactName ?? "",
            contactEmail: record.contactEmail ?? "",
            contactPhone: record.contactPhone ?? "",
            address: record.address ?? "",
            riskRating: record.riskRating ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/accounts-payable-vendor-management/vendor-masters/${id}`}
        />
      </div>
    </div>
  );
}
