import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { FdpForm } from '@/components/fleet-deployment-planning/fdp-form';
import { Button } from '@/components/ui/button';
import type { FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

export const metadata = {
  title: 'New Vessel Swap | Fleet Deployment Planning',
};

export default async function NewVesselSwapPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const canCreate = await hasPermission(session.id, session.tenantId, 'fdp:create');
  if (!canCreate) redirect('/');

  const formFields: FieldConfig[] = [
    {
      name: 'swapType',
      label: 'Swap Type',
      type: 'select',
      required: true,
      options: [
        { value: 'planned_swap', label: 'Planned Swap' },
        { value: 'emergency_swap', label: 'Emergency Swap' },
        { value: 'upgrade', label: 'Upgrade' },
        { value: 'downsize', label: 'Downsize' },
        { value: 'slot_exchange', label: 'Slot Exchange' },
      ],
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: false,
      placeholder: 'Swap description or title',
    },
    {
      name: 'outgoingVessel',
      label: 'Outgoing Vessel',
      type: 'text',
      required: false,
      placeholder: 'e.g., MSC Maya',
    },
    {
      name: 'incomingVessel',
      label: 'Incoming Vessel',
      type: 'text',
      required: false,
      placeholder: 'e.g., MSC Gülsün',
    },
    {
      name: 'tradeLane',
      label: 'Trade Lane',
      type: 'text',
      required: false,
      placeholder: 'e.g., Asia-Europe',
    },
    {
      name: 'swapDate',
      label: 'Swap Date',
      type: 'datetime-local',
      required: false,
    },
    {
      name: 'reason',
      label: 'Reason for Swap',
      type: 'textarea',
      required: false,
      placeholder: 'Business justification and operational reasons...',
    },
    {
      name: 'costImpact',
      label: 'Cost Impact ($)',
      type: 'number',
      required: false,
      placeholder: '5000000',
    },
    {
      name: 'capacityChange',
      label: 'Capacity Change (TEU)',
      type: 'number',
      required: false,
      placeholder: '2000',
    },
    {
      name: 'isApproved',
      label: 'Approved',
      type: 'checkbox',
      required: false,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Additional notes and remarks...',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href="/fleet-deployment-planning/vessel-swaps">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Vessel Swap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record a new vessel swap, upgrade, or downsize
          </p>
        </div>
      </div>

      <FdpForm
        entityType="Vessel Swap"
        apiPath="/api/v1/fleet-deployment-planning/vessel-swaps"
        fields={formFields}
        returnPath="/fleet-deployment-planning/vessel-swaps"
      />
    </div>
  );
}
