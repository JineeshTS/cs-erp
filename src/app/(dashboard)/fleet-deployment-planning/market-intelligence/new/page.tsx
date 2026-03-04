import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FdpForm, type FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

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

export default async function NewMarketIntelligencePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const canCreate = await hasPermission(session.id, session.tenantId, 'fdp:create');
  if (!canCreate) redirect('/');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet-deployment-planning/market-intelligence"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Market Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Create new market intelligence report</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <FdpForm
          entityType="market-intelligence"
          apiPath="/api/v1/fleet-deployment-planning/market-intelligence"
          fields={marketIntelligenceFields}
          returnPath="/fleet-deployment-planning/market-intelligence"
        />
      </div>
    </div>
  );
}
