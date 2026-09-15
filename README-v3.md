# War Room v3 — AI DoD capture analyst

Implementation of the [product spec](https://wiki.yourrosterapp.com/doc/war-room-v3-product-spec-Nh6kGV74Im)
and [engineering spec](https://wiki.yourrosterapp.com/doc/war-room-v3-ai-dod-capture-analyst-engineering-spec-gEOuHhSHVu).

## Before you run any of this

Engineering spec §12 gates the build: *"Do not start step 1 until the manual
briefing test has run for four weeks with five real DoD contractors."* That gate
has not been reported as met. The code is here, but `BRIEFING_ALLOWLIST` is set
empty in `.do/app.yaml`, which stops the send job mailing anyone outside the
allowlist. Leave it that way until the gate passes.

`lib/dod-scope.ts` ships an **unverified** DoD agency list — §4 says to confirm
it against the live SAM and USASpending APIs rather than hardcode from memory.
Run `npm run verify-dod-agencies`, correct the list, and set `VERIFIED_AT`.

## Layout

```
migrations/            numbered .sql, run by scripts/migrate.ts
lib/
  db.ts                pooled + direct Postgres (§2)
  dod-scope.ts         DoD filter, pre-RFP classification (§4)
  ingestion/           SAM opportunities + USASpending awards (§4)
  matching/            deterministic scoring, no LLM (§5)
  capture/             incumbent, recompete, brief generation (§6)
  briefing/            payload, plain-text render, Resend send (§9)
  billing/             Stripe checkout and webhook (§8)
  signals/             nightly detectors (§4)
worker/                node-cron + BullMQ, the scheduler and consumers (§2, §8)
app/(app)/today        ranked matches (§7.2)
app/(app)/brief/[id]   capture brief (§7.3)
app/(app)/onboarding   three steps (§7.1)
app/(app)/settings     profile, cadence, billing (§7.4)
app/(app)/admin/ops    internal (§7.5)
```

## Running it

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL at minimum

npm run migrate -- --status       # what is applied
npm run migrate                   # apply everything pending
npm run migrate -- --baseline 040 # existing prod DB only, once, before the above

npm run dev
npm run worker                    # scheduler + queue consumers
npm run worker -- --once=ingest-sam
npm run ingest -- --source=opportunities --lookback=30
npm run score -- --company=<id>   # dry by default; --write to persist
npm test
npm run typecheck
```

### Migrating the existing production database

The Netlify-era migrations 001-040 were applied by hand and are not safe to
re-run (019 and 020 are data migrations). On the restored DigitalOcean
database, run the baseline once:

```bash
DATABASE_URL_DIRECT=<direct string> npm run migrate -- --baseline 040
DATABASE_URL_DIRECT=<direct string> npm run migrate
```

A database built from zero skips the baseline — the whole chain runs, including
`028a_legacy_bootstrap`, which creates four tables that reached production
through inline DDL in request handlers and never appeared in a migration.

## What is deliberately not built

Out of scope for v1 per §14: relationship graph and "Who Should I Know?",
contact enrichment, company and agency intelligence pages, watchlists, team
workspace, CRM integrations, exports, public API, civilian agencies, and the
Scout / Team / Enterprise tiers.

## Open decisions (§15)

1. **Scheduler.** node-cron in the worker is implemented. DO Functions
   scheduled triggers were not evaluated. The schedule table in
   `worker/index.ts` is the only thing that would move.
2. **warroomusa.com during migration.** Not addressed here; a deploy decision.
3. **Org picker scope.** `/api/org-tree` serves both: a curated shortlist by
   default and `?scope=full` for the whole hierarchy, so the decision can be
   made from real onboarding sessions.

## Known pre-existing problems

- `app/api/seed/[fn]/route.ts` is a 6,956-line request handler that trips
  TypeScript's TS2563 limit and degrades inference project-wide. It is
  quarantined in `tsconfig.typecheck.json`; the fix is to move that seed data
  out of a handler and into migrations or a data file.
- `app/(app)/DiscoverClient.tsx:221` references an undefined `setT2OpenId` and
  will throw when that path runs.
- `app/api/import/route.ts` and `app/api/seed-socom/route.ts` call a function
  with the wrong arity.
