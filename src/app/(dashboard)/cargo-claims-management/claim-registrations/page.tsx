import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listClaimRegistrations } from "@/lib/cargo-claims-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ClaimRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ccm:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const result = await listClaimRegistrations({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Claim Registrations
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage cargo claim registrations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/cargo-claims-management/claim-registrations/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Claim
          </Link>
        )}
      </div>

      <form method="GET" className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by claim ref or vessel name..."
            className="h-10 w-full rounded-md border border-input bg-background pe-4 ps-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="registered">Registered</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="assessed">Assessed</option>
          <option value="settled">Settled</option>
          <option value="closed">Closed</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">Ref</th>
              <th className="px-4 py-3 text-start font-medium">Vessel</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Claimant</th>
              <th className="px-4 py-3 text-end font-medium">Amount (USD)</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No claim registrations found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              result.data.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/cargo-claims-management/claim-registrations/${row.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.claimRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.vesselName}</td>
                  <td className="px-4 py-3 capitalize">
                    {row.claimType?.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">{row.claimantName}</td>
                  <td className="px-4 py-3 text-end">
                    {row.claimAmountUsd ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.meta?.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/cargo-claims-management/claim-registrations?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&cursor=${encodeURIComponent(result.meta.cursor)}`}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
