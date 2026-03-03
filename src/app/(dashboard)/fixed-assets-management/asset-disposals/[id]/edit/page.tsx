import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAssetDisposal } from "@/lib/fixed-assets-management/service";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";

const DISPOSAL_FIELDS: FieldConfig[] = [
  {
    name: "disposalType",
    label: "Disposal Type",
    type: "select",
    required: true,
    options: [
      { value: "sale", label: "Sale" },
      { value: "scrap", label: "Scrap" },
      { value: "donation", label: "Donation" },
      { value: "trade_in", label: "Trade In" },
      { value: "write_off", label: "Write Off" },
      { value: "theft_loss", label: "Theft/Loss" },
    ],
  },
  { name: "assetRef", label: "Asset Ref", type: "text" },
  { name: "assetName", label: "Asset Name", type: "text" },
  { name: "disposalDate", label: "Disposal Date", type: "datetime-local" },
  {
    name: "bookValueAtDisposal",
    label: "Book Value at Disposal",
    type: "text",
  },
  { name: "saleProceeds", label: "Sale Proceeds", type: "text" },
  { name: "gainLoss", label: "Gain/Loss", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "buyerName", label: "Buyer Name", type: "text" },
  { name: "buyerContact", label: "Buyer Contact", type: "text" },
  { name: "disposalReason", label: "Disposal Reason", type: "textarea" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvalDate", label: "Approval Date", type: "datetime-local" },
  { name: "certificateRef", label: "Certificate Ref", type: "text" },
  {
    name: "environmentalCompliance",
    label: "Environmental Compliance",
    type: "checkbox",
  },
  { name: "journalEntryRef", label: "Journal Entry Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAssetDisposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:edit")))
    redirect("/fixed-assets-management/asset-disposals");

  const { id } = await params;

  const record = await getAssetDisposal(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    disposalType: record.disposalType ?? "",
    assetRef: record.assetRef ?? "",
    assetName: record.assetName ?? "",
    disposalDate: record.disposalDate
      ? new Date(record.disposalDate).toISOString()
      : "",
    bookValueAtDisposal: record.bookValueAtDisposal ?? "",
    saleProceeds: record.saleProceeds ?? "",
    gainLoss: record.gainLoss ?? "",
    currency: record.currency ?? "",
    buyerName: record.buyerName ?? "",
    buyerContact: record.buyerContact ?? "",
    disposalReason: record.disposalReason ?? "",
    approvedBy: record.approvedBy ?? "",
    approvalDate: record.approvalDate
      ? new Date(record.approvalDate).toISOString()
      : "",
    certificateRef: record.certificateRef ?? "",
    environmentalCompliance: record.environmentalCompliance ?? false,
    journalEntryRef: record.journalEntryRef ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fixed-assets-management/asset-disposals/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Asset Disposal
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Asset Disposal"
          apiPath={`/api/v1/fixed-assets-management/asset-disposals/${id}`}
          fields={DISPOSAL_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/fixed-assets-management/asset-disposals/${id}`}
        />
      </div>
    </div>
  );
}
