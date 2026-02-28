import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const CONTACT_FIELDS: FieldConfig[] = [
  { name: "customerId", label: "Customer ID", type: "text", required: true, placeholder: "UUID of the customer" },
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "jobTitle", label: "Job Title", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "isPrimary", label: "Primary Contact", type: "checkbox" },
  { name: "isDecisionMaker", label: "Decision Maker", type: "checkbox" },
  { name: "preferredLanguage", label: "Preferred Language", type: "select", options: [
    { value: "en", label: "English" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCustomerContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const sp = await searchParams;
  const customerId = sp.customerId ?? "";

  const initialData: Record<string, unknown> = {};
  if (customerId) {
    initialData.customerId = customerId;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/customer-contacts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Contact
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Contact"
          apiPath="/api/v1/sales-crm/customer-contacts"
          fields={CONTACT_FIELDS}
          initialData={Object.keys(initialData).length > 0 ? initialData : undefined}
          returnPath="/sales-crm/customer-contacts"
        />
      </div>
    </div>
  );
}
