/**
 * Stable per-browser identity for people who are not signed in.
 *
 * Feedback is private to whoever wrote it. Signed-in users are identified by
 * their Supabase user id; guests get a random key that is kept in localStorage
 * and sent to Supabase as the `x-guest-key` header, which the row-level
 * security policies use to match rows to their author.
 */
export const GUEST_KEY_STORAGE = "nagsi_feedback_key";

export function getGuestKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(GUEST_KEY_STORAGE);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(GUEST_KEY_STORAGE, created);
    return created;
  } catch {
    return null;
  }
}
