import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewDocumentAmendmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "operations:create"))
  )
    redirect("/operations-documentation");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    { name: "blId", label: "BL ID", type: "text", required: true },
    {
      name: "amendmentNumber",
      label: "Amendment Number",
      type: "text",
      required: true,
    },
    {
      name: "amendmentType",
      label: "Amendment Type",
      type: "text",
      required: true,
    },
    {
      name: "fieldChanged",
      label: "Field Changed",
      type: "text",
      required: true,
    },
    { name: "oldValue", label: "Old Value", type: "textarea" },
    { name: "newValue", label: "New Value", type: "textarea" },
    { name: "reason", label: "Reason", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    { name: "fee", label: "Fee", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/operations-documentation/document-amendments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Document Amendment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Document Amendment"
          apiPath="/api/v1/operations-documentation/document-amendments"
          fields={FIELDS}
          returnPath="/operations-documentation/document-amendments"
        />
      </div>
    </div>
  );
}
