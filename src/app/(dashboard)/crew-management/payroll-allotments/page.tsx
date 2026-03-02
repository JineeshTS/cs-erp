import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listPayrollAllotments } from "@/lib/crew-management/service";
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

export default async function PayrollAllotmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? undefined;

  const { data, meta } = await listPayrollAllotments({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payroll &amp; Allotments</h1>
        <Link
          href="/crew-management/payroll-allotments/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Payroll Allotment
        </Link>
      </div>

      <form method="GET" className="flex items-center gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search by ref, crew member, vessel…"
          defaultValue={search}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Filter
        </button>
      </form>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No payroll allotments found.</p>
          <Link
            href="/crew-management/payroll-allotments/new"
            className="mt-4 text-sm text-primary underline"
          >
            Create your first payroll allotment
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium">Ref</th>
                  <th className="px-4 py-3 text-start font-medium">
                    Crew Member
                  </th>
                  <th className="px-4 py-3 text-start font-medium">Vessel</th>
                  <th className="px-4 py-3 text-start font-medium">Period</th>
                  <th className="px-4 py-3 text-end font-medium">Net Pay</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/crew-management/payroll-allotments/${row.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {row.allotmentRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{row.crewMemberName}</td>
                    <td className="px-4 py-3">{row.vesselName}</td>
                    <td className="px-4 py-3">
                      {row.payrollMonth}/{row.payrollYear}
                    </td>
                    <td className="px-4 py-3 text-end">{row.netPay}</td>
                    <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {data.length} record{data.length !== 1 ? "s" : ""}
            </p>
            {meta?.cursor && (
              <Link
                href={`/crew-management/payroll-allotments?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&cursor=${encodeURIComponent(meta.cursor)}`}
                className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Next Page
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
