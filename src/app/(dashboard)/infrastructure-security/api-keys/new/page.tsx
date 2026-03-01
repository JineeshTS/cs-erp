import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const API_KEY_FIELDS: FieldConfig[] = [
  {
    name: "keyName",
    label: "Key Name",
    type: "text",
    required: true,
    placeholder: "my-service-key",
  },
  {
    name: "rateLimit",
    label: "Rate Limit (requests/min)",
    type: "number",
    placeholder: "1000",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Description of what this key is used for...",
  },
];

export default async function NewApiKeyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:create")))
    redirect("/infrastructure-security");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/api-keys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New API Key</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="API Key"
          apiPath="/api/v1/infrastructure-security/iam/api-keys"
          fields={API_KEY_FIELDS}
          returnPath="/infrastructure-security/api-keys"
        />
      </div>
    </div>
  );
}
