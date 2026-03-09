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
} from "lucide-react";

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
  const tab = sp.tab ?? "processes";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Process Hub</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {totalProcesses} AI-powered operational processes across {Object.keys(PROCESS_CATEGORY_LABELS).length} categories and {totalE2E} end-to-end flows
        </p>
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
          href={`/processes?tab=processes${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}${domain ? `&domain=${domain}` : ""}${automation ? `&automation=${automation}` : ""}${trigger ? `&trigger=${trigger}` : ""}`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "processes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          All Processes ({filtered.length})
        </Link>
        <Link
          href="/processes?tab=e2e"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "e2e" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          E2E Flows ({totalE2E})
        </Link>
        <Link
          href="/processes?tab=categories"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "categories" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
        >
          By Category
        </Link>
      </div>

      {/* ═══════════════ TAB 1: ALL PROCESSES ═══════════════ */}
      {tab === "processes" && (
        <>
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
          {E2E_PROCESS_FLOWS.map((flow) => (
            <div key={flow.id} className="rounded-lg border bg-white dark:bg-gray-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{flow.id}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{flow.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{flow.description}</p>
                </div>
                <div className="flex items-center gap-2">
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

              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-400" /> AI Step</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-green-400" /> Human Step</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gray-400" /> System Step</span>
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

      {/* ═══════════════ TAB 3: BY CATEGORY ═══════════════ */}
      {tab === "categories" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(PROCESS_CATEGORY_LABELS) as ProcessCategory[]).map((cat) => {
            const catInfo = PROCESS_CATEGORY_LABELS[cat];
            const CatIcon = CATEGORY_ICONS[cat];
            const catProcesses = OPERATIONAL_PROCESSES.filter((p) => DOMAIN_TO_CATEGORY[p.domain] === cat);
            const auto = catProcesses.filter((p) => p.automationLevel === "full_auto").length;
            const semi = catProcesses.filter((p) => p.automationLevel === "semi_auto").length;
            const assisted = catProcesses.filter((p) => p.automationLevel === "ai_assisted").length;
            const manual = catProcesses.filter((p) => p.automationLevel === "manual_ai_insights").length;
            const agents = [...new Set(catProcesses.map((p) => p.agentName))];

            return (
              <div key={cat} className="rounded-lg border bg-white dark:bg-gray-900 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CatIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{catInfo.label}</h3>
                  </div>
                  <Badge variant="default">{catProcesses.length}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{catInfo.description}</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded bg-green-50 dark:bg-green-950 p-2">
                    <div className="font-bold text-green-700 dark:text-green-400">{auto}</div>
                    <div className="text-green-600 dark:text-green-500">Auto</div>
                  </div>
                  <div className="rounded bg-yellow-50 dark:bg-yellow-950 p-2">
                    <div className="font-bold text-yellow-700 dark:text-yellow-400">{semi}</div>
                    <div className="text-yellow-600 dark:text-yellow-500">Semi</div>
                  </div>
                  <div className="rounded bg-blue-50 dark:bg-blue-950 p-2">
                    <div className="font-bold text-blue-700 dark:text-blue-400">{assisted}</div>
                    <div className="text-blue-600 dark:text-blue-500">Assist</div>
                  </div>
                  <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
                    <div className="font-bold text-gray-700 dark:text-gray-300">{manual}</div>
                    <div className="text-gray-600 dark:text-gray-400">Manual</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">AI Agents ({agents.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {agents.slice(0, 6).map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                    {agents.length > 6 && <Badge variant="secondary" className="text-xs">+{agents.length - 6} more</Badge>}
                  </div>
                </div>
                <Link href={`/processes?tab=processes&category=${cat}`} className="block text-xs text-blue-600 hover:underline">
                  View all {catProcesses.length} processes →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
