import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { proformaTemplates, proformaPortCalls, generatedVoyages } from "@/db/schema/schedule-engine";
import { eq, and, isNull, asc, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { TemplateActions } from "./template-actions";
import { PortRotationEditor } from "./port-rotation-editor";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const [template] = await db
    .select()
    .from(proformaTemplates)
    .where(and(
      eq(proformaTemplates.id, id),
      eq(proformaTemplates.tenantId, session.tenantId),
      isNull(proformaTemplates.deletedAt),
    ))
    .limit(1);

  if (!template) notFound();

  const portCalls = await db
    .select()
    .from(proformaPortCalls)
    .where(and(
      eq(proformaPortCalls.templateId, id),
      eq(proformaPortCalls.tenantId, session.tenantId),
    ))
    .orderBy(asc(proformaPortCalls.sequence));

  const voyages = await db
    .select()
    .from(generatedVoyages)
    .where(and(
      eq(generatedVoyages.templateId, id),
      eq(generatedVoyages.tenantId, session.tenantId),
      isNull(generatedVoyages.deletedAt),
    ))
    .orderBy(desc(generatedVoyages.startDate))
    .limit(20);

  const canCreate = await hasPermission(session.id, session.tenantId, "schedule:create");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/schedule-engine" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-gray-800">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">{template.serviceName}</h1>
            <Badge variant={template.status === "active" ? "default" : "secondary"}>{template.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Code: {template.serviceCode} · Every {template.frequencyDays} days · {template.totalRotationDays}-day rotation
          </p>
        </div>
      </div>

      {/* Template Info */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Frequency</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{template.frequencyDays} days</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Rotation</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{template.totalRotationDays} days</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Ports</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{portCalls.length}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Voyages Generated</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{voyages.length}</p>
        </div>
      </div>

      {/* Port Rotation — editable if user has create permission */}
      {canCreate ? (
        <PortRotationEditor templateId={id} initialPortCalls={portCalls} />
      ) : (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">Port Rotation (Proforma)</h2>
          {portCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12 dark:border-gray-600">
              <p className="text-sm text-slate-500 dark:text-gray-400">No port rotation defined yet</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Seq</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Port</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Distance (nm)</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Steaming (hrs)</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Port Stay (hrs)</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Day Offset</th>
                  </tr>
                </thead>
                <tbody>
                  {portCalls.map((pc) => (
                    <tr key={pc.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-gray-100">{pc.sequence}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-gray-100">{pc.portName}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">{pc.portCode}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-gray-400">{pc.distanceNm || "—"}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-gray-400">{pc.steamingHours || "—"}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-gray-400">{pc.portStayHours}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-gray-400">Day {pc.dayOffset}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Generate Schedule Button + Voyages */}
      {canCreate && portCalls.length >= 2 && (
        <TemplateActions templateId={id} />
      )}

      {/* Generated Voyages */}
      {voyages.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">Generated Voyages</h2>
          <div className="rounded-lg border border-slate-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Voyage #</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Cycle</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Start</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">End</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {voyages.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-gray-100">{v.voyageNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-gray-400">{v.cycleNumber || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-gray-400">{v.startDate}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-gray-400">{v.endDate || "—"}</td>
                    <td className="px-4 py-2.5"><Badge variant="secondary">{v.status}</Badge></td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/schedule-engine/voyages/${v.id}`} className="text-sm font-medium text-brand-600">View</Link>
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
