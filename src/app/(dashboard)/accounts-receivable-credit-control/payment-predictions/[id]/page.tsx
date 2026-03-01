import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPaymentPrediction } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function PaymentPredictionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canEdit = await hasPermission(session.id, session.tenantId, "receivable:edit");

  const { id } = await params;
  const record = await getPaymentPrediction(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/accounts-receivable-credit-control/payment-predictions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{record.predictionRef}</h1>
            <p className="text-sm text-gray-500">Payment prediction for {record.customerName}</p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/accounts-receivable-credit-control/payment-predictions/${id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4"><h2 className="text-lg font-semibold text-gray-900">Prediction Details</h2></div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-xs font-medium text-gray-500">Prediction Ref</dt><dd className="mt-1 text-sm text-gray-900">{record.predictionRef}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Customer Name</dt><dd className="mt-1 text-sm text-gray-900">{record.customerName}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Account Number</dt><dd className="mt-1 text-sm text-gray-900">{record.accountNumber ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Invoice Ref</dt><dd className="mt-1 text-sm text-gray-900">{record.invoiceRef ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Currency</dt><dd className="mt-1 text-sm text-gray-900">{record.currency}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Invoice Amount</dt><dd className="mt-1 text-sm text-gray-900">{record.invoiceAmount?.toLocaleString()}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Outstanding Amount</dt><dd className="mt-1 text-sm text-gray-900">{record.outstandingAmount?.toLocaleString()}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Predicted Payment Date</dt><dd className="mt-1 text-sm text-gray-900">{record.predictedPaymentDate ? new Date(record.predictedPaymentDate).toLocaleDateString() : "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Predicted Amount</dt><dd className="mt-1 text-sm text-gray-900">{record.predictedAmount?.toLocaleString() ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Payment Probability</dt><dd className="mt-1 text-sm text-gray-900">{record.paymentProbability != null ? `${record.paymentProbability}%` : "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Default Probability</dt><dd className="mt-1 text-sm text-gray-900">{record.defaultProbability != null ? `${record.defaultProbability}%` : "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Payment Score</dt><dd className="mt-1 text-sm text-gray-900">{record.paymentScore ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Risk Score</dt><dd className="mt-1 text-sm text-gray-900">{record.riskScore ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Behavior Score</dt><dd className="mt-1 text-sm text-gray-900">{record.behaviorScore ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">AI Model Version</dt><dd className="mt-1 text-sm text-gray-900">{record.aiModelVersion ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Confidence Score</dt><dd className="mt-1 text-sm text-gray-900">{record.confidenceScore ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Actual Payment Date</dt><dd className="mt-1 text-sm text-gray-900">{record.actualPaymentDate ? new Date(record.actualPaymentDate).toLocaleDateString() : "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Actual Amount</dt><dd className="mt-1 text-sm text-gray-900">{record.actualAmount?.toLocaleString() ?? "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Prediction Accuracy</dt><dd className="mt-1 text-sm text-gray-900">{record.predictionAccuracy != null ? `${record.predictionAccuracy}%` : "--"}</dd></div>
          <div><dt className="text-xs font-medium text-gray-500">Status</dt><dd className="mt-1"><Badge variant={record.status === "active" ? "success" : "secondary"}>{record.status}</Badge></dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-xs font-medium text-gray-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{record.notes ?? "--"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
