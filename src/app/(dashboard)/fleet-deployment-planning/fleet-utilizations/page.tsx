

import { Link, Plus, Search, FileText } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { listFleetUtilizations } from '@/lib/fleet-deployment-planning/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Fleet Utilizations | Fleet Deployment Planning',
};

export default async function FleetUtilizationsPage({
  searchParams,
}: {
  searchParams: { search?: string; cursor?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!(await hasPermission(session.id, session.tenantId, 'fdp:read'))) redirect('/');

  const { data: utilizations, meta } = await listFleetUtilizations({
    tenantId: session.tenantId,
    search: searchParams.search,
    cursor: searchParams.cursor,
    limit: 50,
  });

  const getStatusBadge = (type: string) => {
    const colors: Record<string, string> = {
      capacity_analysis:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      demand_forecast:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      gap_analysis: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      seasonal_planning:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      fleet_overview: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    const labels: Record<string, string> = {
      capacity_analysis: 'Capacity Analysis',
      demand_forecast: 'Demand Forecast',
      gap_analysis: 'Gap Analysis',
      seasonal_planning: 'Seasonal Planning',
      fleet_overview: 'Fleet Overview',
    };
    return <Badge className={colors[type]}>{labels[type]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Utilizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze and manage fleet utilization metrics
          </p>
        </div>
        <Button asChild>
          <Link href="/fleet-deployment-planning/fleet-utilizations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Utilization
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by reference, title, or trade lane..."
            defaultValue={searchParams.search || ''}
            className="flex-1"
            name="search"
          />
        </div>
      </div>

      {utilizations.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-border p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No fleet utilizations found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchParams.search
              ? 'Try adjusting your search criteria'
              : 'Create your first fleet utilization analysis to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Trade Lane</TableHead>
                <TableHead>Utilization %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilizations.map((utilization) => (
                <TableRow key={utilization.id}>
                  <TableCell className="font-medium">{utilization.utilizationRef}</TableCell>
                  <TableCell>{utilization.title}</TableCell>
                  <TableCell>{getStatusBadge(utilization.utilizationType)}</TableCell>
                  <TableCell>{utilization.tradeLane}</TableCell>
                  <TableCell>{utilization.utilizationPct}%</TableCell>
                  <TableCell>
                    <Badge variant="outline">{utilization.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/fleet-deployment-planning/fleet-utilizations/${utilization.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {meta?.cursor && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`?cursor=${meta.cursor}`}>Load More</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
