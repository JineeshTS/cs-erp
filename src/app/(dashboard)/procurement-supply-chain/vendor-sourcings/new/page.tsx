import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewVendorSourcingPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "procurement:create"))
  )
    redirect("/procurement-supply-chain/vendor-sourcings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/vendor-sourcings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Vendor Sourcing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Vendor Sourcing"
          apiPath="/api/v1/procurement-supply-chain/vendor-sourcings"
          fields={SOURCING_FIELDS}
          returnPath="/procurement-supply-chain/vendor-sourcings"
        />
      </div>
    </div>
  );
}
