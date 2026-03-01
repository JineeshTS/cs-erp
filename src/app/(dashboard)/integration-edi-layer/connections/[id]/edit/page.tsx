import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ielIntegrationConnections } from "@/db/schema";
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

export default async function EditConnectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:edit")))
    redirect("/integration-edi-layer");

  const { id } = await params;

  const conn = await db
    .select()
    .from(ielIntegrationConnections)
    .where(
      and(
        eq(ielIntegrationConnections.id, id),
        eq(ielIntegrationConnections.tenantId, session.tenantId),
        isNull(ielIntegrationConnections.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!conn) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/integration-edi-layer/connections/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Connection</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IelForm
          entityType="Connection"
          apiPath={`/api/v1/integration-edi-layer/connections/${id}`}
          fields={CONNECTION_FIELDS}
          initialData={{
            connectionName: conn.connectionName,
            connectionCode: conn.connectionCode,
            connectionType: conn.connectionType,
            provider: conn.provider,
            baseUrl: conn.baseUrl ?? "",
            authType: conn.authType,
            status: conn.status,
            rateLimitPerMinute: conn.rateLimitPerMinute
              ? Number(conn.rateLimitPerMinute)
              : "",
            timeoutMs: conn.timeoutMs ? Number(conn.timeoutMs) : "",
            notes: conn.notes ?? "",
          }}
          isEdit
          returnPath={`/integration-edi-layer/connections/${id}`}
        />
      </div>
    </div>
  );
}
