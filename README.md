# Sellervate Review

An internal tool where team leads review support replies that already went out, and specialists read back what their lead thought. It is not a helpdesk: nobody talks to a customer here.

Why it is shaped this way, what was left out and what I would ask before a V2 are in [DECISIONS.md](DECISIONS.md) (in Spanish).

**Time spent:** about 5 hours.

## Run it locally

You need Node 20.9 or newer, pnpm 10 and Docker Desktop running.

```bash
git clone https://github.com/RichWeb5/sellervate-review.git
cd sellervate-review
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm db:start     # first run downloads the Supabase images, then applies migrations and seed
pnpm dev          # http://localhost:3000
```

The seed uses dates relative to when it runs, so there are always replies from "yesterday" waiting. If you come back days later, `pnpm db:reset` brings them back.

## Be each role

Sign-in is stubbed: the first screen lets you pick a person, and the switcher at the bottom of the sidebar changes person at any time. The session underneath is real, so what each person sees is decided by the database, not by the page.

| Person       | Role                         | What they see                                 |
| ------------ | ---------------------------- | --------------------------------------------- |
| Marta Ruiz   | Lead of Voltra and Boxwell   | Review queue and reports for those two brands |
| Nuria Campos | Lead of Hearth               | Review queue and report for Hearth only       |
| Dani Ortega  | Specialist (Voltra, Boxwell) | Only reviews of his own replies               |
| Aisha Bello  | Specialist (Boxwell, Hearth) | Only reviews of her own replies               |
| Tomás Vidal  | Specialist (Voltra, Hearth)  | Only reviews of his own replies               |

A three-minute tour:

1. **Marta** lands on yesterday's replies with five suggested. Open "Cuts out on hills": Tomás refunded a scooter without diagnosing it. Press a number from 1 to 5, tick what was off, and Ctrl + Enter saves and opens the next one.
2. In the sidebar, **Brand reports → Voltra** shows the weekly trend, what keeps going wrong and every review, including whether the specialist read it.
3. Switch to **Dani**: only his reviewed replies, with Marta's notes, and a button to mark each as read.
4. Switch to **Nuria** and open `/brands/voltra`: not found. She does not lead it.

## Checks

```bash
pnpm db:test          # 18 pgTAP tests: RLS isolation between brands and roles, atomic review saving
pnpm check:isolation  # signs in as real users and asks the Supabase API directly for data they must not see
pnpm lint && pnpm typecheck
```

## What is where

```
apps/web/src/app          routes only
apps/web/src/features     UI per feature: review, feedback, brand-report
apps/web/src/server       reads (queries/), writes (actions/), current user (session.ts)
apps/web/src/components   design primitives and the app shell
supabase/migrations       schema, RLS policies, save_review function
supabase/seed.sql         invented brands, people, replies and reviews
supabase/tests            pgTAP tests
scripts/check-isolation   API-level isolation check
```

Started from `create-next-app` (empty App Router template), no other starter kit. Next.js 16, TypeScript, Supabase, Tailwind v4 and daisyUI 5.
