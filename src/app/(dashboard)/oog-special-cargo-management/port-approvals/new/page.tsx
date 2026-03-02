import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm } from "@/components/oog-special-cargo-management/oog-form";
import type { FieldConfig } from "@/components/oog-special-cargo-management/oog-form";

const PORT_APPROVAL_FIELDS: FieldConfig[] = [
  { name: "acceptanceRef", label: "Acceptance Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text", required: true },
  {
    name: "portAuthority",
    label: "Port Authority",
    type: "text",
    required: true,
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text" },
  {
    name: "approvalType",
    label: "Approval Type",
    type: "select",
    required: true,
    options: [
      { value: "loading", label: "Loading" },
      { value: "discharge", label: "Discharge" },
      { value: "transit", label: "Transit" },
      { value: "storage", label: "Storage" },
      { value: "transport", label: "Transport" },
    ],
  },
  { name: "submittedAt", label: "Submitted At", type: "datetime-local" },
  { name: "submittedByName", label: "Submitted By", type: "text" },
  { name: "applicationNumber", label: "Application Number", type: "text" },
  { name: "approvedAt", label: "Approved At", type: "datetime-local" },
  {
    name: "approvedByAuthority",
    label: "Approved By Authority",
    type: "text",
  },
  { name: "rejectionReason", label: "Rejection Reason", type: "textarea" },
  { name: "validFrom", label: "Valid From", type: "datetime-local" },
  { name: "validTo", label: "Valid To", type: "datetime-local" },
  { name: "fees", label: "Fees", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPortApprovalPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "oog_special:create"))
  )
    redirect("/oog-special-cargo-management/port-approvals");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/oog-special-cargo-management/port-approvals"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Port Approval
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Port Approval"
          apiPath="/api/v1/oog-special-cargo-management/port-approvals"
          fields={PORT_APPROVAL_FIELDS}
          returnPath="/oog-special-cargo-management/port-approvals"
        />
      </div>
    </div>
  );
}
