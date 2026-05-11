/**
 * Seed (or re-seed) an organizer admin via Supabase Auth Admin + PostgREST.
 *
 * Run:
 *   node --env-file=.env.local scripts/seed-organizer.mjs \
 *     --email=foo@bar.com --password=secret --name="Acme" \
 *     [--legal-name="Acme LTDA"] [--cnpj=00.000.000/0001-00] \
 *     [--tax-regime=simples_nacional|mei|lucro_presumido] \
 *     [--role=super_admin|event_maker|client_user]
 *
 * Idempotent: existing user is reused (password reset); organizer row upserted;
 * profile role is set if --role is provided.
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  })
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const email = args.email;
const password = args.password;
const name = args.name;
if (!email || !password || !name) {
  console.error("Required: --email, --password, --name");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function req(path, init = {}) {
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.message || body?.error || res.statusText;
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${msg}`);
  }
  return body;
}

// 1. Find existing user (paged).
let userId = null;
{
  let page = 1;
  while (page <= 20) {
    const list = await req(`/auth/v1/admin/users?page=${page}&per_page=200`);
    const found = list.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      userId = found.id;
      break;
    }
    if (list.users.length < 200) break;
    page++;
  }
}

if (userId) {
  await req(`/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ password, email_confirm: true }),
  });
  console.log(`✓ user already existed  id=${userId} (password reset)`);
} else {
  const created = await req(`/auth/v1/admin/users`, {
    method: "POST",
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  userId = created.id;
  console.log(`✓ auth user created     id=${userId}`);
}

// 2. Upsert organizer row.
const organizer = {
  user_id: userId,
  name,
  legal_name: args["legal-name"] ?? null,
  cnpj: args.cnpj ?? null,
  tax_regime: args["tax-regime"] ?? null,
};
const upserted = await req(`/rest/v1/organizers?on_conflict=user_id`, {
  method: "POST",
  headers: {
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(organizer),
});
console.log(`✓ organizer upserted    id=${upserted[0].id}`);

// 3. Optional: set role on the profiles row.
if (args.role) {
  const profile = {
    id: userId,
    role: args.role,
    name: args.name,
  };
  await req(`/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(profile),
  });
  console.log(`✓ profile role set      role=${args.role}`);
}

console.log("\nDone. Sign in at /login with:");
console.log("  email:    " + email);
console.log("  password: " + password);
