import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { listMarketIntelligence } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';

interface SearchParams {
  search?: string;
  status?: string;
  cursor?: string;
  limit?: string;
}

export default async function MarketIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const canRead = await hasPermission(session.id, session.tenantId, 'fdp:read');
  if (!canRead) redirect('/');

  const params = await searchParams;
  const limit = Math.min(parseInt(params.limit || '50'), 50);

  const { data: intelligence, meta } = await listMarketIntelligence({
    tenantId: session.tenantId,
    limit,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Track market trends and competitive analysis</p>
        </div>
        <Link
          href="/fleet-deployment-planning/market-intelligence/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Intelligence
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search intelligence..."
            defaultValue={params.search || ''}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Trade Lane</th>
                <th className="px-4 py-3">Sentiment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {intelligence.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No market intelligence found
                  </td>
                </tr>
              ) : (
                intelligence.map((intel) => (
                  <tr key={intel.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{intel.intelRef}</td>
                    <td className="px-4 py-3">{intel.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">
                        {intel.intelType.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{intel.tradeLane || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="capitalize">
                        {intel.marketSentiment || 'neutral'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={intel.status === 'active' ? 'default' : 'secondary'}>
                        {intel.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/fleet-deployment-planning/market-intelligence/${intel.id}`}
                        className="text-primary hover:underline text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta?.cursor && (
          <div className="flex justify-center mt-6 pt-4 border-t">
            <Link
              href={`/fleet-deployment-planning/market-intelligence?cursor=${meta.cursor}`}
              className="px-3 py-1 text-xs border rounded hover:bg-muted transition-colors"
            >
              Load More
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
