import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminAiAgentConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiAgentConfigsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminAiAgentConfigs)
    .where(
      and(
        eq(adminAiAgentConfigs.tenantId, session.tenantId),
        isNull(adminAiAgentConfigs.deletedAt)
      )
    )
    .orderBy(desc(adminAiAgentConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            AI Agent Configurations
          </h1>
          <p className="text-sm text-gray-500">
            Configure AI agents, models, automation levels, and review thresholds
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/ai-agent-configs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Agent Config
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No AI agent configurations found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/ai-agent-configs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first agent configuration
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Agent Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Model
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Automation Level
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/ai-agent-configs/${agent.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {agent.agentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {agent.agentSlug}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {agent.modelProvider}/{agent.modelId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {agent.automationLevel}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={agent.isActive ? "success" : "secondary"}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {agent.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
