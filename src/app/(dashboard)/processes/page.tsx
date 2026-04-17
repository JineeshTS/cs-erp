import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { OPERATIONAL_PROCESSES } from "@/data/operational-processes";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import { PROCESS_EXPLANATIONS } from "@/data/process-explanations";
import {
  DOMAIN_LABELS,
  AUTOMATION_LABELS,
  TRIGGER_LABELS,
  PROCESS_CATEGORY_LABELS,
  DOMAIN_TO_CATEGORY,
} from "@/types/processes";
import type { ProcessDomain, ProcessCategory } from "@/types/processes";
import { Badge } from "@/components/ui/badge";
import { RunProcessButton } from "@/components/processes/run-process-button";
import { RunE2EFlowButton } from "@/components/processes/run-e2e-flow-button";
import { E2EFlowDiagramToggle } from "@/components/processes/e2e-flow-section";
import Link from "next/link";
import {
  Search,
  Bot,
  Cpu,
  Users,
  Zap,
  Clock,
  ArrowRight,
  Info,
  Ship,
  BadgeDollarSign,
  DollarSign,
  ShieldCheck,
  BarChart3,
  Settings,
  Activity,
  ListChecks,
  Workflow,
  GitBranch,
  Layers,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/db";
import { peTaskInstances } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

const CATEGORY_ICONS: Record<ProcessCategory, typeof Ship> = {
  core_operations: Ship,
  commercial_pricing: BadgeDollarSign,
  financial_accounting: DollarSign,
  compliance_regulatory: ShieldCheck,
  fleet_asset: Users,
  analytics_intelligence: BarChart3,
  platform_admin: Settings,
};

export default async function ProcessHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const search = (sp.search ?? "").toLowerCase();
  const categoryFilter = sp.category ?? "";
  const domain = sp.domain ?? "";
  const automation = sp.automation ?? "";
  const trigger = sp.trigger ?? "";
  const tab = sp.tab ?? "mytasks";

  // ── Stats ──
  const totalProcesses = OPERATIONAL_PROCESSES.length;
  const fullAuto = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "full_auto").length;
  const semiAuto = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "semi_auto").length;
  const aiAssisted = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "ai_assisted").length;
  const manualAi = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "manual_ai_insights").length;
  const totalE2E = E2E_PROCESS_FLOWS.length;

  // ── Filter ──
  const filtered = OPERATIONAL_PROCESSES.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search) && !p.id.toLowerCase().includes(search) && !p.agentName.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) return false;
    if (categoryFilter && DOMAIN_TO_CATEGORY[p.domain] !== categoryFilter) return false;
    if (domain && p.domain !== domain) return false;
    if (automation && p.automationLevel !== automation) return false;
    if (trigger && p.trigger !== trigger) return false;
    return true;
  });

  // ── Group by category ──
  const grouped = new Map<ProcessCategory, typeof filtered>();
  for (const p of filtered) {
    const cat = DOMAIN_TO_CATEGORY[p.domain];
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(p);
  }

  const hasFilters = !!(search || categoryFilter || domain || automation || trigger);

  // ── My Tasks (fetch assigned tasks for current user) ──
  const myTasks = tab === "mytasks"
    ? await db
        .select()
        .from(peTaskInstances)
        .where(
          and(
            eq(peTaskInstances.tenantId, session.tenantId),
            eq(peTaskInstances.assignedTo, session.id),
            isNull(peTaskInstances.deletedAt)
          )
        )
        .orderBy(desc(peTaskInstances.dueAt))
        .limit(20)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Process Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalProcesses} AI-powered operational processes across {Object.keys(PROCESS_CATEGORY_LABELS).length} categories and {totalE2E} end-to-end flows
          </p>
        </div>
        <Link
          href="/processes/monitor"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Activity className="h-4 w-4" />
          Process Monitor
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Processes</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProcesses}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Full Auto</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600">{fullAuto}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Semi-Auto</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{semiAuto}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">AI-Assisted</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-600">{aiAssisted}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Manual + AI</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-600 dark:text-gray-300">{manualAi}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">E2E Flows</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-purple-600">{totalE2E}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        <Link
          href="/processes?tab=mytasks"
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "mytasks" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          <ListChecks className="h-4 w-4" />
          My Tasks
        </Link>
        <Link
          href={`/processes?tab=processes${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}${domain ? `&domain=${domain}` : ""}${automation ? `&automation=${automation}` : ""}${trigger ? `&trigger=${trigger}` : ""}`}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "processes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          <Workflow className="h-4 w-4" />
          Processes ({filtered.length})
        </Link>
        <Link
          href="/processes?tab=e2e"
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "e2e" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          <GitBranch className="h-4 w-4" />
          E2E Flows ({totalE2E})
        </Link>
        <Link
          href="/processes?tab=templates"
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "templates" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          <Layers className="h-4 w-4" />
          Templates
        </Link>
      </div>

      {/* ═══════════════ TAB 0: MY TASKS ═══════════════ */}
      {tab === "mytasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tasks assigned to you, ordered by due date
            </p>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all tasks
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <div className="rounded-lg border bg-white dark:bg-gray-900 px-8 py-12 text-center">
              <ListChecks className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">No tasks assigned to you</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tasks from running processes will appear here when assigned to you.
              </p>
              <Link
                href="/tasks"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Go to Task Manager
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Task</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Due Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {myTasks.map((task) => {
                    const isOverdue =
                      task.dueAt &&
                      new Date(task.dueAt) < new Date() &&
                      task.status !== "completed" &&
                      task.status !== "cancelled";

                    return (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/tasks/${task.id}`}
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {task.name}
                          </Link>
                          {task.taskCode && (
                            <span className="ms-2 text-xs text-gray-400 dark:text-gray-500">
                              {task.taskCode}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                : task.status === "failed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                : task.status === "blocked"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
                            }`}
                          >
                            {task.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              task.priority === "critical"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                : task.priority === "high"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                                : task.priority === "normal"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
                            }`}
                          >
                            {task.priority.replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {task.dueAt ? (
                            <span className={isOverdue ? "font-medium text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"}>
                              {new Date(task.dueAt).toLocaleDateString()}
                              {isOverdue && <span className="ms-1 text-xs">(overdue)</span>}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB 1: ALL PROCESSES ═══════════════ */}
      {tab === "processes" && (
        <>
          {/* Link to templates */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Looking for reusable process templates? Browse the template library.
            </p>
            <Link
              href="/process-definitions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Process Templates
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Filters */}
          <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white dark:bg-gray-900 p-4">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
              <div className="relative">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
                <input id="search" name="search" type="text" defaultValue={sp.search ?? ""} placeholder="Process ID, name, agent..." className="w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <input type="hidden" name="tab" value="processes" />
            <div>
              <label htmlFor="category" className="mb-1 block text-xs font-medium text-gray-500">Category</label>
              <select id="category" name="category" defaultValue={categoryFilter} className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Categories</option>
                {Object.entries(PROCESS_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="domain" className="mb-1 block text-xs font-medium text-gray-500">Domain</label>
              <select id="domain" name="domain" defaultValue={domain} className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Domains</option>
                {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="automation" className="mb-1 block text-xs font-medium text-gray-500">Automation</label>
              <select id="automation" name="automation" defaultValue={automation} className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Levels</option>
                {Object.entries(AUTOMATION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="trigger" className="mb-1 block text-xs font-medium text-gray-500">Trigger</label>
              <select id="trigger" name="trigger" defaultValue={trigger} className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Triggers</option>
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-md bg-gray-900 dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-200">
              Filter
            </button>
            {hasFilters && (
              <Link href="/processes?tab=processes" className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Clear
              </Link>
            )}
          </form>

          {/* Process Cards grouped by category */}
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-white dark:bg-gray-900 px-8 py-12 text-center">
              <Bot className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-gray-500">No processes match your filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(grouped.entries()).map(([cat, processes]) => {
                const catInfo = PROCESS_CATEGORY_LABELS[cat];
                const CatIcon = CATEGORY_ICONS[cat];
                return (
                  <div key={cat}>
                    <div className="mb-3 flex items-center gap-2">
                      <CatIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{catInfo.label}</h2>
                      <span className="text-sm text-gray-400">({processes.length})</span>
                    </div>
                    <div className="space-y-2">
                      {processes.map((p) => {
                        const explanation = PROCESS_EXPLANATIONS[p.id];
                        return (
                          <details key={p.id} className="group rounded-lg border bg-white dark:bg-gray-900">
                            <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 [&::-webkit-details-marker]:hidden list-none">
                              <span className="font-mono text-xs text-gray-400 w-16 shrink-0">{p.id}</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100 flex-1 text-sm">{p.name}</span>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                <span className={`me-1 inline-block h-2 w-2 rounded-full ${
                                  p.automationLevel === "full_auto" ? "bg-green-500" :
                                  p.automationLevel === "semi_auto" ? "bg-yellow-500" :
                                  p.automationLevel === "ai_assisted" ? "bg-blue-500" : "bg-gray-400"
                                }`} />
                                {AUTOMATION_LABELS[p.automationLevel].label}
                              </Badge>
                              <Badge variant="secondary" className="shrink-0 text-xs">{TRIGGER_LABELS[p.trigger]}</Badge>
                              <Badge variant="default" className="shrink-0 text-xs">{DOMAIN_LABELS[p.domain].split(" ")[0]}</Badge>
                              <RunProcessButton
                                processId={p.id}
                                processName={p.name}
                                aiProcessingSteps={p.aiProcessingSteps}
                                humanTouchpoints={p.humanTouchpoints}
                              />
                            </summary>
                            <div className="border-t px-4 py-4 space-y-4">
                              {/* Layman Explanation */}
                              {explanation && (
                                <div className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                                  <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-blue-800 dark:text-blue-200">{explanation}</p>
                                  </div>
                                </div>
                              )}

                              <p className="text-sm text-gray-600 dark:text-gray-400">{p.description}</p>

                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">AI Agent</h4>
                                  <div className="flex items-center gap-1.5">
                                    <Bot className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.agentName}</span>
                                  </div>
                                  <span className="text-xs text-gray-400 capitalize">{p.agentType}</span>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Input</h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{p.input}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Output</h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{p.output}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">SLA</h4>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{p.sla}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Processing Steps</h4>
                                <div className="flex flex-wrap gap-2">
                                  {p.aiProcessingSteps.map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs text-blue-700 dark:text-blue-300">
                                      <span className="font-bold">{i + 1}.</span> {s}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Human Touchpoints</h4>
                                  <ul className="space-y-1">
                                    {p.humanTouchpoints.map((h, i) => (
                                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                        {h}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Connected Modules</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {p.connectedModules.map((m) => (
                                      <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {p.crossDependencies.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Cross-Process Dependencies</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {p.crossDependencies.map((d) => (
                                      <span key={d} className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-600 dark:text-gray-400">{d}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══════════════ TAB 2: E2E FLOWS ═══════════════ */}
      {tab === "e2e" && (
        <div className="space-y-6">
          {/* Links to related pages */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/e2e-flows"
              className="flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            >
              <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">Running Instances</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">View active E2E flow instances and their progress</p>
              </div>
              <ExternalLink className="ms-auto h-4 w-4 text-purple-400" />
            </Link>
            <Link
              href="/flow-definitions"
              className="flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-4 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
            >
              <GitBranch className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">Flow Templates</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Browse and manage reusable flow definitions</p>
              </div>
              <ExternalLink className="ms-auto h-4 w-4 text-emerald-400" />
            </Link>
          </div>

          {E2E_PROCESS_FLOWS.map((flow) => (
            <div key={flow.id} className="rounded-lg border bg-white dark:bg-gray-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{flow.id}</span>
                    <Link href={`/e2e-flows/definition/${flow.id}`} className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {flow.name}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{flow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/e2e-flows/definition/${flow.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    View Flow &amp; Transactions
                  </Link>
                  <Badge variant="outline">{flow.typicalTimeline}</Badge>
                  <RunE2EFlowButton flowId={flow.id} flowName={flow.name} steps={flow.steps} />
                </div>
              </div>

              {/* Step Diagram */}
              <div className="overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max py-2">
                  {flow.steps.map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className={`rounded-lg px-3 py-2 text-xs font-medium border ${
                        step.type === "ai" ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300" :
                        step.type === "human" ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300" :
                        "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      }`}>
                        <div className="text-[10px] uppercase font-bold mb-0.5 opacity-60">{step.module}</div>
                        {step.step}
                      </div>
                      {i < flow.steps.length - 1 && <ArrowRight className="h-4 w-4 text-gray-300 mx-1 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-400" /> AI Step</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-green-400" /> Human Step</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gray-400" /> System Step</span>
                </div>
                <E2EFlowDiagramToggle flowCode={flow.id} flowName={flow.name} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Participating Modules</h4>
                  <div className="flex flex-wrap gap-1">{flow.participatingModules.map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">AI Agents</h4>
                  <div className="flex flex-wrap gap-1">{flow.aiAgents.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Handoff Points</h4>
                  <ul className="space-y-0.5">{flow.handoffPoints.map((h) => <li key={h} className="text-gray-600 dark:text-gray-400 text-xs">{h}</li>)}</ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">KPIs</h4>
                  <ul className="space-y-0.5">{flow.kpis.map((k) => <li key={k} className="text-gray-600 dark:text-gray-400 text-xs">{k}</li>)}</ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════ TAB 3: TEMPLATES ═══════════════ */}
      {tab === "templates" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Browse template libraries for processes and E2E flows. Clone templates to create your own customized versions.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Operational Processes Card */}
            <Link
              href="/process-definitions"
              className="group rounded-lg border bg-white dark:bg-gray-900 p-6 space-y-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Workflow className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {totalProcesses} Operational Processes
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  AI-powered process templates spanning {Object.keys(PROCESS_CATEGORY_LABELS).length} categories including operations, finance, compliance, and more.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950 px-2.5 py-1 text-xs text-green-700 dark:text-green-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {fullAuto} Full Auto
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 dark:bg-yellow-950 px-2.5 py-1 text-xs text-yellow-700 dark:text-yellow-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  {semiAuto} Semi-Auto
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {aiAssisted} AI-Assisted
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  {manualAi} Manual + AI
                </span>
              </div>
            </Link>

            {/* E2E Flows Card */}
            <Link
              href="/flow-definitions"
              className="group rounded-lg border bg-white dark:bg-gray-900 p-6 space-y-4 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <GitBranch className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {totalE2E} E2E Flows
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  End-to-end flow templates that orchestrate multiple processes across modules with human gates and AI agents.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950 px-2.5 py-1 text-xs text-purple-700 dark:text-purple-300">
                  <Zap className="h-3 w-3" />
                  Multi-module orchestration
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950 px-2.5 py-1 text-xs text-purple-700 dark:text-purple-300">
                  <Users className="h-3 w-3" />
                  Human gates
                </span>
              </div>
            </Link>
          </div>

          {/* Category Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Browse by Category
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(Object.keys(PROCESS_CATEGORY_LABELS) as ProcessCategory[]).map((cat) => {
                const catInfo = PROCESS_CATEGORY_LABELS[cat];
                const CatIcon = CATEGORY_ICONS[cat];
                const catCount = OPERATIONAL_PROCESSES.filter((p) => DOMAIN_TO_CATEGORY[p.domain] === cat).length;

                return (
                  <Link
                    key={cat}
                    href={`/processes?tab=processes&category=${cat}`}
                    className="flex items-center gap-3 rounded-lg border bg-white dark:bg-gray-900 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <CatIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {catInfo.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {catCount} processes
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
