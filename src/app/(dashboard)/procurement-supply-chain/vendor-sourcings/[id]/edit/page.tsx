import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVendorSourcing } from "@/lib/procurement-supply-chain/service";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const SOURCING_FIELDS: FieldConfig[] = [
  {
    name: "sourcingType",
    label: "Sourcing Type",
    type: "select",
    required: true,
    options: [
      { value: "rfq", label: "RFQ" },
      { value: "rfp", label: "RFP" },
      { value: "rfi", label: "RFI" },
      { value: "reverse_auction", label: "Reverse Auction" },
      { value: "sole_source", label: "Sole Source" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "category", label: "Category", type: "text" },
  { name: "issueDate", label: "Issue Date", type: "datetime-local" },
  { name: "closingDate", label: "Closing Date", type: "datetime-local" },
  { name: "evaluationDate", label: "Evaluation Date", type: "datetime-local" },
  { name: "selectedVendor", label: "Selected Vendor", type: "text" },
  { name: "selectionReason", label: "Selection Reason", type: "textarea" },
  { name: "totalBudget", label: "Total Budget", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  {
    name: "linkedRequisitionRef",
    label: "Linked Requisition Ref",
    type: "text",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVendorSourcingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:edit")))
    redirect("/procurement-supply-chain/vendor-sourcings");

  const { id } = await params;

  const record = await getVendorSourcing(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/procurement-supply-chain/vendor-sourcings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Vendor Sourcing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Vendor Sourcing"
          apiPath={`/api/v1/procurement-supply-chain/vendor-sourcings/${id}`}
          fields={SOURCING_FIELDS}
          initialData={{
            sourcingType: record.sourcingType,
            title: record.title,
            description: record.description ?? "",
            category: record.category ?? "",
            issueDate: record.issueDate
              ? new Date(record.issueDate).toISOString()
              : "",
            closingDate: record.closingDate
              ? new Date(record.closingDate).toISOString()
              : "",
            evaluationDate: record.evaluationDate
              ? new Date(record.evaluationDate).toISOString()
              : "",
            selectedVendor: record.selectedVendor ?? "",
            selectionReason: record.selectionReason ?? "",
            totalBudget: record.totalBudget ?? "",
            currency: record.currency ?? "",
            linkedRequisitionRef: record.linkedRequisitionRef ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/procurement-supply-chain/vendor-sourcings/${id}`}
        />
      </div>
    </div>
  );
}
