/**
 * Minimal in-memory rate limiter (fixed window). Best-effort only: state lives
 * in the process, so it resets on restart and is not shared across instances —
 * fine for the single-instance deployment, enough to blunt casual abuse of the
 * public contact endpoint alongside the honeypot.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}
