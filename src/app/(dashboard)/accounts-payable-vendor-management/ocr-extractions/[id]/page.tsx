import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getOcrExtraction } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";

export default async function OcrExtractionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/accounts-payable-vendor-management");

  const { id } = await params;
  const record = await getOcrExtraction(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "payable:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Extraction Ref", value: record.extractionRef },
    { label: "Document ID", value: record.documentId },
    { label: "File Name", value: record.fileName },
    { label: "File Type", value: record.fileType },
    { label: "File Size", value: record.fileSize },
    { label: "Vendor Name", value: record.vendorName },
    { label: "Extracted Vendor Code", value: record.extractedVendorCode },
    { label: "Extracted Invoice Number", value: record.extractedInvoiceNumber },
    {
      label: "Extracted Invoice Date",
      value: record.extractedInvoiceDate
        ? new Date(record.extractedInvoiceDate).toLocaleString()
        : "--",
    },
    {
      label: "Extracted Due Date",
      value: record.extractedDueDate
        ? new Date(record.extractedDueDate).toLocaleString()
        : "--",
    },
    { label: "Extracted Currency", value: record.extractedCurrency },
    { label: "Extracted Subtotal", value: record.extractedSubtotal },
    { label: "Extracted Tax Amount", value: record.extractedTaxAmount },
    { label: "Extracted Total Amount", value: record.extractedTotalAmount },
    {
      label: "Confidence Score",
      value:
        record.confidenceScore != null
          ? `${record.confidenceScore}%`
          : null,
    },
    { label: "AI Model Version", value: record.aiModelVersion },
    { label: "Processing Time (ms)", value: record.processingTimeMs },
    { label: "Reviewed By", value: record.reviewedByName },
    {
      label: "Reviewed At",
      value: record.reviewedAt
        ? new Date(record.reviewedAt).toLocaleString()
        : "--",
    },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            record.status === "completed"
              ? "success"
              : record.status === "processing"
                ? "secondary"
                : record.status === "failed"
                  ? "destructive"
                  : record.status === "review_needed"
                    ? "warning"
                    : "secondary"
          }
        >
          {record.status}
        </Badge>
      ),
    },
    { label: "Notes", value: record.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/accounts-payable-vendor-management/ocr-extractions"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.extractionRef}
            </h1>
            <p className="text-sm text-gray-500">OCR Extraction Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/accounts-payable-vendor-management/ocr-extractions/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
