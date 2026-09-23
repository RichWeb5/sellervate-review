// Asks the Supabase API directly for data each person should not see, bypassing the app entirely.
// Run with: pnpm check:isolation (needs `pnpm db:start` and `pnpm db:reset` first).

import { execSync } from "node:child_process";

const status = JSON.parse(execSync("pnpm -s exec supabase status -o json", { encoding: "utf8" }));
const api = status.API_URL;
const key = status.PUBLISHABLE_KEY;
const password = "review-demo";
const hearthId = "b1000000-0000-4000-8000-000000000003";
const voltraId = "b1000000-0000-4000-8000-000000000001";

let failures = 0;

async function signIn(email) {
  const response = await fetch(`${api}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  if (!body.access_token) throw new Error(`Could not sign in as ${email}: ${JSON.stringify(body)}`);
  return { id: body.user.id, token: body.access_token };
}

async function query(path, token) {
  const headers = { apikey: key };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${api}/rest/v1/${path}`, { headers });
  return { status: response.status, rows: await response.json() };
}

function expect(label, passed, detail) {
  console.log(`${passed ? "ok  " : "FAIL"} ${label}${passed ? "" : ` (${detail})`}`);
  if (!passed) failures += 1;
}

const dani = await signIn("dani@sellervate.test");
const nuria = await signIn("nuria@sellervate.test");

const daniBrands = await query("brands?select=slug&order=slug", dani.token);
expect(
  "Dani (specialist) only sees the brands he writes for",
  JSON.stringify(daniBrands.rows.map((b) => b.slug)) === '["boxwell","voltra"]',
  JSON.stringify(daniBrands.rows),
);

const daniHearth = await query(`replies?select=id&brand_id=eq.${hearthId}`, dani.token);
expect(
  "Dani gets nothing when he asks for Hearth replies",
  daniHearth.rows.length === 0,
  daniHearth.rows.length,
);

const daniReplies = await query("replies?select=author_id", dani.token);
expect(
  "Every reply Dani can read is his own",
  daniReplies.rows.length > 0 && daniReplies.rows.every((r) => r.author_id === dani.id),
  `${daniReplies.rows.length} rows`,
);

const daniReviews = await query("reviews?select=id,replies!inner(author_id)", dani.token);
expect(
  "Every review Dani can read is about his own replies",
  daniReviews.rows.every((r) => r.replies.author_id === dani.id),
  `${daniReviews.rows.length} rows`,
);

const daniWrite = await fetch(`${api}/rest/v1/reviews`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${dani.token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    reply_id: "e1000000-0000-4000-8000-000000000010",
    reviewer_id: dani.id,
    score: 5,
  }),
});
expect("Dani cannot give himself a review", daniWrite.status === 403, daniWrite.status);

const nuriaVoltra = await query(`replies?select=id&brand_id=eq.${voltraId}`, nuria.token);
expect(
  "Nuria (lead of Hearth) gets nothing from Voltra",
  nuriaVoltra.rows.length === 0,
  nuriaVoltra.rows.length,
);

const anonymous = await query("replies?select=id");
expect("A request without a session is refused", anonymous.status === 401, anonymous.status);

process.exit(failures === 0 ? 0 : 1);
