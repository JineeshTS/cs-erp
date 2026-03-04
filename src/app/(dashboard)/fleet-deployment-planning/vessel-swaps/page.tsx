import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { listVesselSwaps } from '@/lib/fleet-deployment-planning/service';
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
  title: 'Vessel Swaps | Fleet Deployment Planning',
};

const typeLabels: Record<string, string> = {
  planned_swap: 'Planned Swap',
  emergency_swap: 'Emergency Swap',
  upgrade: 'Upgrade',
  downsize: 'Downsize',
  slot_exchange: 'Slot Exchange',
};

const typeColors: Record<string, string> = {
  planned_swap: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  emergency_swap: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  upgrade: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  downsize: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  slot_exchange: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default async function VesselSwapsPage({
  searchParams,
}: {
  searchParams: { search?: string; cursor?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const canRead = await hasPermission(session.id, session.tenantId, 'fdp:read');
  if (!canRead) redirect('/');

  const { data: swaps, meta } = await listVesselSwaps({
    tenantId: session.tenantId,
    search: searchParams.search,
    cursor: searchParams.cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vessel Swaps</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage planned swaps, upgrades, and downsizes
          </p>
        </div>
        <Button asChild>
          <Link href="/fleet-deployment-planning/vessel-swaps/new">
            <Plus className="mr-2 h-4 w-4" />
            New Vessel Swap
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ref, title, or vessel..."
            defaultValue={searchParams.search || ''}
            className="flex-1"
            name="search"
          />
        </div>
      </div>

      {swaps.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-border p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No vessel swaps found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchParams.search
              ? 'Try adjusting your search criteria'
              : 'Create your first vessel swap to get started'}
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
                <TableHead>Outgoing</TableHead>
                <TableHead>Incoming</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swaps.map((swap) => (
                <TableRow key={swap.id}>
                  <TableCell className="font-medium">{swap.swapRef}</TableCell>
                  <TableCell>{swap.title}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[swap.swapType] || ''}>
                      {typeLabels[swap.swapType] || swap.swapType}
                    </Badge>
                  </TableCell>
                  <TableCell>{swap.outgoingVessel}</TableCell>
                  <TableCell>{swap.incomingVessel}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{swap.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/fleet-deployment-planning/vessel-swaps/${swap.id}`}>
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
