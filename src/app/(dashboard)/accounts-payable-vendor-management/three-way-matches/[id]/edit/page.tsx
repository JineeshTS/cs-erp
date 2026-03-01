import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getThreeWayMatch } from "@/lib/accounts-payable-vendor-management/service";
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

export default async function EditThreeWayMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getThreeWayMatch(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/accounts-payable-vendor-management/three-way-matches/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Three-Way Match</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Three-Way Match"
          apiPath={`/api/v1/accounts-payable-vendor-management/three-way-matches/${id}`}
          fields={THREE_WAY_MATCH_FIELDS}
          initialData={{
            vendorName: record.vendorName,
            invoiceNumber: record.invoiceNumber ?? "",
            poNumber: record.poNumber ?? "",
            currency: record.currency ?? "",
            poAmount: record.poAmount ? Number(record.poAmount) : "",
            grAmount: record.grAmount ? Number(record.grAmount) : "",
            invoiceAmount: record.invoiceAmount ? Number(record.invoiceAmount) : "",
            tolerancePercent: record.tolerancePercent ? Number(record.tolerancePercent) : "",
            exceptionReason: record.exceptionReason ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/accounts-payable-vendor-management/three-way-matches/${id}`}
        />
      </div>
    </div>
  );
}
