import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { aiProviders, aiModels } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const [provider, models] = await Promise.all([
    db
      .select()
      .from(aiProviders)
      .where(
        and(
          eq(aiProviders.id, id),
          eq(aiProviders.tenantId, session.tenantId),
          isNull(aiProviders.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(aiModels)
      .where(
        and(
          eq(aiModels.providerId, id),
          eq(aiModels.tenantId, session.tenantId),
          isNull(aiModels.deletedAt)
        )
      )
      .orderBy(desc(aiModels.createdAt)),
  ]);

  if (!provider) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/ai-providers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {provider.displayName}
          </h1>
          <p className="text-sm text-gray-500">{provider.providerName}</p>
        </div>
        <div className="flex items-center gap-2">
          {provider.isDefault && <Badge variant="default">Default</Badge>}
          <Badge variant={provider.isActive ? "success" : "secondary"}>
            {provider.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Provider Name
            </dt>
            <dd className="mt-1 text-gray-900">{provider.providerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Display Name</dt>
            <dd className="mt-1 text-gray-900">{provider.displayName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              API Endpoint
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {provider.apiEndpoint || "Default"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">API Key</dt>
            <dd className="mt-1 text-gray-900">
              {provider.apiKeyEncrypted ? (
                <span className="font-mono text-sm text-gray-400">
                  ********
                </span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={provider.isActive ? "success" : "secondary"}>
                {provider.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Default</dt>
            <dd className="mt-1">
              {provider.isDefault ? (
                <Badge variant="default">Default Provider</Badge>
              ) : (
                <span className="text-gray-400">No</span>
              )}
            </dd>
          </div>
          {provider.metadata ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1 rounded bg-gray-50 p-3 font-mono text-xs text-gray-900">
                {JSON.stringify(provider.metadata as Record<string, unknown>, null, 2)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {provider.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {provider.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Models ({models.length})
        </h2>
        {models.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No models configured for this provider.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Model ID
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Display Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-gray-500">
                    Context Window
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin-portal/ai-models/${model.id}`}
                        className="font-medium font-mono text-xs text-gray-900 hover:underline"
                      >
                        {model.modelId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {model.displayName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{model.modelType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-end text-gray-600">
                      {model.contextWindow
                        ? model.contextWindow.toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={model.isActive ? "success" : "secondary"}
                      >
                        {model.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
