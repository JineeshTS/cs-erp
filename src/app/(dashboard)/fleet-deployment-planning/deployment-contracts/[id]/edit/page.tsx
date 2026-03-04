import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDeploymentContract } from '@/lib/fleet-deployment-planning/service';
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

export default async function EditDeploymentContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:edit'))) redirect('/');

  const { id } = await params;
  const contract = await getDeploymentContract(id, session.tenantId);

  if (!contract) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/fleet-deployment-planning/deployment-contracts/${contract.id}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Deployment Contract</h1>
          <p className="text-sm text-muted-foreground mt-1">{contract.title}</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <FdpForm
          entityType="Deployment Contract"
          apiPath={`/api/v1/fleet-deployment-planning/deployment-contracts/${id}`}
          fields={deploymentContractFields}
          initialData={contract as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/fleet-deployment-planning/deployment-contracts/${id}`}
        />
      </div>
    </div>
  );
}
