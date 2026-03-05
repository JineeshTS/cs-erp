import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OPERATIONAL_PROCESSES } from "@/data/operational-processes";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import { DOMAIN_LABELS, AUTOMATION_LABELS, TRIGGER_LABELS } from "@/types/processes";
import type { ProcessDomain, AutomationLevel, TriggerType } from "@/types/processes";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, ArrowLeft, Bot, Cpu, Users, Zap, Clock, ArrowRight } from "lucide-react";

export default async function ProcessesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read"))) redirect("/");

  const sp = await searchParams;
  const search = (sp.search ?? "").toLowerCase();
  const domain = sp.domain ?? "";
  const automation = sp.automation ?? "";
  const trigger = sp.trigger ?? "";
  const tab = sp.tab ?? "processes";

  const filtered = OPERATIONAL_PROCESSES.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search) && !p.id.toLowerCase().includes(search) && !p.agentName.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) return false;
    if (domain && p.domain !== domain) return false;
    if (automation && p.automationLevel !== automation) return false;
    if (trigger && p.trigger !== trigger) return false;
    return true;
  });

  const totalProcesses = OPERATIONAL_PROCESSES.length;
  const fullAuto = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "full_auto").length;
  const semiAuto = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "semi_auto").length;
  const aiAssisted = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "ai_assisted").length;
  const manualAi = OPERATIONAL_PROCESSES.filter((p) => p.automationLevel === "manual_ai_insights").length;
  const totalE2E = E2E_PROCESS_FLOWS.length;

  const domainCounts: Record<string, number> = {};
  for (const p of OPERATIONAL_PROCESSES) {
    domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/ai-agent-framework" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-4 w-4" /></Link>
            <h1 className="text-2xl font-bold text-gray-900">AI Operational Processes</h1>
          </div>
          <p className="text-sm text-gray-500">Complete map of {totalProcesses} AI-powered processes across 61 modules and {totalE2E} end-to-end flows</p>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2"><Cpu className="h-5 w-5 text-blue-600" /><span className="text-sm text-gray-500">Total Processes</span></div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalProcesses}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2"><span className="text-lg">🟢</span><span className="text-sm text-gray-500">Full Auto</span></div>
          <p className="mt-1 text-2xl font-bold text-green-600">{fullAuto}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2"><span className="text-lg">🟡</span><span className="text-sm text-gray-500">Semi-Auto</span></div>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{semiAuto}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2"><span className="text-lg">🔵</span><span className="text-sm text-gray-500">AI-Assisted</span></div>
          <p className="mt-1 text-2xl font-bold text-blue-600">{aiAssisted}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2"><span className="text-lg">⚪</span><span className="text-sm text-gray-500">Manual + AI</span></div>
          <p className="mt-1 text-2xl font-bold text-gray-600">{manualAi}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-purple-600" /><span className="text-sm text-gray-500">E2E Flows</span></div>
          <p className="mt-1 text-2xl font-bold text-purple-600">{totalE2E}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        <Link href={`/ai-agent-framework/processes?tab=processes${search ? `&search=${search}` : ""}${domain ? `&domain=${domain}` : ""}${automation ? `&automation=${automation}` : ""}`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "processes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Processes ({filtered.length})
        </Link>
        <Link href="/ai-agent-framework/processes?tab=e2e"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "e2e" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          End-to-End Flows ({totalE2E})
        </Link>
        <Link href="/ai-agent-framework/processes?tab=domains"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === "domains" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          By Domain
        </Link>
      </div>

      {tab === "processes" && (
        <>
          {/* Filters */}
          <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
              <div className="relative">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
                <input id="search" name="search" type="text" defaultValue={sp.search ?? ""} placeholder="Process ID, name, agent..." className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <input type="hidden" name="tab" value="processes" />
            <div>
              <label htmlFor="domain" className="mb-1 block text-xs font-medium text-gray-500">Domain</label>
              <select id="domain" name="domain" defaultValue={domain} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Domains</option>
                {Object.entries(DOMAIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="automation" className="mb-1 block text-xs font-medium text-gray-500">Automation</label>
              <select id="automation" name="automation" defaultValue={automation} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Levels</option>
                {Object.entries(AUTOMATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="trigger" className="mb-1 block text-xs font-medium text-gray-500">Trigger</label>
              <select id="trigger" name="trigger" defaultValue={trigger} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">All Triggers</option>
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
            {(search || domain || automation || trigger) && <Link href="/ai-agent-framework/processes?tab=processes" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
          </form>

          {/* Process Cards */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border bg-white px-8 py-12 text-center">
                <Bot className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-gray-500">No processes match your filters.</p>
              </div>
            ) : (
              filtered.map((p) => (
                <details key={p.id} className="group rounded-lg border bg-white">
                  <summary className="flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <span className="font-mono text-xs text-gray-400 w-16 shrink-0">{p.id}</span>
                    <span className="font-medium text-gray-900 flex-1">{p.name}</span>
                    <Badge variant="outline" className="shrink-0">{AUTOMATION_LABELS[p.automationLevel].emoji} {AUTOMATION_LABELS[p.automationLevel].label}</Badge>
                    <Badge variant="secondary" className="shrink-0">{TRIGGER_LABELS[p.trigger]}</Badge>
                    <Badge variant="default" className="shrink-0 text-xs">{DOMAIN_LABELS[p.domain].split(" ")[0]}</Badge>
                  </summary>
                  <div className="border-t px-4 py-4 space-y-4">
                    <p className="text-sm text-gray-600">{p.description}</p>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">AI Agent</h4>
                        <div className="flex items-center gap-1.5">
                          <Bot className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">{p.agentName}</span>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{p.agentType}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Input</h4>
                        <p className="text-sm text-gray-700">{p.input}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Output</h4>
                        <p className="text-sm text-gray-700">{p.output}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">SLA</h4>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{p.sla}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Processing Steps</h4>
                      <div className="flex flex-wrap gap-2">
                        {p.aiProcessingSteps.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
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
                            <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
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
                            <span key={d} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              ))
            )}
          </div>
        </>
      )}

      {tab === "e2e" && (
        <div className="space-y-6">
          {E2E_PROCESS_FLOWS.map((flow) => (
            <div key={flow.id} className="rounded-lg border bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{flow.id}</span>
                    <h3 className="text-lg font-bold text-gray-900">{flow.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{flow.description}</p>
                </div>
                <Badge variant="outline">{flow.typicalTimeline}</Badge>
              </div>

              {/* Step Diagram */}
              <div className="overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max py-2">
                  {flow.steps.map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className={`rounded-lg px-3 py-2 text-xs font-medium border ${
                        step.type === "ai" ? "bg-blue-50 border-blue-200 text-blue-800" :
                        step.type === "human" ? "bg-green-50 border-green-200 text-green-800" :
                        "bg-gray-50 border-gray-200 text-gray-700"
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
                  <ul className="space-y-0.5">{flow.handoffPoints.map((h) => <li key={h} className="text-gray-600 text-xs">{h}</li>)}</ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">KPIs</h4>
                  <ul className="space-y-0.5">{flow.kpis.map((k) => <li key={k} className="text-gray-600 text-xs">{k}</li>)}</ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "domains" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
            const domainProcesses = OPERATIONAL_PROCESSES.filter((p) => p.domain === key);
            const auto = domainProcesses.filter((p) => p.automationLevel === "full_auto").length;
            const semi = domainProcesses.filter((p) => p.automationLevel === "semi_auto").length;
            const assisted = domainProcesses.filter((p) => p.automationLevel === "ai_assisted").length;
            const manual = domainProcesses.filter((p) => p.automationLevel === "manual_ai_insights").length;
            const agents = [...new Set(domainProcesses.map((p) => p.agentName))];

            return (
              <div key={key} className="rounded-lg border bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <Badge variant="default">{domainProcesses.length}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded bg-green-50 p-2"><div className="font-bold text-green-700">{auto}</div><div className="text-green-600">Auto</div></div>
                  <div className="rounded bg-yellow-50 p-2"><div className="font-bold text-yellow-700">{semi}</div><div className="text-yellow-600">Semi</div></div>
                  <div className="rounded bg-blue-50 p-2"><div className="font-bold text-blue-700">{assisted}</div><div className="text-blue-600">Assist</div></div>
                  <div className="rounded bg-gray-50 p-2"><div className="font-bold text-gray-700">{manual}</div><div className="text-gray-600">Manual</div></div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">AI Agents ({agents.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {agents.slice(0, 6).map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                    {agents.length > 6 && <Badge variant="secondary" className="text-xs">+{agents.length - 6} more</Badge>}
                  </div>
                </div>
                <Link href={`/ai-agent-framework/processes?tab=processes&domain=${key}`} className="block text-xs text-blue-600 hover:underline">View all {domainProcesses.length} processes →</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
