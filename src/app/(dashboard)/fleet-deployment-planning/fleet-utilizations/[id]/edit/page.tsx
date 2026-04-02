

import { Link, ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { getFleetUtilization } from '@/lib/fleet-deployment-planning/service';
import { FdpForm } from '@/components/fleet-deployment-planning/fdp-form';
import { Button } from '@/components/ui/button';
import type { FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

export const metadata = {
  title: 'Edit Fleet Utilization | Fleet Deployment Planning',
};

export default async function EditFleetUtilizationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:edit'))) redirect('/');

  const utilization = await getFleetUtilization(params.id, session.tenantId);
  if (!utilization) notFound();

  const fieldConfig: FieldConfig[] = [
    {
      name: 'utilizationType',
      label: 'Utilization Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Capacity Analysis', value: 'capacity_analysis' },
        { label: 'Demand Forecast', value: 'demand_forecast' },
        { label: 'Gap Analysis', value: 'gap_analysis' },
        { label: 'Seasonal Planning', value: 'seasonal_planning' },
        { label: 'Fleet Overview', value: 'fleet_overview' },
      ],
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: false,
    },
    {
      name: 'periodFrom',
      label: 'Period From',
      type: 'datetime-local',
      required: false,
    },
    {
      name: 'periodTo',
      label: 'Period To',
      type: 'datetime-local',
      required: false,
    },
    {
      name: 'totalCapacityTeu',
      label: 'Total Capacity TEU',
      type: 'number',
      required: false,
    },
    {
      name: 'utilizedCapacityTeu',
      label: 'Utilized Capacity TEU',
      type: 'number',
      required: false,
    },
    {
      name: 'utilizationPct',
      label: 'Utilization %',
      type: 'number',
      required: false,
    },
    {
      name: 'idleDays',
      label: 'Idle Days',
      type: 'number',
      required: false,
    },
    {
      name: 'vesselCount',
      label: 'Vessel Count',
      type: 'number',
      required: false,
    },
    {
      name: 'tradeLane',
      label: 'Trade Lane',
      type: 'text',
      required: false,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
    },
  ];

  const initialData = utilization as unknown as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href={`/fleet-deployment-planning/fleet-utilizations/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Fleet Utilization</h1>
          <p className="text-sm text-muted-foreground mt-1">{utilization.title}</p>
        </div>
      </div>

      <FdpForm
        entityType="Fleet Utilization"
        apiPath={`/api/v1/fleet-deployment-planning/fleet-utilizations/${params.id}`}
        fields={fieldConfig}
        initialData={initialData}
        isEdit
        returnPath={`/fleet-deployment-planning/fleet-utilizations/${params.id}`}
      />
    </div>
  );
}
