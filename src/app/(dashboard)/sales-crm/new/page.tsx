import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCustomerOptions, getCountryOptions } from "@/lib/lookups";

export default async function NewCustomerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const [customerOpts, countryOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCountryOptions(),
  ]);

  const CUSTOMER_FIELDS: FieldConfig[] = [
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts, required: true },
    { name: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Acme Shipping Co." },
    { name: "tradeName", label: "Trade Name", type: "text" },
    { name: "customerType", label: "Customer Type", type: "select", options: [
      { value: "shipper", label: "Shipper" },
      { value: "consignee", label: "Consignee" },
      { value: "freight_forwarder", label: "Freight Forwarder" },
      { value: "nvocc", label: "NVOCC" },
      { value: "agent", label: "Agent" },
      { value: "broker", label: "Broker" },
    ]},
    { name: "tier", label: "Tier", type: "select", options: [
      { value: "platinum", label: "Platinum" },
      { value: "gold", label: "Gold" },
      { value: "silver", label: "Silver" },
      { value: "standard", label: "Standard" },
    ]},
    { name: "industry", label: "Industry", type: "text" },
    { name: "country", label: "Country Code", type: "select", options: countryOpts, required: true },
    { name: "city", label: "City", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "postalCode", label: "Postal Code", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text", placeholder: "contact@example.com" },
    { name: "website", label: "Website", type: "text" },
    { name: "taxRegistrationNo", label: "Tax Registration No.", type: "text" },
    { name: "creditLimitAmount", label: "Credit Limit (smallest unit)", type: "number" },
    { name: "creditCurrency", label: "Credit Currency", type: "text", placeholder: "USD" },
    { name: "paymentTermsDays", label: "Payment Terms (days)", type: "number" },
    { name: "annualRevenue", label: "Annual Revenue (smallest unit)", type: "number" },
    { name: "employeeCount", label: "Employee Count", type: "number" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
      { value: "blacklisted", label: "Blacklisted" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Customer
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Customer"
          apiPath="/api/v1/sales-crm/customers"
          fields={CUSTOMER_FIELDS}
          returnPath="/sales-crm"
        />
      </div>
    </div>
  );
}
