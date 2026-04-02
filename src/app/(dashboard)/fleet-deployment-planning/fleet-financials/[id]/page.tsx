'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FleetFinancial {
  id: string;
  financialRef: string;
  title: string;
  financialType: 'fleet_valuation' | 'npv_analysis' | 'lease_vs_own' | 'newbuild_assessment' | 'disposal_analysis';
  vesselName: string;
  vesselType: string;
  capacityTeu: string;
  acquisitionCost: string;
  currentValue: string;
  annualOpex: string;
  npvResult: string;
  irrPct: string;
  paybackYears: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const typeLabels: Record<string, string> = {
  fleet_valuation: 'Fleet Valuation',
  npv_analysis: 'NPV Analysis',
  lease_vs_own: 'Lease vs Own',
  newbuild_assessment: 'Newbuild Assessment',
  disposal_analysis: 'Disposal Analysis',
};

export default function FleetFinancialDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [financial, setFinancial] = useState<FleetFinancial | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/fleet-deployment-planning/fleet-financials">
          <Button variant="outline" className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/fleet-deployment-planning/fleet-financials/${params.id}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Detail Content */}
      {financial && (
        <div className="space-y-6">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{financial.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{typeLabels[financial.financialType]}</Badge>
              <Badge variant={financial.status === 'active' ? 'default' : 'secondary'}>
                {financial.status}
              </Badge>
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Basic Information</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Financial Reference</dt>
                  <dd className="text-base font-mono">{financial.financialRef}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Financial Type</dt>
                  <dd className="text-base">{typeLabels[financial.financialType]}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="text-base">{financial.status}</dd>
                </div>
              </dl>
            </div>

            {/* Vessel Information */}
            <div className="rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Vessel Information</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
                  <dd className="text-base">{financial.vesselName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Vessel Type</dt>
                  <dd className="text-base">{financial.vesselType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Capacity (TEU)</dt>
                  <dd className="text-base font-mono">{financial.capacityTeu}</dd>
                </div>
              </dl>
            </div>

            {/* Financial Metrics */}
            <div className="rounded-lg border p-6 md:col-span-2">
              <h2 className="font-semibold mb-4">Financial Metrics</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Acquisition Cost</dt>
                  <dd className="text-base font-mono">${financial.acquisitionCost}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Current Value</dt>
                  <dd className="text-base font-mono">${financial.currentValue}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Annual OpEx</dt>
                  <dd className="text-base font-mono">${financial.annualOpex}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">NPV Result</dt>
                  <dd className="text-base font-mono">${financial.npvResult}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">IRR (%)</dt>
                  <dd className="text-base font-mono">{financial.irrPct}%</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Payback Period (Years)</dt>
                  <dd className="text-base font-mono">{financial.paybackYears}</dd>
                </div>
              </dl>
            </div>

            {/* Notes */}
            {financial.notes && (
              <div className="rounded-lg border p-6 md:col-span-2">
                <h2 className="font-semibold mb-4">Notes</h2>
                <p className="text-sm whitespace-pre-wrap">{financial.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-lg border p-6 md:col-span-2">
              <h2 className="font-semibold mb-4">Metadata</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-base">{new Date(financial.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-base">{new Date(financial.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
