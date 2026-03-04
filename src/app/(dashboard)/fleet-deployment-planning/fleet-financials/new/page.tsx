import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FdpForm } from '@/components/fleet-deployment-planning/fdp-form';
import type { FieldConfig } from '@/components/fleet-deployment-planning/fdp-form';

export const metadata = {
  title: 'New Fleet Financial Record | Fleet Deployment Planning',
};

const formFields: FieldConfig[] = [
  {
    name: 'financialType',
    label: 'Financial Type',
    type: 'select',
    required: true,
    options: [
      { value: 'fleet_valuation', label: 'Fleet Valuation' },
      { value: 'npv_analysis', label: 'NPV Analysis' },
      { value: 'lease_vs_own', label: 'Lease vs Own' },
      { value: 'newbuild_assessment', label: 'Newbuild Assessment' },
      { value: 'disposal_analysis', label: 'Disposal Analysis' },
    ],
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: false,
    placeholder: 'Financial analysis title',
  },
  {
    name: 'vesselName',
    label: 'Vessel Name',
    type: 'text',
    required: false,
    placeholder: 'e.g., MSC Gulsun',
  },
  {
    name: 'vesselType',
    label: 'Vessel Type',
    type: 'text',
    required: false,
    placeholder: 'e.g., Ultra Large Container Vessel',
  },
  {
    name: 'capacityTeu',
    label: 'Capacity (TEU)',
    type: 'number',
    required: false,
    placeholder: '23756',
  },
  {
    name: 'acquisitionCost',
    label: 'Acquisition Cost ($)',
    type: 'number',
    required: false,
    placeholder: '180000000',
  },
  {
    name: 'currentValue',
    label: 'Current Value ($)',
    type: 'number',
    required: false,
    placeholder: '150000000',
  },
  {
    name: 'annualOpex',
    label: 'Annual OpEx ($)',
    type: 'number',
    required: false,
    placeholder: '7500000',
  },
  {
    name: 'npvResult',
    label: 'NPV Result ($)',
    type: 'number',
    required: false,
    placeholder: '25000000',
  },
  {
    name: 'irrPct',
    label: 'IRR (%)',
    type: 'number',
    required: false,
    placeholder: '12.5',
  },
  {
    name: 'paybackYears',
    label: 'Payback Period (Years)',
    type: 'number',
    required: false,
    placeholder: '8.5',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional analysis notes...',
  },
];

export default async function NewFleetFinancialPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const canCreate = await hasPermission(session.id, session.tenantId, 'fdp:create');
  if (!canCreate) redirect('/');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fleet-deployment-planning/fleet-financials">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Fleet Financial Record</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new fleet valuation or financial analysis
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <FdpForm
          entityType="Fleet Financial"
          apiPath="/api/v1/fleet-deployment-planning/fleet-financials"
          fields={formFields}
          returnPath="/fleet-deployment-planning/fleet-financials"
        />
      </div>
    </div>
  );
}
