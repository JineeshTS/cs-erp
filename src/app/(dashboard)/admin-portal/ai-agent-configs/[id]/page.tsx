import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminAiAgentConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiAgentConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const agent = await db
    .select()
    .from(adminAiAgentConfigs)
    .where(
      and(
        eq(adminAiAgentConfigs.id, id),
        eq(adminAiAgentConfigs.tenantId, session.tenantId),
        isNull(adminAiAgentConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!agent) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/ai-agent-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {agent.agentName}
          </h1>
          <p className="text-sm text-gray-500">{agent.agentSlug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/ai-agent-configs/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Name</dt>
            <dd className="mt-1 text-gray-900">{agent.agentName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{agent.agentSlug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={agent.isActive ? "success" : "secondary"}>
                {agent.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Model Provider
            </dt>
            <dd className="mt-1 text-gray-900">{agent.modelProvider}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model ID</dt>
            <dd className="mt-1 text-gray-900">{agent.modelId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Temperature</dt>
            <dd className="mt-1 text-gray-900">{agent.temperature}/100</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Max Tokens</dt>
            <dd className="mt-1 text-gray-900">
              {agent.maxTokens.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {agent.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {agent.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {agent.description || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Automation vs Human Review
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Automation Level
              </span>
              <span className="text-gray-900">{agent.automationLevel}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${agent.automationLevel}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Human Review Threshold
              </span>
              <span className="text-gray-900">
                {agent.humanReviewThreshold}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${agent.humanReviewThreshold}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {agent.systemPrompt && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            System Prompt
          </h2>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            {agent.systemPrompt}
          </pre>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Settings</dt>
            <dd className="mt-1 text-gray-900">
              {agent.settings ? (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-xs">
                  {JSON.stringify(agent.settings, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {agent.metadata ? (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-xs">
                  {JSON.stringify(agent.metadata, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
