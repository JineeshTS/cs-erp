

import { Link, ArrowLeft, Pencil } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { getFleetUtilization } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Fleet Utilization | Fleet Deployment Planning',
};

export default async function FleetUtilizationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:read'))) redirect('/');

  const utilization = await getFleetUtilization(params.id, session.tenantId);
  if (!utilization) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, 'fdp:edit');

  const utilizationTypeLabels: Record<string, string> = {
    capacity_analysis: 'Capacity Analysis',
    demand_forecast: 'Demand Forecast',
    gap_analysis: 'Gap Analysis',
    seasonal_planning: 'Seasonal Planning',
    fleet_overview: 'Fleet Overview',
  };

  const utilizationTypeColors: Record<string, string> = {
    capacity_analysis:
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    demand_forecast:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    gap_analysis: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    seasonal_planning:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    fleet_overview: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/fleet-deployment-planning/fleet-utilizations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{utilization.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reference: {utilization.utilizationRef}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/fleet-deployment-planning/fleet-utilizations/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Utilization Type</dt>
            <dd className="mt-1">
              <Badge
                className={
                  utilizationTypeColors[utilization.utilizationType] || 'bg-gray-100'
                }
              >
                {utilizationTypeLabels[utilization.utilizationType] ||
                  utilization.utilizationType}
              </Badge>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge variant="outline">{utilization.status}</Badge>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Period From</dt>
            <dd className="mt-1 text-sm">
              {utilization.periodFrom
                ? new Date(utilization.periodFrom).toLocaleDateString()
                : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Period To</dt>
            <dd className="mt-1 text-sm">
              {utilization.periodTo
                ? new Date(utilization.periodTo).toLocaleDateString()
                : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Total Capacity TEU</dt>
            <dd className="mt-1 text-sm">{utilization.totalCapacityTeu}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Utilized Capacity TEU</dt>
            <dd className="mt-1 text-sm">{utilization.utilizedCapacityTeu}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Utilization %</dt>
            <dd className="mt-1 text-sm">{utilization.utilizationPct}%</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Idle Days</dt>
            <dd className="mt-1 text-sm">{utilization.idleDays}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Vessel Count</dt>
            <dd className="mt-1 text-sm">{utilization.vesselCount}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Trade Lane</dt>
            <dd className="mt-1 text-sm">{utilization.tradeLane}</dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">{utilization.notes || '-'}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
