/**
 * Stable per-browser identity for people who are not signed in.
 *
 * The key is only used to record who authored a public review; it is sent to
 * Supabase as the `x-guest-key` header and insert policies require it for
 * anonymous writers. It is cleared on sign-in/sign-out so a new visitor on the
 * same browser never inherits the previous guest's identity.
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

export function clearGuestKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_KEY_STORAGE);
  } catch {
    // Storage can be unavailable in private mode; nothing else to do.
  }
}
