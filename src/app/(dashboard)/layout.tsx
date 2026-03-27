import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserPermissions } from "@/lib/rbac";
import { db } from "@/lib/db";
import { tenants, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ChatPanel } from "@/components/ai-chat/chat-panel";
import { FlowContextBanner } from "@/components/processes/flow-context-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const permissions = await getUserPermissions(session.id, session.tenantId);

  const [[tenant], [user]] = await Promise.all([
    db.select({ name: tenants.name }).from(tenants).where(eq(tenants.id, session.tenantId)).limit(1),
    db.select({ displayName: users.displayName }).from(users).where(eq(users.id, session.id)).limit(1),
  ]);

  const userName = user?.displayName || session.email.split("@")[0];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar tenantName={tenant?.name || "CS ERP"} permissions={permissions} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar userName={userName} userEmail={session.email} />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <FlowContextBanner />
          {children}
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
