import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMarketIntelligence } from '@/lib/fleet-deployment-planning/service';
import { FdpForm } from '@/components/fleet-deployment-planning/fdp-form';
import type { FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

const intelTypeOptions = [
  { value: 'rate_index', label: 'Rate Index' },
  { value: 'market_outlook', label: 'Market Outlook' },
  { value: 'competitor_analysis', label: 'Competitor Analysis' },
  { value: 'trade_flow', label: 'Trade Flow' },
  { value: 'supply_demand', label: 'Supply & Demand' },
];

const marketIntelligenceFields: FieldConfig[] = [
  {
    name: 'intelType',
    label: 'Intelligence Type',
    type: 'select',
    required: true,
    options: intelTypeOptions,
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
  },
  {
    name: 'tradeLane',
    label: 'Trade Lane',
    type: 'text',
  },
  {
    name: 'source',
    label: 'Source',
    type: 'text',
  },
  {
    name: 'reportDate',
    label: 'Report Date',
    type: 'datetime-local',
  },
  {
    name: 'currentRate',
    label: 'Current Rate',
    type: 'number',
  },
  {
    name: 'forecastRate',
    label: 'Forecast Rate',
    type: 'number',
  },
  {
    name: 'changePercent',
    label: 'Change Percent',
    type: 'number',
  },
  {
    name: 'marketSentiment',
    label: 'Market Sentiment',
    type: 'text',
  },
  {
    name: 'summary',
    label: 'Summary',
    type: 'textarea',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
  },
];

export default async function EditMarketIntelligencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const canEdit = await hasPermission(session.id, session.tenantId, 'fdp:edit');
  if (!canEdit) redirect('/');

  const { id } = await params;
  const intel = await getMarketIntelligence(id, session.tenantId);

  if (!intel) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/fleet-deployment-planning/market-intelligence/${intel.id}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Market Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">{intel.title}</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <FdpForm
          entityType="Market Intelligence"
          apiPath={`/api/v1/fleet-deployment-planning/market-intelligence/${intel.id}`}
          fields={marketIntelligenceFields}
          initialData={intel as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/fleet-deployment-planning/market-intelligence/${intel.id}`}
        />
      </div>
    </div>
  );
}
