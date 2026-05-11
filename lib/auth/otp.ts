import { createHash, randomInt } from "crypto";

/**
 * One-time-code generator + verifier.
 *
 * - 6 digits.
 * - Stored only as `sha256(code + SESSION_SECRET)` so a DB leak doesn't
 *   expose live codes.
 * - 10 minute TTL, max 5 attempts per code (enforced by callers).
 */
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  // randomInt is cryptographically secure (vs Math.random)
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(code: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 chars.");
  }
  return createHash("sha256").update(`${code}:${secret}`).digest("hex");
}

export function codeMatches(code: string, hash: string): boolean {
  // constant-time-ish: hash both then compare strings
  return hashOtp(code) === hash;
}

export function isExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}
