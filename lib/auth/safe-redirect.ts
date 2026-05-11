/**
 * Conservative same-origin redirect validator.
 *
 * Accepts: relative paths starting with `/<segment>`.
 * Rejects:
 *   - protocol-relative (`//evil.com`, `/\evil`)
 *   - absolute URLs (`https://...`)
 *   - URLs with embedded whitespace or control chars
 *   - non-string / empty values
 *
 * Returns the input if safe, or `fallback`.
 */
export function safeNext(
  candidate: string | null | undefined,
  fallback: string
): string {
  if (typeof candidate !== "string") return fallback;
  const trimmed = candidate.trim();
  if (trimmed.length === 0) return fallback;
  if (trimmed.length > 512) return fallback;
  // single leading slash + a non-slash/backslash char blocks //evil.com and /\evil
  if (!/^\/[^/\\]/.test(trimmed)) return fallback;
  // reject any whitespace or ASCII control chars (0x00-0x1F, 0x7F)
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return fallback;
  }
  return trimmed;
}
