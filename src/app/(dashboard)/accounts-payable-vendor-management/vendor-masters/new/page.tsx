import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";
import { getCurrencyOptions, getCountryOptions } from "@/lib/lookups";

export default async function NewVendorMasterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:create")))
    redirect("/accounts-payable-vendor-management/vendor-masters");

  const [currencyOpts, countryOpts] = await Promise.all([
    getCurrencyOptions(),
    getCountryOptions(),
  ]);

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
    { name: "country", label: "Country", type: "select", options: countryOpts },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/vendor-masters"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Vendor</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Vendor"
          apiPath="/api/v1/accounts-payable-vendor-management/vendor-masters"
          fields={VENDOR_MASTER_FIELDS}
          returnPath="/accounts-payable-vendor-management/vendor-masters"
        />
      </div>
    </div>
  );
}
