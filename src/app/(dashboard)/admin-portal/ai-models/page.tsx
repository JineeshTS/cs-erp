import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { aiModels, aiProviders } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiModelsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const data = await db
    .select({
      id: aiModels.id,
      modelId: aiModels.modelId,
      displayName: aiModels.displayName,
      modelType: aiModels.modelType,
      maxTokens: aiModels.maxTokens,
      contextWindow: aiModels.contextWindow,
      costPer1kInput: aiModels.costPer1kInput,
      costPer1kOutput: aiModels.costPer1kOutput,
      isActive: aiModels.isActive,
      createdAt: aiModels.createdAt,
      providerId: aiModels.providerId,
      providerName: aiProviders.providerName,
      providerDisplayName: aiProviders.displayName,
    })
    .from(aiModels)
    .innerJoin(aiProviders, eq(aiModels.providerId, aiProviders.id))
    .where(
      and(
        eq(aiModels.tenantId, session.tenantId),
        isNull(aiModels.deletedAt)
      )
    )
    .orderBy(aiProviders.providerName, desc(aiModels.createdAt))
    .limit(50);

  // Group models by provider
  const grouped = new Map<
    string,
    { providerName: string; providerDisplayName: string; models: typeof data }
  >();

  for (const row of data) {
    const key = row.providerId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        providerName: row.providerName,
        providerDisplayName: row.providerDisplayName,
        models: [],
      });
    }
    grouped.get(key)!.models.push(row);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Models</h1>
        <p className="text-sm text-gray-500">
          View AI models grouped by provider, including costs and capabilities
        </p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No AI models configured.</p>
          <p className="mt-1 text-sm text-gray-400">
            Models are added when configuring AI providers.
          </p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(
          ([providerId, { providerName, providerDisplayName, models }]) => (
            <div key={providerId} className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {providerDisplayName}{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({providerName})
                </span>
              </h2>
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
                      <th className="px-4 py-3 text-end font-medium text-gray-500">
                        Cost/1k Input
                      </th>
                      <th className="px-4 py-3 text-end font-medium text-gray-500">
                        Cost/1k Output
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
                        <td className="px-4 py-3 text-end font-mono text-xs text-gray-600">
                          {model.costPer1kInput
                            ? `$${parseFloat(model.costPer1kInput).toFixed(4)}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-end font-mono text-xs text-gray-600">
                          {model.costPer1kOutput
                            ? `$${parseFloat(model.costPer1kOutput).toFixed(4)}`
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
            </div>
          )
        )
      )}
    </div>
  );
}
