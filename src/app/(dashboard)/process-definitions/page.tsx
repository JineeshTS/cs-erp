import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Search,
  Copy,
  Edit,
  Eye,
  Database,
  Layers,
  Globe,
  Plus,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import {
  peProcessDefinitions,
  peProcessTaskLinks,
} from "@/db/schema";
import { eq, and, isNull, desc, or, ilike, count, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

// ── Domain display config ──

const DOMAIN_LABELS: Record<string, string> = {
  sales_crm: "Sales CRM",
  commercial_pricing: "Commercial Pricing",
  customer_service: "Customer Service",
  operations_documentation: "Operations & Docs",
  freight_invoicing: "Freight Invoicing",
  accounts_receivable: "Accounts Receivable",
  accounts_payable: "Accounts Payable",
  chartering_vessel: "Chartering & Vessel",
  capacity_voyage: "Capacity & Voyage",
  equipment_control: "Equipment Control",
  customs_compliance: "Customs & Compliance",
};

const AUTOMATION_LABELS: Record<string, string> = {
  full_auto: "Full Auto",
  semi_auto: "Semi Auto",
  ai_assisted: "AI Assisted",
  manual_ai_insights: "Manual + AI",
};

const AUTOMATION_BADGE_VARIANT: Record<string, "success" | "info" | "warning" | "secondary"> = {
  full_auto: "success",
  semi_auto: "info",
  ai_assisted: "warning",
  manual_ai_insights: "secondary",
};

interface PageProps {
  searchParams: Promise<{
    domain?: string;
    automationLevel?: string;
    search?: string;
  }>;
}

export default async function ProcessDefinitionsPage({
  searchParams,
}: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "workflows:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "workflows:create"
  );

  const sp = await searchParams;
  const filterDomain = sp.domain ?? "";
  const filterAutomation = sp.automationLevel ?? "";
  const filterSearch = sp.search ?? "";

  // ── Build conditions for system templates ──
  const systemConditions = [
    eq(peProcessDefinitions.source, "system"),
    isNull(peProcessDefinitions.tenantId),
    isNull(peProcessDefinitions.deletedAt),
  ];

  // ── Build conditions for "My Processes" ──
  const myConditions = [
    eq(peProcessDefinitions.tenantId, session.tenantId),
    isNull(peProcessDefinitions.deletedAt),
  ];

  // Shared filter conditions
  if (filterDomain) {
    systemConditions.push(eq(peProcessDefinitions.domain, filterDomain));
    myConditions.push(eq(peProcessDefinitions.domain, filterDomain));
  }
  if (filterAutomation) {
    systemConditions.push(
      eq(peProcessDefinitions.automationLevel, filterAutomation)
    );
    myConditions.push(
      eq(peProcessDefinitions.automationLevel, filterAutomation)
    );
  }
  if (filterSearch) {
    const escaped = filterSearch
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");
    const searchFilter = or(
      ilike(peProcessDefinitions.name, `%${escaped}%`),
      ilike(peProcessDefinitions.processCode, `%${escaped}%`)
    )!;
    systemConditions.push(searchFilter);
    myConditions.push(searchFilter);
  }

  // ── Fetch data in parallel ──
  const [systemProcesses, myProcesses, statsRows] = await Promise.all([
    db
      .select()
      .from(peProcessDefinitions)
      .where(and(...systemConditions))
      .orderBy(peProcessDefinitions.processCode)
      .limit(50),
    db
      .select()
      .from(peProcessDefinitions)
      .where(and(...myConditions))
      .orderBy(desc(peProcessDefinitions.createdAt))
      .limit(50),
    Promise.all([
      db
        .select({ count: count() })
        .from(peProcessDefinitions)
        .where(
          and(
            eq(peProcessDefinitions.source, "system"),
            isNull(peProcessDefinitions.tenantId),
            isNull(peProcessDefinitions.deletedAt)
          )
        ),
      db
        .select({ count: count() })
        .from(peProcessDefinitions)
        .where(
          and(
            eq(peProcessDefinitions.tenantId, session.tenantId),
            isNull(peProcessDefinitions.deletedAt)
          )
        ),
      db
        .select({ domain: peProcessDefinitions.domain })
        .from(peProcessDefinitions)
        .where(
          and(
            isNull(peProcessDefinitions.deletedAt),
            sql`${peProcessDefinitions.domain} IS NOT NULL`
          )
        )
        .groupBy(peProcessDefinitions.domain),
    ]),
  ]);

  const systemTotal = Number(statsRows[0][0]?.count ?? 0);
  const customTotal = Number(statsRows[1][0]?.count ?? 0);
  const domainsCovered = statsRows[2].length;

  // ── Batch fetch task counts for displayed processes ──
  const allProcessIds = [
    ...systemProcesses.map((p) => p.id),
    ...myProcesses.map((p) => p.id),
  ];

  let taskCounts: Record<string, number> = {};
  if (allProcessIds.length > 0) {
    const rows = await db
      .select({
        processDefinitionId: peProcessTaskLinks.processDefinitionId,
        count: count(),
      })
      .from(peProcessTaskLinks)
      .where(
        and(
          sql`${peProcessTaskLinks.processDefinitionId} = ANY(${allProcessIds})`,
          isNull(peProcessTaskLinks.deletedAt)
        )
      )
      .groupBy(peProcessTaskLinks.processDefinitionId);

    for (const row of rows) {
      taskCounts[row.processDefinitionId] = Number(row.count);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Process Definitions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Browse system templates and manage your custom process definitions
          </p>
        </div>
        {canCreate && (
          <Link
            href="/process-definitions/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Process
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Database className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {systemTotal}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              System Templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Layers className="h-8 w-8 text-emerald-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {customTotal}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              My Processes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Globe className="h-8 w-8 text-violet-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {domainsCovered}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Domains Covered
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="domain"
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            Domain
          </label>
          <select
            name="domain"
            id="domain"
            defaultValue={filterDomain}
            className="rounded-md border bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">All Domains</option>
            {Object.entries(DOMAIN_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="automationLevel"
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            Automation Level
          </label>
          <select
            name="automationLevel"
            id="automationLevel"
            defaultValue={filterAutomation}
            className="rounded-md border bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">All Levels</option>
            {Object.entries(AUTOMATION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              name="search"
              id="search"
              type="text"
              placeholder="Search by name or code..."
              defaultValue={filterSearch}
              className="rounded-md border bg-white py-2 pe-3 ps-9 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Filter
        </button>
      </form>

      {/* System Templates Section */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
          System Templates
          <span className="ms-2 text-sm font-normal text-gray-500">
            ({systemProcesses.length} shown)
          </span>
        </h2>
        {systemProcesses.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No system templates match your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:border-gray-600 dark:bg-gray-900">
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Code
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Domain
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Automation
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    SLA
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Tasks
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {systemProcesses.map((proc) => (
                  <tr
                    key={proc.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                        {proc.processCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/process-definitions/${proc.id}`}
                        className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                      >
                        {proc.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {proc.domain ? (
                        <Badge variant="info">
                          {DOMAIN_LABELS[proc.domain] ?? proc.domain}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {proc.automationLevel ? (
                        <Badge
                          variant={
                            AUTOMATION_BADGE_VARIANT[proc.automationLevel] ??
                            "secondary"
                          }
                        >
                          {AUTOMATION_LABELS[proc.automationLevel] ??
                            proc.automationLevel}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {proc.sla ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {taskCounts[proc.id] ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/process-definitions/${proc.id}`}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        {canCreate && (
                          <form
                            action={`/api/v1/process-definitions/${proc.id}/clone`}
                            method="POST"
                          >
                            <button
                              type="button"
                              data-clone-id={proc.id}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Clone
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* My Processes Section */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
          My Processes
          <span className="ms-2 text-sm font-normal text-gray-500">
            ({myProcesses.length} shown)
          </span>
        </h2>
        {myProcesses.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No custom processes yet. Clone a system template or create a new
              one to get started.
            </p>
            {canCreate && (
              <Link
                href="/process-definitions/new"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Create your first process definition
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:border-gray-600 dark:bg-gray-900">
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Code
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Domain
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Automation
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Source
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    SLA
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Tasks
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {myProcesses.map((proc) => (
                  <tr
                    key={proc.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                        {proc.processCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/process-definitions/${proc.id}`}
                        className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                      >
                        {proc.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {proc.domain ? (
                        <Badge variant="info">
                          {DOMAIN_LABELS[proc.domain] ?? proc.domain}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {proc.automationLevel ? (
                        <Badge
                          variant={
                            AUTOMATION_BADGE_VARIANT[proc.automationLevel] ??
                            "secondary"
                          }
                        >
                          {AUTOMATION_LABELS[proc.automationLevel] ??
                            proc.automationLevel}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          proc.source === "cloned" ? "warning" : "secondary"
                        }
                      >
                        {proc.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {proc.sla ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {taskCounts[proc.id] ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/process-definitions/${proc.id}`}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <Link
                          href={`/process-definitions/${proc.id}?edit=true`}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
