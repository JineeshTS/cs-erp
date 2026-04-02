import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aiModels, aiProviders } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const [model] = await db
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
      capabilities: aiModels.capabilities,
      metadata: aiModels.metadata,
      createdAt: aiModels.createdAt,
      updatedAt: aiModels.updatedAt,
      providerName: aiProviders.providerName,
      providerDisplayName: aiProviders.displayName,
    })
    .from(aiModels)
    .innerJoin(aiProviders, eq(aiModels.providerId, aiProviders.id))
    .where(
      and(
        eq(aiModels.id, id),
        eq(aiModels.tenantId, session.tenantId),
        isNull(aiModels.deletedAt)
      )
    )
    .limit(1);

  if (!model) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/ai-models"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {model.displayName}
          </h1>
          <p className="text-sm font-mono text-gray-500">{model.modelId}</p>
        </div>
        <Badge variant={model.isActive ? "success" : "secondary"}>
          {model.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Model ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {model.modelId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Display Name</dt>
            <dd className="mt-1 text-gray-900">{model.displayName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Provider</dt>
            <dd className="mt-1 text-gray-900">
              {model.providerDisplayName}{" "}
              <span className="text-sm text-gray-400">
                ({model.providerName})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Type</dt>
            <dd className="mt-1">
              <Badge variant="outline">{model.modelType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Max Tokens</dt>
            <dd className="mt-1 text-gray-900">
              {model.maxTokens ? model.maxTokens.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Context Window
            </dt>
            <dd className="mt-1 text-gray-900">
              {model.contextWindow
                ? model.contextWindow.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cost / 1k Input Tokens
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {model.costPer1kInput
                ? `$${parseFloat(model.costPer1kInput).toFixed(4)}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cost / 1k Output Tokens
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {model.costPer1kOutput
                ? `$${parseFloat(model.costPer1kOutput).toFixed(4)}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={model.isActive ? "success" : "secondary"}>
                {model.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          {model.capabilities ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Capabilities
              </dt>
              <dd className="mt-1 rounded bg-gray-50 p-3 font-mono text-xs text-gray-900">
                {JSON.stringify(model.capabilities as Record<string, unknown>, null, 2)}
              </dd>
            </div>
          ) : null}
          {model.metadata ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1 rounded bg-gray-50 p-3 font-mono text-xs text-gray-900">
                {JSON.stringify(model.metadata as Record<string, unknown>, null, 2)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {model.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {model.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
