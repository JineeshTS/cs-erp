import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmCustomers } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const CUSTOMER_FIELDS: FieldConfig[] = [
  { name: "customerCode", label: "Customer Code", type: "text", required: true },
  { name: "companyName", label: "Company Name", type: "text", required: true },
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
  { name: "country", label: "Country Code", type: "text", required: true },
  { name: "city", label: "City", type: "text" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "postalCode", label: "Postal Code", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "website", label: "Website", type: "text" },
  { name: "taxRegistrationNo", label: "Tax Registration No.", type: "text" },
  { name: "creditLimitAmount", label: "Credit Limit (smallest unit)", type: "number" },
  { name: "creditCurrency", label: "Credit Currency", type: "text" },
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

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const { id } = await params;
  const record = await db
    .select()
    .from(scmCustomers)
    .where(
      and(
        eq(scmCustomers.id, id),
        eq(scmCustomers.tenantId, session.tenantId),
        isNull(scmCustomers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    customerCode: record.customerCode,
    companyName: record.companyName,
    tradeName: record.tradeName ?? "",
    customerType: record.customerType,
    tier: record.tier ?? "",
    industry: record.industry ?? "",
    country: record.country,
    city: record.city ?? "",
    address: record.address ?? "",
    postalCode: record.postalCode ?? "",
    phone: record.phone ?? "",
    email: record.email ?? "",
    website: record.website ?? "",
    taxRegistrationNo: record.taxRegistrationNo ?? "",
    creditLimitAmount: record.creditLimitAmount ?? "",
    creditCurrency: record.creditCurrency ?? "",
    paymentTermsDays: record.paymentTermsDays ?? "",
    annualRevenue: record.annualRevenue ?? "",
    employeeCount: record.employeeCount ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Customer
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Customer"
          apiPath={`/api/v1/sales-crm/customers/${id}`}
          fields={CUSTOMER_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/${id}`}
        />
      </div>
    </div>
  );
}
