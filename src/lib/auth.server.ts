import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Officer account provisioning.
 *
 * Supabase's built-in email service is rate limited to a handful of messages
 * per hour, so the default `auth.signUp()` flow fails with
 * "email rate limit exceeded" and leaves accounts stuck behind an email
 * confirmation link that never arrives.
 *
 * These handlers create the account with the service-role Admin API and set
 * `email_confirm: true`, so no email is ever sent and the officer can sign in
 * immediately.
 */

type Body = {
  email?: string;
  password?: string;
  fullName?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, { status });
}

async function readBody(request: Request): Promise<Body> {
  try {
    return (await request.json()) as Body;
  } catch {
    return {};
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email: string) {
  const target = normalizeEmail(email);
  const perPage = 200;

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match;
    if (data.users.length < perPage) return null;
  }

  return null;
}

export async function handleRegisterOfficer(request: Request): Promise<Response> {
  const { email, password, fullName } = await readBody(request);

  if (!email || !EMAIL_RE.test(email.trim())) {
    return json({ error: "Enter a valid email address." }, 400);
  }
  if (!password || password.length < 6) {
    return json({ error: "Password must be at least 6 characters." }, 400);
  }

  const normalized = normalizeEmail(email);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalized,
    password,
    // Skip the confirmation email entirely: no rate limit, instant access.
    email_confirm: true,
    user_metadata: { full_name: fullName?.trim() || undefined },
  });

  if (!error) {
    return json({ status: "created", userId: data.user?.id ?? null });
  }

  const message = error.message ?? "";
  const alreadyRegistered = /already|registered|exists|duplicate/i.test(message);

  if (alreadyRegistered) {
    // The address exists (possibly from an earlier attempt that got stuck on
    // email confirmation). Confirm it so the matching password works, but do
    // not change the password of an existing account from a public endpoint.
    const existing = await findUserByEmail(normalized);
    if (existing && !existing.email_confirmed_at) {
      await supabaseAdmin.auth.admin.updateUserById(existing.id, { email_confirm: true });
      return json({ status: "confirmed_existing" });
    }
    return json({ status: "exists" });
  }

  return json({ error: message || "Could not create the account." }, 400);
}

/**
 * Confirms an existing account whose confirmation email never arrived.
 * Used by the sign-in form when Supabase replies "Email not confirmed".
 */
export async function handleConfirmOfficer(request: Request): Promise<Response> {
  const { email } = await readBody(request);

  if (!email || !EMAIL_RE.test(email.trim())) {
    return json({ error: "Enter a valid email address." }, 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return json({ status: "not_found" }, 404);
  }

  if (!user.email_confirmed_at) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (error) {
      return json({ error: error.message }, 400);
    }
  }

  return json({ status: "confirmed" });
}
