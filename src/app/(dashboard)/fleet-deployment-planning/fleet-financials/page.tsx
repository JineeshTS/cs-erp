'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Search } from 'lucide-react';
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

interface FleetFinancial {
  id: string;
  financialRef: string;
  title: string;
  financialType: 'fleet_valuation' | 'npv_analysis' | 'lease_vs_own' | 'newbuild_assessment' | 'disposal_analysis';
  vesselName: string;
  npvResult: string;
  status: string;
}

const typeLabels: Record<string, string> = {
  fleet_valuation: 'Fleet Valuation',
  npv_analysis: 'NPV Analysis',
  lease_vs_own: 'Lease vs Own',
  newbuild_assessment: 'Newbuild Assessment',
  disposal_analysis: 'Disposal Analysis',
};

export default function FleetFinancialsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [financials, setFinancials] = useState<FleetFinancial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Financials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage fleet valuation, NPV analysis, and financial assessments
          </p>
        </div>
        <Link href="/fleet-deployment-planning/fleet-financials/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Financial Record
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ref, title, or vessel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>NPV Result</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financials.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {search ? 'No results found' : 'No fleet financials yet'}
                </TableCell>
              </TableRow>
            ) : (
              financials.map((financial) => (
                <TableRow key={financial.id}>
                  <TableCell className="font-mono text-sm">{financial.financialRef}</TableCell>
                  <TableCell className="font-medium">{financial.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {typeLabels[financial.financialType] || financial.financialType}
                    </Badge>
                  </TableCell>
                  <TableCell>{financial.vesselName}</TableCell>
                  <TableCell className="font-mono">${financial.npvResult}</TableCell>
                  <TableCell>
                    <Badge variant={financial.status === 'active' ? 'default' : 'secondary'}>
                      {financial.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/fleet-deployment-planning/fleet-financials/${financial.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
