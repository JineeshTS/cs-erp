import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { getDeploymentContract } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';

export default async function DeploymentContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:read'))) redirect('/');

  const { id } = await params;
  const contract = await getDeploymentContract(id, session.tenantId);

  if (!contract) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/fleet-deployment-planning/deployment-contracts"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{contract.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Contract Reference: {contract.contractRef}</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, 'fdp:edit')) && (
          <Link
            href={`/fleet-deployment-planning/deployment-contracts/${contract.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="mb-6 pb-6 border-b">
          <div className="flex gap-4 items-start">
            <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
              {contract.status || 'pending'}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {contract.contractType.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</dt>
            <dd className="mt-1 text-base">{contract.title}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contract Type</dt>
            <dd className="mt-1 text-base capitalize">{contract.contractType.replace(/_/g, ' ')}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contract Reference</dt>
            <dd className="mt-1 font-mono text-sm">{contract.contractRef}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Counterparty</dt>
            <dd className="mt-1 text-base">{contract.counterparty || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vessel Name</dt>
            <dd className="mt-1 text-base">{contract.vesselName || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trade Lane</dt>
            <dd className="mt-1 text-base">{contract.tradeLane || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Date</dt>
            <dd className="mt-1 text-base">
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">End Date</dt>
            <dd className="mt-1 text-base">
              {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contract Value</dt>
            <dd className="mt-1 text-base">{contract.contractValue || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slot Capacity</dt>
            <dd className="mt-1 text-base">{contract.slotCapacity || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Renewal Date</dt>
            <dd className="mt-1 text-base">
              {contract.renewalDate ? new Date(contract.renewalDate).toLocaleDateString() : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Auto Renewal</dt>
            <dd className="mt-1 text-base">{contract.isAutoRenew ? 'Yes' : 'No'}</dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</dt>
            <dd className="mt-1 text-base whitespace-pre-wrap">{contract.notes || '-'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
