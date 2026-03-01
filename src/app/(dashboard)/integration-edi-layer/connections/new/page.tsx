import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IelForm } from "@/components/integration-edi-layer/iel-form";
import type { FieldConfig } from "@/components/integration-edi-layer/iel-form";

const CONNECTION_FIELDS: FieldConfig[] = [
  {
    name: "connectionName",
    label: "Connection Name",
    type: "text",
    required: true,
    placeholder: "e.g. Oracle Fusion Production",
  },
  {
    name: "connectionCode",
    label: "Connection Code",
    type: "text",
    required: true,
    placeholder: "e.g. ORACLE-PROD",
  },
  {
    name: "connectionType",
    label: "Connection Type",
    type: "select",
    required: true,
    options: [
      { value: "erp", label: "ERP" },
      { value: "edi", label: "EDI" },
      { value: "port", label: "Port" },
      { value: "customs", label: "Customs" },
      { value: "api", label: "API" },
      { value: "webhook", label: "Webhook" },
      { value: "sftp", label: "SFTP" },
    ],
  },
  {
    name: "provider",
    label: "Provider",
    type: "select",
    required: true,
    options: [
      { value: "oracle_fusion", label: "Oracle Fusion" },
      { value: "sap", label: "SAP" },
      { value: "dpw_portconnect", label: "DPW PortConnect" },
      { value: "customs_qa", label: "Customs QA" },
      { value: "customs_ae", label: "Customs AE" },
      { value: "customs_sa", label: "Customs SA" },
      { value: "customs_in", label: "Customs IN" },
      { value: "generic", label: "Generic" },
    ],
  },
  {
    name: "baseUrl",
    label: "Base URL",
    type: "text",
    placeholder: "https://api.example.com",
  },
  {
    name: "authType",
    label: "Auth Type",
    type: "select",
    required: true,
    options: [
      { value: "oauth2", label: "OAuth2" },
      { value: "api_key", label: "API Key" },
      { value: "basic", label: "Basic" },
      { value: "certificate", label: "Certificate" },
      { value: "none", label: "None" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "testing", label: "Testing" },
      { value: "error", label: "Error" },
    ],
  },
  {
    name: "rateLimitPerMinute",
    label: "Rate Limit (per min)",
    type: "number",
    placeholder: "e.g. 60",
  },
  {
    name: "timeoutMs",
    label: "Timeout (ms)",
    type: "number",
    placeholder: "30000",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes about this connection...",
  },
];

export default async function NewConnectionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "integration:create"))
  )
    redirect("/integration-edi-layer");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/connections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Connection</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IelForm
          entityType="Connection"
          apiPath="/api/v1/integration-edi-layer/connections"
          fields={CONNECTION_FIELDS}
          returnPath="/integration-edi-layer/connections"
        />
      </div>
    </div>
  );
}
