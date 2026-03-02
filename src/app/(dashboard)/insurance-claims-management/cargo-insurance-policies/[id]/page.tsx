import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Package } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCargoInsurancePolicy } from "@/lib/insurance-claims-management/service";
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

export default async function CargoInsurancePolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const { id } = await params;
  const record = await getCargoInsurancePolicy(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/insurance-claims-management/cargo-insurance-policies"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Package className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.policyRef}</h1>
            <p className="text-sm text-muted-foreground">Cargo Insurance Policy Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:edit")) && (
          <Link
            href={`/insurance-claims-management/cargo-insurance-policies/${record.id}/edit`}
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
          <dd className="mt-1 text-sm">{record.insurerName}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Insured Party</dt>
          <dd className="mt-1 text-sm">{record.insuredParty ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Coverage Type</dt>
          <dd className="mt-1 text-sm">{record.coverageType ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">HS Code</dt>
          <dd className="mt-1 text-sm">{record.hsCode ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Cargo Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.cargoDescription ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Cargo Value</dt>
          <dd className="mt-1 text-sm">{record.cargoValue ?? "-"}</dd>
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
          <dt className="text-sm font-medium text-muted-foreground">Premium Rate</dt>
          <dd className="mt-1 text-sm">{record.premiumRate ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Premium Currency</dt>
          <dd className="mt-1 text-sm">{record.premiumCurrency ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Deductible Amount</dt>
          <dd className="mt-1 text-sm">{record.deductibleAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Origin Port</dt>
          <dd className="mt-1 text-sm">{record.originPort ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Destination Port</dt>
          <dd className="mt-1 text-sm">{record.destinationPort ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Voyage Number</dt>
          <dd className="mt-1 text-sm">{record.voyageNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Booking Ref</dt>
          <dd className="mt-1 text-sm">{record.bookingRef ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">BL Number</dt>
          <dd className="mt-1 text-sm">{record.blNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Certificate Number</dt>
          <dd className="mt-1 text-sm">{record.certificateNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Broker Name</dt>
          <dd className="mt-1 text-sm">{record.brokerName ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Special Conditions</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.specialConditions ?? "-"}</dd>
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
