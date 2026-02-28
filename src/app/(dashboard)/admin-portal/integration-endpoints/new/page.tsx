import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const ENDPOINT_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "provider",
    label: "Provider",
    type: "text",
    required: true,
    placeholder: "e.g. customs_api",
  },
  {
    name: "endpointUrl",
    label: "Endpoint URL",
    type: "text",
    required: true,
    placeholder: "https://...",
  },
  {
    name: "method",
    label: "Method",
    type: "select",
    options: [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "PATCH", label: "PATCH" },
      { value: "DELETE", label: "DELETE" },
    ],
  },
  {
    name: "authType",
    label: "Auth Type",
    type: "select",
    options: [
      { value: "bearer", label: "Bearer" },
      { value: "api_key", label: "API Key" },
      { value: "basic", label: "Basic" },
      { value: "oauth2", label: "OAuth2" },
      { value: "none", label: "None" },
    ],
  },
  { name: "timeoutMs", label: "Timeout (ms)", type: "number" },
  { name: "rateLimitPerMinute", label: "Rate Limit / min", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "testing", label: "Testing" },
    ],
  },
];

export default async function NewIntegrationEndpointPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:create")))
    redirect("/admin-portal/integration-endpoints");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/integration-endpoints"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Integration Endpoint
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Integration Endpoint"
          apiPath="/api/v1/admin-portal/integration-endpoints"
          fields={ENDPOINT_FIELDS}
          returnPath="/admin-portal/integration-endpoints"
        />
      </div>
    </div>
  );
}
