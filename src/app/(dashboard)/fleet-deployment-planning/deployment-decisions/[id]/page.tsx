import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { getDeploymentDecision } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Deployment Decision | Fleet Deployment Planning',
};

export default async function DeploymentDecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!(await hasPermission(session.id, session.tenantId, 'fdp:read'))) redirect('/');

  const { id } = await params;
  const decision = await getDeploymentDecision(id, session.tenantId);
  if (!decision) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, 'fdp:edit');

  const decisionTypeLabels: Record<string, string> = {
    new_deployment: 'New Deployment',
    redeployment: 'Redeployment',
    withdrawal: 'Withdrawal',
    extension: 'Extension',
    seasonal_adjustment: 'Seasonal Adjustment',
  };

  const decisionTypeColors: Record<string, string> = {
    new_deployment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    redeployment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    withdrawal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    extension: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    seasonal_adjustment:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/fleet-deployment-planning/deployment-decisions"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{decision.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reference: {decision.decisionRef}
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/fleet-deployment-planning/deployment-decisions/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Decision Type</dt>
            <dd className="mt-1">
              <Badge
                className={decisionTypeColors[decision.decisionType] || 'bg-gray-100'}
              >
                {decisionTypeLabels[decision.decisionType] || decision.decisionType}
              </Badge>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge variant="outline">{decision.status}</Badge>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
            <dd className="mt-1 text-sm">{decision.vesselName}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Current Trade</dt>
            <dd className="mt-1 text-sm">{decision.currentTrade}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Proposed Trade</dt>
            <dd className="mt-1 text-sm">{decision.proposedTrade}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Effective Date</dt>
            <dd className="mt-1 text-sm">
              {decision.effectiveDate
                ? new Date(decision.effectiveDate).toLocaleDateString()
                : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Expiry Date</dt>
            <dd className="mt-1 text-sm">
              {decision.expiryDate
                ? new Date(decision.expiryDate).toLocaleDateString()
                : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Expected TCE</dt>
            <dd className="mt-1 text-sm">{decision.expectedTce ? `$${decision.expectedTce}` : '-'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Decision Score</dt>
            <dd className="mt-1 text-sm">{decision.decisionScore}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Approved By</dt>
            <dd className="mt-1 text-sm">{decision.approvedBy || '-'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Approved Date</dt>
            <dd className="mt-1 text-sm">
              {decision.approvedDate
                ? new Date(decision.approvedDate).toLocaleDateString()
                : '-'}
            </dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">{decision.notes || '-'}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
