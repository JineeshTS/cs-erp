import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";
import { getCurrencyOptions, getCountryOptions } from "@/lib/lookups";

export default async function NewCustomerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:create")))
    redirect("/master-data-management/customers");

  const [currencyOpts, countryOpts] = await Promise.all([
    getCurrencyOptions(),
    getCountryOptions(),
  ]);

  const CUSTOMER_FIELDS = [
    {
      name: "customerType",
      label: "Customer Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "shipper", label: "Shipper" },
        { value: "consignee", label: "Consignee" },
        { value: "agent", label: "Agent" },
        { value: "freight_forwarder", label: "Freight Forwarder" },
        { value: "carrier", label: "Carrier" },
        { value: "customs_broker", label: "Customs Broker" },
      ],
    },
    { name: "name", label: "Company Name", type: "text" as const, required: true },
    { name: "shortName", label: "Short Name", type: "text" as const },
    { name: "taxId", label: "Tax ID", type: "text" as const },
    { name: "registrationNumber", label: "Registration Number", type: "text" as const },
    { name: "country", label: "Country (2-letter)", type: "select" as const, options: countryOpts },
    { name: "city", label: "City", type: "text" as const },
    { name: "address", label: "Address", type: "textarea" as const },
    { name: "postalCode", label: "Postal Code", type: "text" as const },
    { name: "phone", label: "Phone", type: "text" as const },
    { name: "email", label: "Email", type: "text" as const },
    { name: "website", label: "Website", type: "text" as const },
    { name: "creditLimitAmount", label: "Credit Limit", type: "number" as const },
    { name: "creditLimitCurrency", label: "Credit Currency", type: "select" as const, options: currencyOpts },
    { name: "paymentTermsDays", label: "Payment Terms (days)", type: "number" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/customers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Customer"
          apiPath="/api/v1/master-data-management/customers"
          fields={CUSTOMER_FIELDS}
          returnPath="/master-data-management/customers"
        />
      </div>
    </div>
  );
}
