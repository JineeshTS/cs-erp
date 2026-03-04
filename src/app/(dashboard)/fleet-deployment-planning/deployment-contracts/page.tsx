import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { listDeploymentContracts } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';

interface SearchParams {
  search?: string;
  status?: string;
  cursor?: string;
  limit?: string;
}

export default async function DeploymentContractsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:read'))) redirect('/');

  const params = await searchParams;
  const limit = Math.min(parseInt(params.limit || '50'), 50);

  const { data: contracts, meta } = await listDeploymentContracts({
    tenantId: session.tenantId,
    limit,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });
  const nextCursor = meta.cursor;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployment Contracts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage deployment contracts and agreements</p>
        </div>
        <Link
          href="/fleet-deployment-planning/deployment-contracts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contracts..."
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
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-4 py-3">Vessel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No deployment contracts found
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{contract.contractRef}</td>
                    <td className="px-4 py-3">{contract.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">
                        {contract.contractType.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{contract.counterparty || '-'}</td>
                    <td className="px-4 py-3">{contract.vesselName || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/fleet-deployment-planning/deployment-contracts/${contract.id}`}
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

        {(nextCursor || params.cursor) && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Showing up to {limit} per page
            </div>
            <div className="space-x-2">
              {params.cursor && (
                <Link
                  href={`/fleet-deployment-planning/deployment-contracts`}
                  className="px-3 py-1 text-xs border rounded hover:bg-muted transition-colors"
                >
                  Previous
                </Link>
              )}
              {nextCursor && (
                <Link
                  href={`/fleet-deployment-planning/deployment-contracts?cursor=${nextCursor}`}
                  className="px-3 py-1 text-xs border rounded hover:bg-muted transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
