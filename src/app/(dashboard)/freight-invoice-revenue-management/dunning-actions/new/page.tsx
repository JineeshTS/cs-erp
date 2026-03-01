import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";

const DUNNING_ACTION_FIELDS: FieldConfig[] = [
  {
    name: "invoiceNumber",
    label: "Invoice Number",
    type: "text",
  },
  {
    name: "customerName",
    label: "Customer Name",
    type: "text",
    required: true,
  },
  {
    name: "actionType",
    label: "Action Type",
    type: "select",
    required: true,
    options: [
      { value: "reminder", label: "Reminder" },
      { value: "follow_up", label: "Follow Up" },
      { value: "demand_letter", label: "Demand Letter" },
      { value: "phone_call", label: "Phone Call" },
      { value: "legal_notice", label: "Legal Notice" },
      { value: "collection_agency", label: "Collection Agency" },
      { value: "write_off", label: "Write Off" },
    ],
  },
  {
    name: "dunningLevel",
    label: "Dunning Level",
    type: "number",
  },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  {
    name: "outstandingAmount",
    label: "Outstanding Amount",
    type: "number",
    required: true,
  },
  {
    name: "daysPastDue",
    label: "Days Past Due",
    type: "number",
  },
  {
    name: "contactMethod",
    label: "Contact Method",
    type: "select",
    options: [
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "letter", label: "Letter" },
      { value: "portal", label: "Portal" },
      { value: "sms", label: "SMS" },
    ],
  },
  {
    name: "contactDetails",
    label: "Contact Details",
    type: "textarea",
  },
  {
    name: "messageTemplate",
    label: "Message Template",
    type: "text",
  },
  {
    name: "promisedDate",
    label: "Promised Date",
    type: "datetime-local",
  },
  {
    name: "promisedAmount",
    label: "Promised Amount",
    type: "number",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewDunningActionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:create")))
    redirect("/freight-invoice-revenue-management/dunning-actions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/dunning-actions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Dunning Action
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Dunning Action"
          apiPath="/api/v1/freight-invoice-revenue-management/dunning-actions"
          fields={DUNNING_ACTION_FIELDS}
          returnPath="/freight-invoice-revenue-management/dunning-actions"
        />
      </div>
    </div>
  );
}
