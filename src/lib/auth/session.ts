import { cookies } from "next/headers";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/jwt";
import { setTenantRLS } from "@/lib/db";

export interface SessionUser {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("cs_access_token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const user: SessionUser = {
      id: payload.sub,
      tenantId: payload.tid,
      email: payload.email,
      role: payload.role,
    };

    // Set PostgreSQL RLS context for this request
    await setTenantRLS(user.tenantId);

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const error = new Error("Unauthorized") as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }
  return session;
}
