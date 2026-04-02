import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { FdpForm } from '@/components/fleet-deployment-planning/fdp-form';
import type { FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

export const metadata = {
  title: 'New Deployment Decision | Fleet Deployment Planning',
};

export default async function NewDeploymentDecisionPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!(await hasPermission(session.id, session.tenantId, 'fdp:create'))) redirect('/');

  const fieldConfig: FieldConfig[] = [
    {
      name: 'decisionType',
      label: 'Decision Type',
      type: 'select',
      required: true,
      options: [
        { label: 'New Deployment', value: 'new_deployment' },
        { label: 'Redeployment', value: 'redeployment' },
        { label: 'Withdrawal', value: 'withdrawal' },
        { label: 'Extension', value: 'extension' },
        { label: 'Seasonal Adjustment', value: 'seasonal_adjustment' },
      ],
    },
    { name: 'title', label: 'Title', type: 'text', required: false },
    { name: 'vesselName', label: 'Vessel Name', type: 'text', required: false },
    { name: 'currentTrade', label: 'Current Trade', type: 'text', required: false },
    { name: 'proposedTrade', label: 'Proposed Trade', type: 'text', required: false },
    { name: 'effectiveDate', label: 'Effective Date', type: 'datetime-local', required: false },
    { name: 'expiryDate', label: 'Expiry Date', type: 'datetime-local', required: false },
    { name: 'expectedTce', label: 'Expected TCE', type: 'number', required: false },
    { name: 'decisionScore', label: 'Decision Score', type: 'number', required: false },
    { name: 'approvedBy', label: 'Approved By', type: 'text', required: false },
    { name: 'approvedDate', label: 'Approved Date', type: 'datetime-local', required: false },
    { name: 'notes', label: 'Notes', type: 'textarea', required: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet-deployment-planning/deployment-decisions"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Deployment Decision</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new deployment decision for vessel redeployment planning
          </p>
        </div>
      </div>

      <FdpForm
        entityType="Deployment Decision"
        apiPath="/api/v1/fleet-deployment-planning/deployment-decisions"
        fields={fieldConfig}
        returnPath="/fleet-deployment-planning/deployment-decisions"
      />
    </div>
  );
}
