import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ApvmForm } from "@/components/accounts-payable-vendor-management/apvm-form";
import type { FieldConfig } from "@/components/accounts-payable-vendor-management/apvm-form";

const THREE_WAY_MATCH_FIELDS: FieldConfig[] = [
  { name: "vendorName", label: "Vendor Name", type: "text", required: true },
  { name: "invoiceNumber", label: "Invoice Number", type: "text" },
  { name: "poNumber", label: "PO Number", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "poAmount", label: "PO Amount", type: "number", required: true },
  { name: "grAmount", label: "GR Amount", type: "number", required: true },
  { name: "invoiceAmount", label: "Invoice Amount", type: "number", required: true },
  { name: "tolerancePercent", label: "Tolerance Percent", type: "number" },
  { name: "exceptionReason", label: "Exception Reason", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewThreeWayMatchPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/three-way-matches"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Three-Way Match</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Three-Way Match"
          fields={THREE_WAY_MATCH_FIELDS}
          apiPath="/api/v1/accounts-payable-vendor-management/three-way-matches"
          returnPath="/accounts-payable-vendor-management/three-way-matches"
        />
      </div>
    </div>
  );
}
