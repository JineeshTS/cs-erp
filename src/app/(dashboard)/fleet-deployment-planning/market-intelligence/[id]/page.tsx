import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { getMarketIntelligence } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';

export default async function MarketIntelligenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const canRead = await hasPermission(session.id, session.tenantId, 'fdp:read');
  if (!canRead) redirect('/');

  const { id } = await params;
  const intel = await getMarketIntelligence(id, session.tenantId);

  if (!intel) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, 'fdp:edit');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/fleet-deployment-planning/market-intelligence"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{intel.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Intelligence Reference: {intel.intelRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/fleet-deployment-planning/market-intelligence/${intel.id}/edit`}
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
            <Badge variant={intel.status === 'active' ? 'default' : 'secondary'}>
              {intel.status || 'pending'}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {intel.intelType.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {intel.marketSentiment || 'neutral'}
            </Badge>
          </div>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</dt>
            <dd className="mt-1 text-base">{intel.title}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Intelligence Type</dt>
            <dd className="mt-1 text-base capitalize">{intel.intelType.replace(/_/g, ' ')}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Intelligence Reference</dt>
            <dd className="mt-1 font-mono text-sm">{intel.intelRef}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trade Lane</dt>
            <dd className="mt-1 text-base">{intel.tradeLane || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</dt>
            <dd className="mt-1 text-base">{intel.source || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Report Date</dt>
            <dd className="mt-1 text-base">
              {intel.reportDate ? new Date(intel.reportDate).toLocaleDateString() : '-'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Rate</dt>
            <dd className="mt-1 text-base">{intel.currentRate || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Forecast Rate</dt>
            <dd className="mt-1 text-base">{intel.forecastRate || '-'}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change Percent</dt>
            <dd className="mt-1 text-base">{intel.changePercent || '-'}%</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Market Sentiment</dt>
            <dd className="mt-1 text-base capitalize">{intel.marketSentiment || '-'}</dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</dt>
            <dd className="mt-1 text-base whitespace-pre-wrap">{intel.summary || '-'}</dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</dt>
            <dd className="mt-1 text-base whitespace-pre-wrap">{intel.notes || '-'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
