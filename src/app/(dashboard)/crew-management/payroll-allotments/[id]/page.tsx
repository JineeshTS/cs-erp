import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPayrollAllotment } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge variant="success">{status}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function PayrollAllotmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;
  const record = await getPayrollAllotment(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/crew-management/payroll-allotments"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Payroll Allotments
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.allotmentRef}
          </h1>
        </div>
        <Link
          href={`/crew-management/payroll-allotments/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Crew Member
            </dt>
            <dd className="mt-1 text-sm">{record.crewMemberName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Rank</dt>
            <dd className="mt-1 text-sm">{record.rank}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel
            </dt>
            <dd className="mt-1 text-sm">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payroll Month
            </dt>
            <dd className="mt-1 text-sm">{record.payrollMonth}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payroll Year
            </dt>
            <dd className="mt-1 text-sm">{record.payrollYear}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Base Salary
            </dt>
            <dd className="mt-1 text-sm">{record.baseSalary}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Overtime Hours
            </dt>
            <dd className="mt-1 text-sm">{record.overtimeHours}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Overtime Amount
            </dt>
            <dd className="mt-1 text-sm">{record.overtimeAmount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Leave Pay
            </dt>
            <dd className="mt-1 text-sm">{record.leavePay}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Bonuses
            </dt>
            <dd className="mt-1 text-sm">{record.bonuses}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Deductions
            </dt>
            <dd className="mt-1 text-sm">{record.deductions}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Net Pay
            </dt>
            <dd className="mt-1 text-sm font-semibold">{record.netPay}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Currency
            </dt>
            <dd className="mt-1 text-sm">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Allotment Amount
            </dt>
            <dd className="mt-1 text-sm">{record.allotmentAmount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Allotment Beneficiary
            </dt>
            <dd className="mt-1 text-sm">{record.allotmentBeneficiary}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payment Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.paymentDate
                ? new Date(record.paymentDate).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payment Method
            </dt>
            <dd className="mt-1 text-sm">{record.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
