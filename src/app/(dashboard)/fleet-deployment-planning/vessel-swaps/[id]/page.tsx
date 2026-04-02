'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VesselSwap {
  id: string;
  swapRef: string;
  title: string;
  swapType: 'planned_swap' | 'emergency_swap' | 'upgrade' | 'downsize' | 'slot_exchange';
  outgoingVessel: string;
  incomingVessel: string;
  tradeLane: string;
  swapDate: string;
  reason: string;
  costImpact: string;
  capacityChange: string;
  isApproved: boolean;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const typeLabels: Record<string, string> = {
  planned_swap: 'Planned Swap',
  emergency_swap: 'Emergency Swap',
  upgrade: 'Upgrade',
  downsize: 'Downsize',
  slot_exchange: 'Slot Exchange',
};

export default function VesselSwapDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [swap, setSwap] = useState<VesselSwap | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/fleet-deployment-planning/vessel-swaps">
          <Button variant="outline" className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/fleet-deployment-planning/vessel-swaps/${params.id}/edit`}>
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
      {swap && (
        <div className="space-y-6">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{swap.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{typeLabels[swap.swapType]}</Badge>
              <Badge variant={swap.status === 'active' ? 'default' : 'secondary'}>
                {swap.status}
              </Badge>
              <Badge variant={swap.isApproved ? 'default' : 'outline'}>
                {swap.isApproved ? 'Approved' : 'Pending Approval'}
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
                  <dt className="text-sm font-medium text-muted-foreground">Swap Reference</dt>
                  <dd className="text-base font-mono">{swap.swapRef}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Swap Type</dt>
                  <dd className="text-base">{typeLabels[swap.swapType]}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="text-base">{swap.status}</dd>
                </div>
              </dl>
            </div>

            {/* Vessel Information */}
            <div className="rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Vessel Information</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Outgoing Vessel</dt>
                  <dd className="text-base">{swap.outgoingVessel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Incoming Vessel</dt>
                  <dd className="text-base">{swap.incomingVessel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Trade Lane</dt>
                  <dd className="text-base">{swap.tradeLane}</dd>
                </div>
              </dl>
            </div>

            {/* Swap Details */}
            <div className="rounded-lg border p-6 md:col-span-2">
              <h2 className="font-semibold mb-4">Swap Details</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Swap Date</dt>
                  <dd className="text-base">{new Date(swap.swapDate).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Cost Impact ($)</dt>
                  <dd className="text-base font-mono">${swap.costImpact}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Capacity Change (TEU)</dt>
                  <dd className="text-base font-mono">{swap.capacityChange}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Approval Status</dt>
                  <dd className="text-base">{swap.isApproved ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>

            {/* Reason */}
            {swap.reason && (
              <div className="rounded-lg border p-6 md:col-span-2">
                <h2 className="font-semibold mb-4">Reason for Swap</h2>
                <p className="text-sm whitespace-pre-wrap">{swap.reason}</p>
              </div>
            )}

            {/* Notes */}
            {swap.notes && (
              <div className="rounded-lg border p-6 md:col-span-2">
                <h2 className="font-semibold mb-4">Notes</h2>
                <p className="text-sm whitespace-pre-wrap">{swap.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-lg border p-6 md:col-span-2">
              <h2 className="font-semibold mb-4">Metadata</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-base">{new Date(swap.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-base">{new Date(swap.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
