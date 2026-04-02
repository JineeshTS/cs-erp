import Link from "next/link";
import { Pencil, ArrowLeft, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  cvmCharterParties,
  cvmVoyageEstimates,
  cvmHireStatements,
  cvmLaytimeCalculations,
  cvmVesselPerformances,
  cvmOffHireEvents,
  cvmDeliveryReports,
  cvmVoyagePnl,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  VoyageEstimate,
  HireStatement,
  LaytimeCalculation,
  VesselPerformance,
  OffHireEvent,
  DeliveryReport,
  VoyagePnl,
} from "@/types/chartering-vessel-management";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "voyage-estimates", label: "Voyage Estimates" },
  { key: "hire-statements", label: "Hire Statements" },
  { key: "laytime", label: "Laytime" },
  { key: "performance", label: "Performance" },
  { key: "off-hire", label: "Off-Hire" },
  { key: "delivery", label: "Delivery Reports" },
  { key: "pnl", label: "Voyage P&L" },
];

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

function fmtAmt(v: number | null): string {
  return v !== null ? v.toLocaleString() : "-";
}

export default async function CharterPartyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;
  const sp = await searchParams;
  const tab = sp.tab ?? "overview";

  const cp = await db
    .select()
    .from(cvmCharterParties)
    .where(
      and(
        eq(cvmCharterParties.id, id),
        eq(cvmCharterParties.tenantId, session.tenantId),
        isNull(cvmCharterParties.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!cp) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "chartering:edit");
  const canCreate = await hasPermission(session.id, session.tenantId, "chartering:create");

  let voyageEstimates: VoyageEstimate[] = [];
  let hireStatements: HireStatement[] = [];
  let laytimeCalcs: LaytimeCalculation[] = [];
  let performances: VesselPerformance[] = [];
  let offHires: OffHireEvent[] = [];
  let deliveries: DeliveryReport[] = [];
  let pnls: VoyagePnl[] = [];

  switch (tab) {
    case "voyage-estimates":
      voyageEstimates = await db
        .select()
        .from(cvmVoyageEstimates)
        .where(
          and(
            eq(cvmVoyageEstimates.charterPartyId, id),
            eq(cvmVoyageEstimates.tenantId, session.tenantId),
            isNull(cvmVoyageEstimates.deletedAt)
          )
        )
        .orderBy(desc(cvmVoyageEstimates.createdAt))
        .limit(50);
      break;
    case "hire-statements":
      hireStatements = await db
        .select()
        .from(cvmHireStatements)
        .where(
          and(
            eq(cvmHireStatements.charterPartyId, id),
            eq(cvmHireStatements.tenantId, session.tenantId),
            isNull(cvmHireStatements.deletedAt)
          )
        )
        .orderBy(desc(cvmHireStatements.createdAt))
        .limit(50);
      break;
    case "laytime":
      laytimeCalcs = await db
        .select()
        .from(cvmLaytimeCalculations)
        .where(
          and(
            eq(cvmLaytimeCalculations.charterPartyId, id),
            eq(cvmLaytimeCalculations.tenantId, session.tenantId),
            isNull(cvmLaytimeCalculations.deletedAt)
          )
        )
        .orderBy(desc(cvmLaytimeCalculations.createdAt))
        .limit(50);
      break;
    case "performance":
      {
        const veIds = await db
          .select({ id: cvmVoyageEstimates.id })
          .from(cvmVoyageEstimates)
          .where(
            and(
              eq(cvmVoyageEstimates.charterPartyId, id),
              eq(cvmVoyageEstimates.tenantId, session.tenantId),
              isNull(cvmVoyageEstimates.deletedAt)
            )
          );
        if (veIds.length > 0) {
          const allPerf: VesselPerformance[] = [];
          for (const ve of veIds) {
            const p = await db
              .select()
              .from(cvmVesselPerformances)
              .where(
                and(
                  eq(cvmVesselPerformances.voyageEstimateId, ve.id),
                  eq(cvmVesselPerformances.tenantId, session.tenantId),
                  isNull(cvmVesselPerformances.deletedAt)
                )
              )
              .orderBy(desc(cvmVesselPerformances.reportDate))
              .limit(20);
            allPerf.push(...p);
          }
          performances = allPerf.slice(0, 50);
        }
      }
      break;
    case "off-hire":
      offHires = await db
        .select()
        .from(cvmOffHireEvents)
        .where(
          and(
            eq(cvmOffHireEvents.charterPartyId, id),
            eq(cvmOffHireEvents.tenantId, session.tenantId),
            isNull(cvmOffHireEvents.deletedAt)
          )
        )
        .orderBy(desc(cvmOffHireEvents.createdAt))
        .limit(50);
      break;
    case "delivery":
      deliveries = await db
        .select()
        .from(cvmDeliveryReports)
        .where(
          and(
            eq(cvmDeliveryReports.charterPartyId, id),
            eq(cvmDeliveryReports.tenantId, session.tenantId),
            isNull(cvmDeliveryReports.deletedAt)
          )
        )
        .orderBy(desc(cvmDeliveryReports.createdAt))
        .limit(50);
      break;
    case "pnl":
      {
        const veIds2 = await db
          .select({ id: cvmVoyageEstimates.id })
          .from(cvmVoyageEstimates)
          .where(
            and(
              eq(cvmVoyageEstimates.charterPartyId, id),
              eq(cvmVoyageEstimates.tenantId, session.tenantId),
              isNull(cvmVoyageEstimates.deletedAt)
            )
          );
        if (veIds2.length > 0) {
          const allPnl: VoyagePnl[] = [];
          for (const ve of veIds2) {
            const p = await db
              .select()
              .from(cvmVoyagePnl)
              .where(
                and(
                  eq(cvmVoyagePnl.voyageEstimateId, ve.id),
                  eq(cvmVoyagePnl.tenantId, session.tenantId),
                  isNull(cvmVoyagePnl.deletedAt)
                )
              )
              .limit(20);
            allPnl.push(...p);
          }
          pnls = allPnl.slice(0, 50);
        }
      }
      break;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{cp.cpReference}</h1>
          <p className="text-sm text-gray-500">
            {cp.charterType.replace(/_/g, " ")} &middot; {cp.chartererName}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/chartering-vessel-management/${id}?tab=${t.key}`}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium",
                tab === t.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="rounded-lg border bg-white p-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">CP Reference</dt>
              <dd className="mt-1 text-gray-900">{cp.cpReference}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Charter Type</dt>
              <dd className="mt-1 text-gray-900">{cp.charterType.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    cp.status === "active" || cp.status === "commenced"
                      ? "success"
                      : cp.status === "draft"
                        ? "secondary"
                        : "default"
                  }
                >
                  {cp.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Vessel</dt>
              <dd className="mt-1 text-gray-900">
                {cp.vesselName || "-"}
                {cp.vesselImo ? ` (IMO ${cp.vesselImo})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Charterer</dt>
              <dd className="mt-1 text-gray-900">{cp.chartererName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-gray-900">{cp.ownerName || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Broker</dt>
              <dd className="mt-1 text-gray-900">{cp.brokerName || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Hire Rate</dt>
              <dd className="mt-1 text-gray-900">
                {cp.hireRate !== null
                  ? `${cp.hireCurrency} ${cp.hireRate.toLocaleString()}/${cp.hirePeriodUnit}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Commission</dt>
              <dd className="mt-1 text-gray-900">
                {cp.commissionPercent ? `${cp.commissionPercent}%` : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Delivery Port</dt>
              <dd className="mt-1 text-gray-900">{cp.deliveryPort || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Redelivery Port</dt>
              <dd className="mt-1 text-gray-900">{cp.redeliveryPort || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-gray-900">
                {cp.durationDays ? `${cp.durationDays} days` : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Laycan From</dt>
              <dd className="mt-1 text-gray-900">{fmtDate(cp.laycanFrom)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Laycan To</dt>
              <dd className="mt-1 text-gray-900">{fmtDate(cp.laycanTo)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Commenced</dt>
              <dd className="mt-1 text-gray-900">{fmtDate(cp.commencedAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Terminated</dt>
              <dd className="mt-1 text-gray-900">{fmtDate(cp.terminatedAt)}</dd>
            </div>
            {cp.cpTerms && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-gray-500">CP Terms</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">{cp.cpTerms}</dd>
              </div>
            )}
            {cp.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">{cp.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Voyage Estimates Tab */}
      {tab === "voyage-estimates" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Voyage Estimates</h2>
            {canCreate && (
              <Link
                href={`/chartering-vessel-management/voyage-estimates/new?charterPartyId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            )}
          </div>
          {voyageEstimates.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No voyage estimates for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Voyage #</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Route</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Revenue</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {voyageEstimates.map((ve) => (
                    <tr key={ve.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/voyage-estimates/${ve.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {ve.voyageNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ve.vesselName || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {ve.originPort || "?"} → {ve.destinationPort || "?"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(ve.estimatedRevenue)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ve.status === "approved" ? "success" : "secondary"}>
                          {ve.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hire Statements Tab */}
      {tab === "hire-statements" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Hire Statements</h2>
            {canCreate && (
              <Link
                href={`/chartering-vessel-management/hire-statements/new?charterPartyId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            )}
          </div>
          {hireStatements.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No hire statements for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Statement #</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Period</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Hire Days</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Net Hire</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hireStatements.map((hs) => (
                    <tr key={hs.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/hire-statements/${hs.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {hs.statementNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fmtDate(hs.periodFrom)} – {fmtDate(hs.periodTo)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{hs.hireDays}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(hs.netHire)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={hs.status === "final" ? "success" : "secondary"}>
                          {hs.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Laytime Tab */}
      {tab === "laytime" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Laytime Calculations</h2>
            {canCreate && (
              <Link
                href={`/chartering-vessel-management/laytime-calculations/new?charterPartyId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            )}
          </div>
          {laytimeCalcs.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No laytime calculations for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Operation</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Allowed</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Used</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Dem/Des</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {laytimeCalcs.map((lc) => (
                    <tr key={lc.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/laytime-calculations/${lc.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {lc.portName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lc.operationType}</td>
                      <td className="px-4 py-3 text-gray-600">{lc.allowedHours}h</td>
                      <td className="px-4 py-3 text-gray-600">{lc.usedHours}h</td>
                      <td className="px-4 py-3 text-gray-600">
                        {lc.demurrageAmount ? `D: ${lc.demurrageAmount.toLocaleString()}` : lc.despatchAmount ? `S: ${lc.despatchAmount.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={lc.status === "settled" ? "success" : "secondary"}>
                          {lc.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {tab === "performance" && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vessel Performance</h2>
          </div>
          {performances.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No performance reports for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Speed (kn)</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Consumption (MT)</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Distance (NM)</th>
                  </tr>
                </thead>
                <tbody>
                  {performances.map((vp) => (
                    <tr key={vp.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/vessel-performances/${vp.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {fmtDate(vp.reportDate)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{vp.reportType}</td>
                      <td className="px-4 py-3 text-gray-600">{vp.speedKnots || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{vp.consumptionMt || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{vp.distanceNm || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Off-Hire Tab */}
      {tab === "off-hire" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Off-Hire Events</h2>
            {canCreate && (
              <Link
                href={`/chartering-vessel-management/off-hire-events/new?charterPartyId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            )}
          </div>
          {offHires.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No off-hire events for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Start</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Days</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Claim</th>
                  </tr>
                </thead>
                <tbody>
                  {offHires.map((oh) => (
                    <tr key={oh.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/off-hire-events/${oh.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {oh.eventType}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmtDate(oh.startAt)}</td>
                      <td className="px-4 py-3 text-gray-600">{oh.offHireDays || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(oh.offHireAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            oh.claimStatus === "settled"
                              ? "success"
                              : oh.claimStatus === "disputed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {oh.claimStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delivery Reports Tab */}
      {tab === "delivery" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Delivery Reports</h2>
            {canCreate && (
              <Link
                href={`/chartering-vessel-management/delivery-reports/new?charterPartyId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            )}
          </div>
          {deliveries.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No delivery reports for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((dr) => (
                    <tr key={dr.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/delivery-reports/${dr.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {dr.reportType}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{dr.portName || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtDate(dr.reportDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{dr.vesselName || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={dr.status === "final" ? "success" : "secondary"}>
                          {dr.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Voyage P&L Tab */}
      {tab === "pnl" && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Voyage P&amp;L</h2>
          </div>
          {pnls.length === 0 ? (
            <div className="rounded-lg border bg-white px-8 py-12 text-center">
              <p className="text-gray-500">No P&amp;L records for this CP.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Voyage #</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Revenue</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Total Costs</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Net Result</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">TCE</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pnls.map((pl) => (
                    <tr key={pl.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/chartering-vessel-management/voyage-pnl/${pl.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {pl.voyageNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(pl.revenue)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(pl.totalCosts)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(pl.netResult)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtAmt(pl.tceRate)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={pl.status === "final" ? "success" : "secondary"}>
                          {pl.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
