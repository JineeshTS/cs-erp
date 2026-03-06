import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { aiUsageLogs, aiModels, aiProviders, aafAgents } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Hash,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default async function AiUsageDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  // Summary aggregations
  const [summary] = await db
    .select({
      totalSpend: sql<string>`coalesce(sum(${aiUsageLogs.costUsd}::numeric), 0)`,
      totalInputTokens: sql<number>`coalesce(sum(${aiUsageLogs.inputTokens}), 0)`,
      totalOutputTokens: sql<number>`coalesce(sum(${aiUsageLogs.outputTokens}), 0)`,
      totalCalls: sql<number>`count(*)`,
      errorCount: sql<number>`count(*) filter (where ${aiUsageLogs.status} != 'success')`,
    })
    .from(aiUsageLogs)
    .where(eq(aiUsageLogs.tenantId, session.tenantId));

  const totalTokens =
    Number(summary.totalInputTokens) + Number(summary.totalOutputTokens);
  const errorRate =
    Number(summary.totalCalls) > 0
      ? ((Number(summary.errorCount) / Number(summary.totalCalls)) * 100).toFixed(1)
      : "0.0";

  // Recent usage logs with joins
  const logs = await db
    .select({
      id: aiUsageLogs.id,
      inputTokens: aiUsageLogs.inputTokens,
      outputTokens: aiUsageLogs.outputTokens,
      costUsd: aiUsageLogs.costUsd,
      latencyMs: aiUsageLogs.latencyMs,
      status: aiUsageLogs.status,
      errorMessage: aiUsageLogs.errorMessage,
      createdAt: aiUsageLogs.createdAt,
      agentName: aafAgents.agentName,
      modelDisplayName: aiModels.displayName,
      providerName: aiProviders.providerName,
    })
    .from(aiUsageLogs)
    .leftJoin(aafAgents, eq(aiUsageLogs.agentId, aafAgents.id))
    .leftJoin(aiModels, eq(aiUsageLogs.modelId, aiModels.id))
    .leftJoin(aiProviders, eq(aiUsageLogs.providerId, aiProviders.id))
    .where(eq(aiUsageLogs.tenantId, session.tenantId))
    .orderBy(desc(aiUsageLogs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Usage</h1>
        <p className="text-sm text-gray-500">
          Monitor AI spending, token usage, and error rates across all agents
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spend</p>
              <p className="text-xl font-bold text-gray-900">
                ${parseFloat(summary.totalSpend).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-blue-100 p-2">
              <Hash className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tokens</p>
              <p className="text-xl font-bold text-gray-900">
                {totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-purple-100 p-2">
              <Activity className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Calls</p>
              <p className="text-xl font-bold text-gray-900">
                {Number(summary.totalCalls).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Error Rate</p>
              <p className="text-xl font-bold text-gray-900">{errorRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Recent Usage Logs
        </h2>
        {logs.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No usage logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Model
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-gray-500">
                    Tokens (In/Out)
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-gray-500">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-gray-500">
                    Latency
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {log.agentName || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.modelDisplayName || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.providerName || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-xs text-gray-600">
                      {log.inputTokens.toLocaleString()} /{" "}
                      {log.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-xs text-gray-600">
                      {log.costUsd
                        ? `$${parseFloat(log.costUsd).toFixed(4)}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-end text-gray-600">
                      {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          log.status === "success"
                            ? "success"
                            : log.status === "error"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {log.createdAt.toLocaleString()}
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
