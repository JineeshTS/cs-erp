import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Anchor } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getHullMachineryInsurance } from "@/lib/insurance-claims-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "destructive";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function HullMachineryInsuranceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const { id } = await params;
  const record = await getHullMachineryInsurance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/insurance-claims-management/hull-machinery-insurances"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Anchor className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.policyRef}</h1>
            <p className="text-sm text-muted-foreground">Hull & Machinery Insurance Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:edit")) && (
          <Link
            href={`/insurance-claims-management/hull-machinery-insurances/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Policy Ref</dt>
          <dd className="mt-1 text-sm">{record.policyRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Policy Type</dt>
          <dd className="mt-1 text-sm">{record.policyType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Insurer Name</dt>
          <dd className="mt-1 text-sm">{record.insurerName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Insurer Contact Name</dt>
          <dd className="mt-1 text-sm">{record.insurerContactName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Insurer Contact Email</dt>
          <dd className="mt-1 text-sm">{record.insurerContactEmail ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">IMO Number</dt>
          <dd className="mt-1 text-sm">{record.imoNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Value</dt>
          <dd className="mt-1 text-sm">{record.vesselValue ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Insured Value</dt>
          <dd className="mt-1 text-sm">{record.insuredValue ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Value Currency</dt>
          <dd className="mt-1 text-sm">{record.valueCurrency ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Coverage Start</dt>
          <dd className="mt-1 text-sm">{record.coverageStart?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Coverage End</dt>
          <dd className="mt-1 text-sm">{record.coverageEnd?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Premium Amount</dt>
          <dd className="mt-1 text-sm">{record.premiumAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Premium Currency</dt>
          <dd className="mt-1 text-sm">{record.premiumCurrency ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Deductible Amount</dt>
          <dd className="mt-1 text-sm">{record.deductibleAmount ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Trading Limits</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.tradingLimits ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Classification Required</dt>
          <dd className="mt-1 text-sm">{record.classificationRequired ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Condition Survey Required</dt>
          <dd className="mt-1 text-sm">{record.conditionSurveyRequired ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Last Survey Date</dt>
          <dd className="mt-1 text-sm">{record.lastSurveyDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Renewal Date</dt>
          <dd className="mt-1 text-sm">{record.renewalDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Broker Name</dt>
          <dd className="mt-1 text-sm">{record.brokerName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Broker Ref</dt>
          <dd className="mt-1 text-sm">{record.brokerRef ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
          <dd className="mt-1 text-sm">{record.createdAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
          <dd className="mt-1 text-sm">{record.updatedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
