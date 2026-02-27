import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      currency: tenants.currency,
      onboardedAt: tenants.onboardedAt,
    })
    .from(tenants)
    .where(eq(tenants.id, session.tenantId))
    .limit(1);

  // Already onboarded — redirect to dashboard
  if (tenant?.onboardedAt) redirect("/");

  return (
    <div className="mx-auto max-w-2xl py-8">
      <OnboardingWizard
        tenantId={tenant?.id || ""}
        tenantName={tenant?.name || ""}
        currency={tenant?.currency || "QAR"}
      />
    </div>
  );
}
