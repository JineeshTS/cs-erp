import Link from "next/link";
import { Plus, Ship, Calendar, Anchor } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { proformaTemplates, generatedVoyages } from "@/db/schema/schedule-engine";
import { Badge } from "@/components/ui/badge";

export default async function ScheduleEnginePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canCreate = await hasPermission(session.id, session.tenantId, "schedule:create");

  // Fetch templates
  const templates = await db
    .select()
    .from(proformaTemplates)
    .where(and(eq(proformaTemplates.tenantId, session.tenantId), isNull(proformaTemplates.deletedAt)))
    .orderBy(desc(proformaTemplates.createdAt))
    .limit(20);

  // Fetch recent voyages
  const voyages = await db
    .select()
    .from(generatedVoyages)
    .where(and(eq(generatedVoyages.tenantId, session.tenantId), isNull(generatedVoyages.deletedAt)))
    .orderBy(desc(generatedVoyages.startDate))
    .limit(10);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">
            Schedule Engine
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Proforma templates, schedule generation, and voyage management
          </p>
        </div>
        {canCreate && (
          <Link
            href="/schedule-engine/templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Ship className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">{templates.length}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400">Service Templates</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">{voyages.length}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400">Generated Voyages</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Anchor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                {templates.filter(t => t.status === "active").length}
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-400">Active Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">Service Templates</h2>
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12 dark:border-gray-600">
            <Ship className="h-10 w-10 text-slate-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">No templates yet</p>
            {canCreate && (
              <Link href="/schedule-engine/templates/new" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
                Create your first service template
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Rotation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-gray-100">{t.serviceName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">{t.serviceCode}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">Every {t.frequencyDays} days</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">{t.totalRotationDays} days</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/schedule-engine/templates/${t.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Voyages */}
      {voyages.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">Recent Voyages</h2>
          <div className="rounded-lg border border-slate-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Voyage #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Cycle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">End</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {voyages.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-gray-100">{v.voyageNumber}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">{v.cycleNumber || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">{v.startDate}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">{v.endDate || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={v.status === "planned" ? "secondary" : "default"}>{v.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/schedule-engine/voyages/${v.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
