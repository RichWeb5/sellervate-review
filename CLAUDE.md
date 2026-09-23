# Working conventions

## Stack

Next.js App Router + TypeScript (strict), Supabase Postgres, Tailwind v4 + daisyUI 5, pnpm workspace.

## Layout

- `apps/web/src/app` — routes only. Pages fetch through `server/queries` and render feature components.
- `apps/web/src/features/<feature>` — UI and logic owned by one feature (review, feedback, brand-report).
- `apps/web/src/server` — everything that touches data: `queries/` for reads, `actions/` for writes, `session.ts` for the current user.
- `apps/web/src/components/ui` — design primitives with no data access.
- `supabase/migrations` — schema and RLS. `supabase/seed.sql` — invented demo data.

## Rules

- Authorisation lives in Postgres RLS. App code never uses the service role key and never trusts an id sent by the browser to decide access.
- The browser never talks to Supabase directly. Reads happen in server components, writes in server actions validated with zod.
- Small, single-purpose functions and components. Name things after what the user sees, not after the table.
- Comments only when the code cannot say it: one line, explaining why, never what.
- No dead code, no commented-out code, no speculative abstractions.
- One branch and one pull request per piece of work; history is never squashed or rebased.

## Commands

- `pnpm db:start` / `pnpm db:reset` / `pnpm db:types`
- `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`
