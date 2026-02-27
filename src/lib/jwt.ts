import { SignJWT, jwtVerify, importPKCS8, importSPKI } from "jose";
import { readFileSync } from "fs";
import { join } from "path";

let privateKey: CryptoKey | null = null;
let publicKey: CryptoKey | null = null;

function getKeyPath(envVar: string): string {
  const path = process.env[envVar];
  if (!path) throw new Error(`${envVar} is not set`);
  // Resolve relative to project root
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
  const pem = readFileSync(getKeyPath("JWT_PUBLIC_KEY_PATH"), "utf-8");
  publicKey = await importSPKI(pem, "RS256");
  return publicKey;
}

export interface AccessTokenPayload {
  sub: string; // user ID
  tid: string; // tenant ID
  email: string;
  role: string;
}

export async function signAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
  const key = await getPrivateKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
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
  return payload as unknown as AccessTokenPayload;
}
