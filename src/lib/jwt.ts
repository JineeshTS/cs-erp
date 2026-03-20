import { SignJWT, jwtVerify, importPKCS8, importSPKI } from "jose";
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

let privateKey: CryptoKey | null = null;
let publicKey: CryptoKey | null = null;

function getKeyPath(envVar: string): string {
  const path = process.env[envVar];
  if (!path) throw new Error(`${envVar} is not set`);
  if (path.startsWith("/")) return path;
  return join(process.cwd(), path);
}

async function getPrivateKey(): Promise<CryptoKey> {
  if (privateKey) return privateKey;
  const pem = readFileSync(getKeyPath("JWT_PRIVATE_KEY_PATH"), "utf-8");
  privateKey = await importPKCS8(pem, "RS256");
  return privateKey;
}

async function getPublicKey(): Promise<CryptoKey> {
  if (publicKey) return publicKey;

  // Try PEM from env first (used by Edge middleware which can't read files)
  let pem = process.env.JWT_PUBLIC_KEY_PEM;

  // Fallback to file path (used by Node.js server routes)
  if (!pem) {
    try {
      pem = readFileSync(getKeyPath("JWT_PUBLIC_KEY_PATH"), "utf-8");
    } catch {
      throw new Error("JWT public key not found in JWT_PUBLIC_KEY_PEM env or JWT_PUBLIC_KEY_PATH file");
    }
  }

  publicKey = await importSPKI(pem, "RS256");
  return publicKey;
}

// Zod schema to validate JWT payload shape after verification
const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  tid: z.string(),
  email: z.string(),
  role: z.string(),
  iat: z.number().optional(),
  iss: z.string().optional(),
  aud: z.union([z.string(), z.array(z.string())]).optional(),
  exp: z.number().optional(),
});

export type AccessTokenPayload = {
  sub: string;
  tid: string;
  email: string;
  role: string;
  jti?: string;
};

export async function signAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
  const key = await getPrivateKey();
  const { randomUUID } = await import("crypto");
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setJti(randomUUID()) // CSERP-010: unique token ID for blacklisting
    .setIssuedAt()
    .setIssuer("cs-erp")
    .setAudience("cs-erp")
    .setExpirationTime("15m")
    .sign(key);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const key = await getPublicKey();
  const { payload } = await jwtVerify(token, key, {
    issuer: "cs-erp",
    audience: "cs-erp",
  });

  const parsed = accessTokenPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Invalid JWT payload structure");
  }

  return {
    sub: parsed.data.sub,
    tid: parsed.data.tid,
    email: parsed.data.email,
    role: parsed.data.role,
    jti: (payload.jti as string) || undefined,
  };
}

// CSERP-010: JWT blacklist for immediate token revocation on logout
const BLACKLIST_PREFIX = "jwt:bl:";
const BLACKLIST_TTL_SECONDS = 15 * 60; // 15 minutes (matches access token lifetime)

export async function blacklistToken(jti: string): Promise<void> {
  try {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    await redis.set(`${BLACKLIST_PREFIX}${jti}`, "1", "EX", BLACKLIST_TTL_SECONDS);
  } catch {
    // Fail-open: if Redis is down, token remains valid until natural expiry
    console.error("[JWT] Failed to blacklist token — Redis unavailable");
  }
}

export async function isTokenBlacklisted(jti: string | undefined): Promise<boolean> {
  if (!jti) return false;
  try {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    const result = await redis.get(`${BLACKLIST_PREFIX}${jti}`);
    return result === "1";
  } catch {
    // Fail-open: if Redis is down, allow the token
    return false;
  }
}
