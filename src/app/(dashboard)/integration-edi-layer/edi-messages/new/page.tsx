import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IelForm } from "@/components/integration-edi-layer/iel-form";
import type { FieldConfig } from "@/components/integration-edi-layer/iel-form";

const EDI_MESSAGE_FIELDS: FieldConfig[] = [
  {
    name: "messageType",
    label: "Message Type",
    type: "select",
    required: true,
    options: [
      { value: "BAPLIE", label: "BAPLIE" },
      { value: "COPARN", label: "COPARN" },
      { value: "COPRAR", label: "COPRAR" },
      { value: "CUSCAR", label: "CUSCAR" },
      { value: "IFTMIN", label: "IFTMIN" },
      { value: "IFTMBC", label: "IFTMBC" },
      { value: "IFTSTA", label: "IFTSTA" },
      { value: "MOVINS", label: "MOVINS" },
      { value: "BERMAN", label: "BERMAN" },
      { value: "CUSTOM", label: "CUSTOM" },
    ],
  },
  {
    name: "ediStandard",
    label: "EDI Standard",
    type: "select",
    required: true,
    options: [
      { value: "EDIFACT", label: "EDIFACT" },
      { value: "X12", label: "X12" },
      { value: "XML", label: "XML" },
      { value: "JSON", label: "JSON" },
    ],
  },
  {
    name: "direction",
    label: "Direction",
    type: "select",
    required: true,
    options: [
      { value: "inbound", label: "Inbound" },
      { value: "outbound", label: "Outbound" },
    ],
  },
  {
    name: "senderCode",
    label: "Sender Code",
    type: "text",
    required: true,
    placeholder: "Enter sender code",
  },
  {
    name: "receiverCode",
    label: "Receiver Code",
    type: "text",
    required: true,
    placeholder: "Enter receiver code",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Optional notes about this EDI message",
  },
];

export default async function NewEdiMessagePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "integration:create"))
  )
    redirect("/integration-edi-layer/edi-messages");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/edi-messages"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New EDI Message</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IelForm
          entityType="EDI Message"
          apiPath="/api/v1/integration-edi-layer/edi/messages"
          fields={EDI_MESSAGE_FIELDS}
          returnPath="/integration-edi-layer/edi-messages"
        />
      </div>
    </div>
  );
}
