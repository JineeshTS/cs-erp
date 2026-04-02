import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminIntegrationEndpoints } from "@/db/schema";
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

export default async function EditIntegrationEndpointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/integration-endpoints");

  const { id } = await params;

  const endpoint = await db
    .select()
    .from(adminIntegrationEndpoints)
    .where(
      and(
        eq(adminIntegrationEndpoints.id, id),
        eq(adminIntegrationEndpoints.tenantId, session.tenantId),
        isNull(adminIntegrationEndpoints.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!endpoint) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/integration-endpoints/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Integration Endpoint
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Integration Endpoint"
          apiPath={`/api/v1/admin-portal/integration-endpoints/${id}`}
          fields={ENDPOINT_FIELDS}
          initialData={{
            name: endpoint.name,
            slug: endpoint.slug,
            description: endpoint.description ?? "",
            provider: endpoint.provider,
            endpointUrl: endpoint.endpointUrl,
            method: endpoint.method,
            authType: endpoint.authType,
            timeoutMs: endpoint.timeoutMs,
            rateLimitPerMinute: endpoint.rateLimitPerMinute ?? "",
            status: endpoint.status,
          }}
          isEdit
          returnPath={`/admin-portal/integration-endpoints/${id}`}
        />
      </div>
    </div>
  );
}
