import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FdpForm, type FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

const contractTypeOptions = [
  { value: 'coa', label: 'COA' },
  { value: 'vsa', label: 'VSA' },
  { value: 'slot_charter', label: 'Slot Charter' },
  { value: 'time_charter', label: 'Time Charter' },
  { value: 'bareboat', label: 'Bareboat' },
];

const deploymentContractFields: FieldConfig[] = [
  {
    name: 'contractType',
    label: 'Contract Type',
    type: 'select',
    required: true,
    options: contractTypeOptions,
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
  },
  {
    name: 'counterparty',
    label: 'Counterparty',
    type: 'text',
  },
  {
    name: 'vesselName',
    label: 'Vessel Name',
    type: 'text',
  },
  {
    name: 'tradeLane',
    label: 'Trade Lane',
    type: 'text',
  },
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'datetime-local',
  },
  {
    name: 'endDate',
    label: 'End Date',
    type: 'datetime-local',
  },
  {
    name: 'contractValue',
    label: 'Contract Value',
    type: 'number',
  },
  {
    name: 'slotCapacity',
    label: 'Slot Capacity',
    type: 'number',
  },
  {
    name: 'renewalDate',
    label: 'Renewal Date',
    type: 'datetime-local',
  },
  {
    name: 'isAutoRenew',
    label: 'Auto Renewal',
    type: 'checkbox',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
  },
];

export default async function NewDeploymentContractPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:create'))) redirect('/');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet-deployment-planning/deployment-contracts"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Deployment Contract</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new deployment contract</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <FdpForm
          entityType="Deployment Contract"
          apiPath="/api/v1/fleet-deployment-planning/deployment-contracts"
          fields={deploymentContractFields}
          returnPath="/fleet-deployment-planning/deployment-contracts"
        />
      </div>
    </div>
  );
}
