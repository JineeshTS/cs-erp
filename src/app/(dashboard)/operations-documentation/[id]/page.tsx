import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  odmBillsOfLading,
  odmBlContainers,
  odmBlCharges,
  odmManifests,
  odmManifestItems,
  odmRegulatoryFilings,
  odmVgmRecords,
  odmShippingInstructions,
  odmCargoTrackingEvents,
  odmDocumentAmendments,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteButton } from "@/components/ui/delete-button";


const TABS = [
  { key: "overview", label: "Overview" },
  { key: "containers", label: "Containers" },
  { key: "charges", label: "Charges" },
  { key: "manifests", label: "Manifests" },
  { key: "manifest-items", label: "Manifest Items" },
  { key: "filings", label: "Filings" },
  { key: "vgm", label: "VGM" },
  { key: "instructions", label: "Shipping Instructions" },
  { key: "tracking", label: "Tracking Events" },
  { key: "amendments", label: "Amendments" },
] as const;

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function BlDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/operations-documentation");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db
    .select()
    .from(odmBillsOfLading)
    .where(
      and(
        eq(odmBillsOfLading.id, id),
        eq(odmBillsOfLading.tenantId, session.tenantId),
        isNull(odmBillsOfLading.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "operations:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "operations:delete");

  const tenantFilter = session.tenantId;
  const [
    containers,
    charges,
    manifests,
    manifestItems,
    filings,
    vgmRecords,
    instructions,
    trackingEvents,
    amendments,
  ] = await Promise.all([
    db.select().from(odmBlContainers).where(and(eq(odmBlContainers.tenantId, tenantFilter), eq(odmBlContainers.blId, id), isNull(odmBlContainers.deletedAt))).orderBy(desc(odmBlContainers.createdAt)).limit(50),
    db.select().from(odmBlCharges).where(and(eq(odmBlCharges.tenantId, tenantFilter), eq(odmBlCharges.blId, id), isNull(odmBlCharges.deletedAt))).orderBy(desc(odmBlCharges.createdAt)).limit(50),
    db.select().from(odmManifests).where(and(eq(odmManifests.tenantId, tenantFilter), isNull(odmManifests.deletedAt))).orderBy(desc(odmManifests.createdAt)).limit(50),
    db.select().from(odmManifestItems).where(and(eq(odmManifestItems.tenantId, tenantFilter), isNull(odmManifestItems.deletedAt))).orderBy(desc(odmManifestItems.createdAt)).limit(50),
    db.select().from(odmRegulatoryFilings).where(and(eq(odmRegulatoryFilings.tenantId, tenantFilter), isNull(odmRegulatoryFilings.deletedAt))).orderBy(desc(odmRegulatoryFilings.createdAt)).limit(50),
    db.select().from(odmVgmRecords).where(and(eq(odmVgmRecords.tenantId, tenantFilter), isNull(odmVgmRecords.deletedAt))).orderBy(desc(odmVgmRecords.createdAt)).limit(50),
    db.select().from(odmShippingInstructions).where(and(eq(odmShippingInstructions.tenantId, tenantFilter), isNull(odmShippingInstructions.deletedAt))).orderBy(desc(odmShippingInstructions.createdAt)).limit(50),
    db.select().from(odmCargoTrackingEvents).where(and(eq(odmCargoTrackingEvents.tenantId, tenantFilter), isNull(odmCargoTrackingEvents.deletedAt))).orderBy(desc(odmCargoTrackingEvents.createdAt)).limit(50),
    db.select().from(odmDocumentAmendments).where(and(eq(odmDocumentAmendments.tenantId, tenantFilter), eq(odmDocumentAmendments.blId, id), isNull(odmDocumentAmendments.deletedAt))).orderBy(desc(odmDocumentAmendments.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    containers: {
      headers: ["Container #", "Seal #", "Type", "Size", "Gross Wt", "Packages", "HS Code"],
      rows: containers.map((c) => [c.containerNumber, c.sealNumber ?? "-", c.containerType ?? "-", c.containerSize ?? "-", c.grossWeight?.toString() ?? "-", c.packageCount?.toString() ?? "-", c.hsCode ?? "-"]),
    },
    charges: {
      headers: ["Code", "Name", "Type", "Amount", "Currency", "Prepaid/Collect"],
      rows: charges.map((c) => [c.chargeCode, c.chargeName, c.chargeType, c.amount.toString(), c.currency ?? "USD", c.prepaidCollect ?? "-"]),
    },
    manifests: {
      headers: ["Number", "Type", "Vessel", "Voyage", "Status", "Created"],
      rows: manifests.map((m) => [m.manifestNumber, m.manifestType, m.vesselName, m.voyageNumber, m.status, fmtDate(m.createdAt)]),
    },
    "manifest-items": {
      headers: ["BL Number", "Container", "Shipper", "Consignee", "Gross Wt", "Packages"],
      rows: manifestItems.map((i) => [i.blNumber ?? "-", i.containerNumber ?? "-", i.shipperName ?? "-", i.consigneeName ?? "-", i.grossWeight?.toString() ?? "-", i.packageCount?.toString() ?? "-"]),
    },
    filings: {
      headers: ["Reference", "Type", "Body", "Country", "Deadline", "Status"],
      rows: filings.map((f) => [f.filingReference, f.filingType, f.regulatoryBody, f.country, fmtDate(f.filingDeadline), f.status]),
    },
    vgm: {
      headers: ["Reference", "Container", "Method", "VGM (kg)", "Certified By", "Status"],
      rows: vgmRecords.map((v) => [v.vgmReference, v.containerNumber, v.weighingMethod, v.verifiedGrossMass.toString(), v.certifiedBy, v.status]),
    },
    instructions: {
      headers: ["Reference", "Shipper", "Consignee", "Booking", "Status", "Created"],
      rows: instructions.map((s) => [s.siReference, s.shipperName, s.consigneeName, s.bookingReference ?? "-", s.status, fmtDate(s.createdAt)]),
    },
    tracking: {
      headers: ["Event Code", "Type", "Location", "Port", "Date", "Actual"],
      rows: trackingEvents.map((e) => [e.eventCode, e.eventType, e.eventLocation ?? "-", e.eventPort ?? "-", fmtDate(e.eventDate), e.isActual ? "Yes" : "No"]),
    },
    amendments: {
      headers: ["Number", "Type", "Field", "Old Value", "New Value", "Status"],
      rows: amendments.map((a) => [a.amendmentNumber, a.amendmentType, a.fieldChanged, (a.oldValue ?? "-").slice(0, 30), (a.newValue ?? "-").slice(0, 30), a.status]),
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.blNumber}</h1>
          <p className="text-sm text-gray-500">{record.shipperName} &rarr; {record.consigneeName}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/operations-documentation/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/operations-documentation/bills-of-lading/${id}`} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/operations-documentation/${id}?tab=${tab.key}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "BL Number", value: record.blNumber },
              { label: "BL Type", value: record.blType },
              { label: "Status", value: record.blStatus },
              { label: "Booking Ref", value: record.bookingReference ?? "-" },
              { label: "Shipper", value: record.shipperName },
              { label: "Consignee", value: record.consigneeName },
              { label: "Notify Party", value: record.notifyPartyName ?? "-" },
              { label: "Vessel", value: record.vesselName ?? "-" },
              { label: "Voyage", value: record.voyageNumber ?? "-" },
              { label: "Port of Loading", value: record.portOfLoading ?? "-" },
              { label: "Port of Discharge", value: record.portOfDischarge ?? "-" },
              { label: "Place of Receipt", value: record.placeOfReceipt ?? "-" },
              { label: "Place of Delivery", value: record.placeOfDelivery ?? "-" },
              { label: "Date of Issue", value: record.dateOfIssue ?? "-" },
              { label: "On Board Date", value: record.onBoardDate ?? "-" },
              { label: "Freight Terms", value: record.freightTerms ?? "-" },
              { label: "Payment Terms", value: record.paymentTerms ?? "-" },
              { label: "Originals", value: record.numberOfOriginals?.toString() ?? "-" },
              { label: "Containers", value: record.containerCount?.toString() ?? "-" },
              { label: "Gross Weight", value: record.grossWeight ? `${record.grossWeight} ${record.weightUnit ?? "KG"}` : "-" },
              { label: "Volume", value: record.volume ? `${record.volume} ${record.volumeUnit ?? "CBM"}` : "-" },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
          {record.cargoDescription && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Cargo Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.cargoDescription}</p>
            </div>
          )}
          {record.specialInstructions && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Special Instructions</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.specialInstructions}</p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {j === row.length - 1 ? (
                          <Badge variant="secondary">{String(cell).replace(/_/g, " ")}</Badge>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
