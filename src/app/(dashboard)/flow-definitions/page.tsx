import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { listFlowDefinitions } from "@/lib/flow-definitions/service";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  GitBranch,
  Search,
  Copy,
  Eye,
  Ship,
  DollarSign,
  ShieldCheck,
  Settings,
  Anchor,
  BarChart3,
  Users,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";

// ── Category Config ──

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: typeof Ship; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" }
> = {
  revenue_cycle: { label: "Revenue Cycle", icon: DollarSign, variant: "success" },
  vessel_operations: { label: "Vessel Operations", icon: Ship, variant: "info" },
  container_management: { label: "Container Mgmt", icon: Layers, variant: "secondary" },
  financial_operations: { label: "Financial Ops", icon: BarChart3, variant: "warning" },
  compliance_regulatory: { label: "Compliance", icon: ShieldCheck, variant: "destructive" },
  fleet_asset: { label: "Fleet & Asset", icon: Anchor, variant: "outline" },
  hr_crew: { label: "HR & Crew", icon: Users, variant: "secondary" },
  platform_admin: { label: "Platform Admin", icon: Settings, variant: "outline" },
};

function getCategoryConfig(category: string | null) {
  if (!category) return { label: "Uncategorized", icon: GitBranch, variant: "outline" as const };
  return CATEGORY_CONFIG[category] ?? { label: category.replace(/_/g, " "), icon: GitBranch, variant: "outline" as const };
}

export default async function FlowDefinitionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const categoryFilter = sp.category ?? "";
  const sourceFilter = sp.source ?? "";

  // Fetch all definitions (system + tenant)
  const result = await listFlowDefinitions({
    tenantId: session.tenantId,
    source: sourceFilter || undefined,
    category: categoryFilter || undefined,
    search: search || undefined,
    limit: 50,
  });

  const allFlows = result.data;
  const systemFlows = allFlows.filter((f) => f.source === "system");
  const myFlows = allFlows.filter((f) => f.source !== "system");

  // Stats
  const totalFlows = allFlows.length;
  const systemCount = systemFlows.length;
  const customCount = myFlows.length;

  // Category breakdown
  const categoryBreakdown = new Map<string, number>();
  for (const f of allFlows) {
    const cat = f.category ?? "uncategorized";
    categoryBreakdown.set(cat, (categoryBreakdown.get(cat) ?? 0) + 1);
  }

  const hasFilters = !!(search || categoryFilter || sourceFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            E2E Flow Definitions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalFlows} flow definitions - {systemCount} system templates, {customCount} custom/cloned
          </p>
        </div>
        <Link
          href="/flow-definitions?source=system"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <GitBranch className="h-4 w-4" />
          Browse Templates
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Flows</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFlows}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">System Templates</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{systemCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Custom/Cloned</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{customCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{categoryBreakdown.size}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/flow-definitions"
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !categoryFilter
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
          }`}
        >
          All ({totalFlows})
        </Link>
        {Array.from(categoryBreakdown.entries())
          .sort(([, a], [, b]) => b - a)
          .map(([cat, count]) => {
            const config = getCategoryConfig(cat);
            const Icon = config.icon;
            return (
              <Link
                key={cat}
                href={`/flow-definitions?category=${cat}`}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-3 w-3" />
                {config.label} ({count})
              </Link>
            );
          })}
      </div>

      {/* Search Filter */}
      <form method="GET" className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search flows by name, code, or description..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-gray-100"
          />
        </div>
        {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
        {sourceFilter && <input type="hidden" name="source" value={sourceFilter} />}
        <button
          type="submit"
          className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Search
        </button>
        {hasFilters && (
          <Link
            href="/flow-definitions"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* System Templates Section */}
      {systemFlows.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-emerald-500" />
            System Templates
            <Badge variant="secondary">{systemFlows.length}</Badge>
          </h2>
          <FlowTable flows={systemFlows} isSystem />
        </section>
      )}

      {/* My Flows Section */}
      {myFlows.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Copy className="h-5 w-5 text-amber-500" />
            My Flows
            <Badge variant="secondary">{myFlows.length}</Badge>
          </h2>
          <FlowTable flows={myFlows} isSystem={false} />
        </section>
      )}

      {/* Empty State */}
      {allFlows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No flow definitions found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {hasFilters
              ? "Try adjusting your search or filter criteria."
              : "System templates will appear once the process engine is seeded."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Flow Table Component ──

function FlowTable({
  flows,
  isSystem,
}: {
  flows: Array<{
    id: string;
    flowCode: string;
    name: string;
    category: string | null;
    stepsCount: number;
    triggerEvent: string | null;
    source: string;
  }>;
  isSystem: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
              Flow Code
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
              Category
            </th>
            <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
              Steps
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
              Trigger Event
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {flows.map((flow) => {
            const catConfig = getCategoryConfig(flow.category);
            const CatIcon = catConfig.icon;
            return (
              <tr
                key={flow.id}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-300">
                    {flow.flowCode}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/flow-definitions/${flow.id}`}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {flow.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={catConfig.variant}>
                    <CatIcon className="mr-1 h-3 w-3" />
                    {catConfig.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-8 h-8 text-xs font-medium">
                    {flow.stepsCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                  {flow.triggerEvent ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/flow-definitions/${flow.id}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Link>
                    {isSystem && (
                      <CloneButton flowId={flow.id} />
                    )}
                    {!isSystem && (
                      <Link
                        href={`/flow-definitions/${flow.id}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                      >
                        <ArrowRight className="h-3 w-3" />
                        Edit
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Clone Button (needs client-side fetch) ──
// Since the parent is a server component, we render a form that posts to the clone API.
// For a true SPA experience, this should be a client component — but for simplicity
// and to avoid unnecessary JS, we use a lightweight approach.

function CloneButton({ flowId }: { flowId: string }) {
  return (
    <Link
      href={`/flow-definitions/${flowId}?action=clone`}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
    >
      <Copy className="h-3 w-3" />
      Clone
    </Link>
  );
}
