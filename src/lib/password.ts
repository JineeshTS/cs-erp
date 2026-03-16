import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = Math.min(Math.max(parseInt(process.env.BCRYPT_ROUNDS || "12", 10), 10), 14);

// Pre-computed dummy hash for timing attack prevention.
// Used when a user is not found so the response time is the same.
const DUMMY_HASH =
  "$2b$12$LJ3m4ys4Lz9aGuEq3MKQP.FzLVveYNC/eHQoCNJbBQMkQkBwWMOeG";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string | null
): Promise<boolean> {
  // If hash is null (user not found), compare against dummy hash
  // to prevent timing-based user enumeration
  return bcrypt.compare(password, hash || DUMMY_HASH);
}
