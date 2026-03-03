import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";

const LC_FIELDS: FieldConfig[] = [
  {
    name: "lcType",
    label: "LC Type",
    type: "select",
    required: true,
    options: [
      { value: "irrevocable", label: "Irrevocable" },
      { value: "revocable", label: "Revocable" },
      { value: "standby", label: "Standby" },
      { value: "transferable", label: "Transferable" },
      { value: "back_to_back", label: "Back to Back" },
      { value: "revolving", label: "Revolving" },
    ],
  },
  { name: "issuingBank", label: "Issuing Bank", type: "text" },
  { name: "advisingBank", label: "Advising Bank", type: "text" },
  { name: "confirmingBank", label: "Confirming Bank", type: "text" },
  { name: "applicant", label: "Applicant", type: "text" },
  { name: "beneficiary", label: "Beneficiary", type: "text" },
  { name: "lcAmount", label: "LC Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "issueDate", label: "Issue Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "shipmentDeadline", label: "Shipment Deadline", type: "datetime-local" },
  { name: "presentationPeriod", label: "Presentation Period (days)", type: "number" },
  { name: "partialShipment", label: "Partial Shipment Allowed", type: "checkbox" },
  { name: "transshipment", label: "Transshipment Allowed", type: "checkbox" },
  { name: "termsAndConditions", label: "Terms and Conditions", type: "textarea" },
  { name: "utilizationAmount", label: "Utilization Amount", type: "text" },
  { name: "availableAmount", label: "Available Amount", type: "text" },
  { name: "charges", label: "Charges", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewLetterOfCreditPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/letters-of-credit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/letters-of-credit"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Letter of Credit
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Letter of Credit"
          apiPath="/api/v1/treasury-cash-management/letters-of-credit"
          fields={LC_FIELDS}
          returnPath="/treasury-cash-management/letters-of-credit"
        />
      </div>
    </div>
  );
}
