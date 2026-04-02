import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { listDeploymentDecisions } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Deployment Decisions | Fleet Deployment Planning',
};

export default async function DeploymentDecisionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!(await hasPermission(session.id, session.tenantId, 'fdp:read'))) redirect('/');

  const sp = await searchParams;
  const search = sp.search ?? '';
  const status = sp.status ?? '';
  const cursor = sp.cursor ?? '';

  const { data: decisions, meta } = await listDeploymentDecisions({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
    limit: 50,
  });

  const getStatusBadge = (
    type: string
  ) => {
    const colors: Record<string, string> = {
      new_deployment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      redeployment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      withdrawal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      extension: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      seasonal_adjustment:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    const labels: Record<string, string> = {
      new_deployment: 'New Deployment',
      redeployment: 'Redeployment',
      withdrawal: 'Withdrawal',
      extension: 'Extension',
      seasonal_adjustment: 'Seasonal Adjustment',
    };
    return <Badge className={colors[type]}>{labels[type]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployment Decisions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage vessel deployment and redeployment decisions
          </p>
        </div>
        <Link
          href="/fleet-deployment-planning/deployment-decisions/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Decision
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Search by reference, title, or vessel..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="verified">Verified</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && <Link href="/fleet-deployment-planning/deployment-decisions" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
      </form>

      {decisions.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-lg font-medium">No deployment decisions found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search
              ? 'Try adjusting your search criteria'
              : 'Create your first deployment decision to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Expected TCE</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-end font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((decision) => (
                <tr key={decision.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{decision.decisionRef}</td>
                  <td className="px-4 py-3 text-gray-600">{decision.title || '\u2014'}</td>
                  <td className="px-4 py-3">{getStatusBadge(decision.decisionType)}</td>
                  <td className="px-4 py-3 text-gray-600">{decision.vesselName || '\u2014'}</td>
                  <td className="px-4 py-3 text-gray-600">{decision.expectedTce ? `$${decision.expectedTce}` : '\u2014'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={decision.status === 'verified' ? 'success' : decision.status === 'published' ? 'default' : 'secondary'}>{decision.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/fleet-deployment-planning/deployment-decisions/${decision.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta?.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/fleet-deployment-planning/deployment-decisions?cursor=${meta.cursor}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
