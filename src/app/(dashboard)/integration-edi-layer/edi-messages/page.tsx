import Link from "next/link";
import { ArrowLeft, Plus, Search, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { ielEdiMessages } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "parsed":
    case "generated":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

const directionVariant = (direction: string) => {
  switch (direction) {
    case "outbound":
      return "secondary" as const;
    default:
      return "default" as const;
  }
};

export default async function EdiMessagesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "integration:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const messageType = sp.messageType ?? "";
  const direction = sp.direction ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(ielEdiMessages.tenantId, session.tenantId),
    isNull(ielEdiMessages.deletedAt),
  ];
  if (messageType) conditions.push(eq(ielEdiMessages.messageType, messageType));
  if (direction) conditions.push(eq(ielEdiMessages.direction, direction));
  if (search) {
    conditions.push(
      or(
        ilike(ielEdiMessages.messageRef, `%${search}%`),
        ilike(ielEdiMessages.senderCode, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(ielEdiMessages.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(ielEdiMessages)
    .where(and(...conditions))
    .orderBy(desc(ielEdiMessages.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (messageType) p.set("messageType", messageType);
    if (direction) p.set("direction", direction);
    p.set("cursor", nextCur);
    return `/integration-edi-layer/edi-messages?${p.toString()}`;
  }

  const hasFilters = search || messageType || direction;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/integration-edi-layer"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EDI Messages</h1>
            <p className="text-sm text-gray-500">
              View and manage EDI message processing
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/integration-edi-layer/edi-messages/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New EDI Message
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Message ref or sender code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="messageType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Message Type
          </label>
          <select
            id="messageType"
            name="messageType"
            defaultValue={messageType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="BAPLIE">BAPLIE</option>
            <option value="COPARN">COPARN</option>
            <option value="COPRAR">COPRAR</option>
            <option value="CUSCAR">CUSCAR</option>
            <option value="IFTMIN">IFTMIN</option>
            <option value="IFTMBC">IFTMBC</option>
            <option value="IFTSTA">IFTSTA</option>
            <option value="MOVINS">MOVINS</option>
            <option value="BERMAN">BERMAN</option>
            <option value="CUSTOM">CUSTOM</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="direction"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Direction
          </label>
          <select
            id="direction"
            name="direction"
            defaultValue={direction}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/integration-edi-layer/edi-messages"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No EDI messages found.</p>
          {canCreate && (
            <Link
              href="/integration-edi-layer/edi-messages/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first EDI message
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Message Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Standard
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Direction
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Sender
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Receiver
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((msg) => (
                <tr
                  key={msg.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/integration-edi-layer/edi-messages/${msg.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {msg.messageRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {msg.messageType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {msg.ediStandard}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={directionVariant(msg.direction)}>
                      {msg.direction}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {msg.senderCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {msg.receiverCode}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(msg.status)}>
                      {msg.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {msg.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(nextCursor)}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
