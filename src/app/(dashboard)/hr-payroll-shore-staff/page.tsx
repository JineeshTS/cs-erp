import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Users,
  CalendarOff,
  Clock,
  Star,
  Banknote,
  Shield,
  Calculator,
  Stamp,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  hpsEmployeeProfiles,
  hpsLeaveAbsences,
  hpsAttendanceTimeTrackings,
  hpsPerformanceAppraisals,
  hpsPayrollProcessings,
  hpsSocialInsuranceRecords,
  hpsGratuityCalculations,
  hpsVisaResidencyRecords,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function HrPayrollShoreStaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "hr:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeEmployees, pendingLeaves, todayAttendance, draftAppraisals, draftPayrolls, draftInsurance, draftGratuities, pendingVisas] =
    await Promise.all([
      db.select({ id: hpsEmployeeProfiles.id }).from(hpsEmployeeProfiles)
        .where(and(eq(hpsEmployeeProfiles.tenantId, session.tenantId), isNull(hpsEmployeeProfiles.deletedAt), eq(hpsEmployeeProfiles.status, "active")))
        .then((r) => r.length),
      db.select({ id: hpsLeaveAbsences.id }).from(hpsLeaveAbsences)
        .where(and(eq(hpsLeaveAbsences.tenantId, session.tenantId), isNull(hpsLeaveAbsences.deletedAt), eq(hpsLeaveAbsences.status, "pending")))
        .then((r) => r.length),
      db.select({ id: hpsAttendanceTimeTrackings.id }).from(hpsAttendanceTimeTrackings)
        .where(and(eq(hpsAttendanceTimeTrackings.tenantId, session.tenantId), isNull(hpsAttendanceTimeTrackings.deletedAt), eq(hpsAttendanceTimeTrackings.status, "present")))
        .then((r) => r.length),
      db.select({ id: hpsPerformanceAppraisals.id }).from(hpsPerformanceAppraisals)
        .where(and(eq(hpsPerformanceAppraisals.tenantId, session.tenantId), isNull(hpsPerformanceAppraisals.deletedAt), eq(hpsPerformanceAppraisals.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsPayrollProcessings.id }).from(hpsPayrollProcessings)
        .where(and(eq(hpsPayrollProcessings.tenantId, session.tenantId), isNull(hpsPayrollProcessings.deletedAt), eq(hpsPayrollProcessings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsSocialInsuranceRecords.id }).from(hpsSocialInsuranceRecords)
        .where(and(eq(hpsSocialInsuranceRecords.tenantId, session.tenantId), isNull(hpsSocialInsuranceRecords.deletedAt), eq(hpsSocialInsuranceRecords.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsGratuityCalculations.id }).from(hpsGratuityCalculations)
        .where(and(eq(hpsGratuityCalculations.tenantId, session.tenantId), isNull(hpsGratuityCalculations.deletedAt), eq(hpsGratuityCalculations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsVisaResidencyRecords.id }).from(hpsVisaResidencyRecords)
        .where(and(eq(hpsVisaResidencyRecords.tenantId, session.tenantId), isNull(hpsVisaResidencyRecords.deletedAt), eq(hpsVisaResidencyRecords.status, "pending")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(hpsEmployeeProfiles.tenantId, session.tenantId),
    isNull(hpsEmployeeProfiles.deletedAt),
  ];
  if (status) conditions.push(eq(hpsEmployeeProfiles.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(hpsEmployeeProfiles.employeeRef, `%${search}%`),
        ilike(hpsEmployeeProfiles.firstName, `%${search}%`),
        ilike(hpsEmployeeProfiles.lastName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(hpsEmployeeProfiles.createdAt, new Date(cursor)));

  const data = await db.select().from(hpsEmployeeProfiles)
    .where(and(...conditions))
    .orderBy(desc(hpsEmployeeProfiles.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/hr-payroll-shore-staff?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR & Payroll Shore Staff</h1>
          <p className="text-sm text-gray-500">Employee profiles, leave management, attendance, appraisals, payroll, social insurance, gratuity, and visa management</p>
        </div>
        {canCreate && (
          <Link href="/hr-payroll-shore-staff/employee-profiles/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Employee
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Employees</p><p className="text-2xl font-bold text-gray-900">{activeEmployees}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><CalendarOff className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Leaves</p><p className="text-2xl font-bold text-gray-900">{pendingLeaves}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Clock className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Today Attendance</p><p className="text-2xl font-bold text-gray-900">{todayAttendance}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Star className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Appraisals</p><p className="text-2xl font-bold text-gray-900">{draftAppraisals}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Banknote className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Payrolls</p><p className="text-2xl font-bold text-gray-900">{draftPayrolls}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Insurance</p><p className="text-2xl font-bold text-gray-900">{draftInsurance}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Calculator className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Gratuities</p><p className="text-2xl font-bold text-gray-900">{draftGratuities}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Stamp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Visas</p><p className="text-2xl font-bold text-gray-900">{pendingVisas}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Employee ref, name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="probation">Probation</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/hr-payroll-shore-staff" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No employee profiles found.</p>
          {canCreate && (
            <Link href="/hr-payroll-shore-staff/employee-profiles/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Add your first employee</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Department</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Designation</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/hr-payroll-shore-staff/employee-profiles/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.employeeRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.firstName} {t.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.employeeType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.designation || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "terminated" ? "destructive" : "secondary"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={buildNextUrl(nextCursor)} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
