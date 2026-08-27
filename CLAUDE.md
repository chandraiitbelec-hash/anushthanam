# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Anushthanam** (alt: anushthana, anushtanam, anusthanam, anustanam) — a Hindu devotion reference site covering gods (devatas), shlokas, stotras, pujas, festivals, vrathams, and panchangam. Serves Telugu, Tamil, Hindi, and English speakers. No e-commerce. Google sign-in exists as of the Accounts / Auth section below — the earlier "no user accounts in Phase 1" rule is deliberately superseded; accounts are the foundation for the planned live-audio satsang community.

GitHub: https://github.com/chandraiitbelec-hash/anushthanam

## Stack

- **Frontend:** Next.js 16.2.9 (App Router), React 19.2.4, TypeScript. Styling is inline styles + CSS variables (`@theme` tokens in `app/globals.css`); Tailwind v4 is present only for base/preflight, not as the component-styling method. Builds run on Turbopack (Next 16's default build engine — no opt-in config needed).
- **CMS:** Google Sheets (structured data) + Google Docs (legacy long-form prose) + a Sheets tab (`stories_content`) for current story bodies
- **Search:** Client-side Fuse.js over `public/search-index.json` (built at `prebuild` time, before `next build`)
- **Accounts:** Auth.js (next-auth v5) with Google as the only provider, JWT sessions; a minimal `users` table on Supabase Postgres reached through `pg` — see Accounts / Auth below
- **Deployment:** Vercel with static generation + ISR (`revalidate = 3600`) + manual deploy hook triggered from Sheets Apps Script
  - **NEVER run `vercel` or deploy to Vercel directly.** Always push to GitHub; the user manages Vercel from there.

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # prebuild writes search-index.json, then next build
npm run lint         # eslint . (flat config, eslint.config.mjs)
node scripts/check-content-health.mjs   # pre-deploy: verify live Sheet headers/data, read-only
node scripts/report-translation-coverage.mjs [--verbose]   # per-language fill-rate report across content tabs, read-only
node scripts/migrate.mjs             # list pending Postgres migrations (dry run)
node scripts/migrate.mjs --write     # apply them
node scripts/test-occurrences.mjs    # unit tests for the schedule recurrence/tz math
```

## Architecture

### Rendering model

The root layout (`app/layout.tsx`) reads `cookies()` to seed `<html lang>` and `data-theme` **server-side**, which opts every route into per-request dynamic rendering (`ƒ`). This is a **deliberate, settled trade** (tried both ways — do not flip it casually): a static shell would paint English first and flip to the visitor's language after hydration, visibly re-flowing every block on every page view for te/ta/hi users. Serving HTML in the visitor's language from the first byte wins.

What makes dynamic rendering safe and cheap here:
- All Sheets data is cached via `unstable_cache` (1h) — per-request rendering does not mean per-request Sheets fetches.
- Every page guards its fetches with `.catch(() => [])` and `generateMetadata` with try/catch, so a Sheets outage degrades to empty states, never a blanked page.
- The per-page `revalidate` exports are inert while the layout is dynamic; they're kept for the case where the trade is ever revisited.

Language/theme seeding details:
- `LanguageProvider` / `ThemeProvider` receive `initialLang` / `initialTheme` from the layout and use them as the `useSyncExternalStore` server snapshot, so SSR markup, hydration, and client state agree from the first byte — no post-hydration flip, no hydration mismatch, no set-state-in-effect.
- Two `beforeInteractive` inline `<Script>` tags (`lang-init`, `theme-init`) remain as a fallback for cookie-less visitors whose preference lives only in `localStorage` (pre-cookie era) — they set the DOM attributes before first paint; the providers' client snapshot reads the DOM attribute and reconciles.
- On an in-page language switch, `LanguageContext.setLang` captures the element at the reading position and restores its viewport offset after the reflow settles (see the scroll-anchor logic in `context/LanguageContext.tsx`).
- (The scripts live directly under `<body>`, not `<html>`, to avoid React 19's "`<html>` cannot contain nested `<script>`" warning.)

### Data flow

```
Google Sheets / Docs
  → Sheets API v4 / Docs API (read-only service account)
  → Next.js server render per request (unstable_cache keeps Sheets reads to ~1/tab/hour)
  → HTML in the visitor's language + public/search-index.json on Vercel
```

Publishing is intentional: a "Publish to site" menu in Apps Script triggers the Vercel deploy hook. ISR handles near-live updates between full deploys.

### Data-cache layer (`lib/sheets.ts`)

- `getSheetRows(tab)` wraps the raw Sheets fetch in `unstable_cache(..., { revalidate: 3600 })` — each tab is cached separately for 1 hour, shared across all pages in the same build/runtime. An in-flight `Map` sits in front of it to coalesce concurrent requests for the same tab before they even reach the cache.
- `getPublished(tab)` filters `getSheetRows(tab)` to `status === 'published'`.
- **`shloka_stanzas` no longer serves page traffic from Sheets.** Stanza content is exported to static per-shloka JSON (`lib/data/stanzas/<slug>.json`, generated by `scripts/export-shloka-stanzas.mjs` after each stotra upload) and read via `lib/stanzas.ts` `getShlokaStanzas(slug)`. The Sheets tab remains the authoring surface; the old `getSheetRowsLarge` path (in-process memo bypassing `unstable_cache`'s ~2MB limit) survives only as a missing-JSON fallback that logs `CONTENT ERROR`.

### Key lib files

| File | Purpose |
|------|---------|
| `lib/sheets.ts` | `getSheetRows()` / `getSheetRowsLarge()` / `getPublished()` — reads from Google Sheets via service account, with the caching behavior above |
| `lib/docs.ts` | `getStoryBody()` (Docs API, still used when a story has `gdoc_id_{lang}` set) and `getStoryBodyFromSheet()` (reads `stories_content` tab) — see Stories below |
| `lib/types.ts` | All entity types |
| `lib/relations.ts` | Cross-entity resolution (god_links, linked slugs, occasion↔puja resolution) |
| `lib/search-config.ts` | Shared Fuse.js options (`keys`/`threshold`/`minMatchCharLength`) used by both `SearchBar` and `SearchPage` |
| `lib/stanzas.ts` + `lib/data/stanzas/` | Shloka stanza content as static per-slug JSON (exported from Sheets by `scripts/export-shloka-stanzas.mjs`) — the serving path for `getShlokaStanzas` |
| `lib/panchangam.ts` | Reads the panchangam tab, exposes today's and date-specific data |
| `lib/ui-strings.ts` | Centralized UI-string dictionary — see Language / translation pattern below |
| `lib/gita.ts` + `lib/data/bhagavad-gita.json` | Static-JSON Bhagavad Gita section — see below |
| `lib/daily-devotional.ts` + `lib/data/daily-devotional.json` | Rotating daily devotional pick, static JSON, no Sheets dependency |
| `lib/db.ts` | Pooled `pg` client + `query()` helper, and `isDbConfigured`; the only place a Postgres connection is opened |
| `lib/users.ts` | `upsertUserFromGoogle()` — the single writer to the `users` table, called once per sign-in |
| `auth.ts` (repo root) | Auth.js config: Google provider, JWT callbacks, `isAuthConfigured` — see Accounts / Auth below |
| `lib/schedule.ts` + `lib/occurrences.mjs` + `lib/ics.ts` | The Schedule layer — see below |
| `lib/satsang.ts` + `lib/event-kinds.ts` | Live-audio session state, and the client-safe event-kind vocabulary — see Satsang below |
| `lib/audio/` | Vendor-neutral live-audio contracts (`audio-room.ts`, `admin.ts`) and the only two modules allowed to import LiveKit — see Satsang below |
| `context/LanguageContext.tsx` | Active language (`en`/`te`/`ta`/`hi`) stored in context + localStorage/cookie |

### Status model

Every entity has `status`: `draft` | `review` | `published`. Only `published` rows are fetched by `getPublished()`. Nothing outside `published` appears on the site or in the search index.

### Language / translation pattern

The old `t(record, field, lang)` helper and `TranslationBadge` component were removed (zero adoption), then reintroduced properly as `localize()` — see below. Current pattern:

- Per-entity content still has `field_en`, `field_te`, `field_ta`, `field_hi` columns. `localize(entity, field, lang)` (`lib/localize.ts`) is the sanctioned accessor: `entity[`${field}_${lang}`] || entity[`${field}_en`] || ''`, with whitespace-only values trimmed before the truthiness check. `field` is constrained via a template-literal mapped type to bases where `${field}_en` exists and is a string on the entity's type, so a typo'd field name is a compile error rather than a silently-`undefined` read — this is why the inline `entity as unknown as Record<string, string>` cast pattern from before is gone; don't reintroduce it. A second overload covers genuinely untyped Sheets rows (Record<string, string>) for cases without a typed entity yet.
- All UI chrome strings (labels, nav, breadcrumbs, buttons — not entity content) are centralized in `lib/ui-strings.ts`: a typed `UiStrings` shape (~90 keys, some as functions like `partOf(n, total)`) with a hand-written table per language (`UI.en`, `UI.te`, `UI.ta`, `UI.hi`). Add new UI copy here, not as inline literals or ad hoc per-component label maps.
- `scriptClass(lang)` (`lib/utils.ts`) maps a language to its native-script CSS class (`te→script-telugu`, `ta→script-tamil`, `hi→script-devanagari`, `en→''`) for correct font/line-height rendering.
- There is no translation-coverage tooling checked in currently; if one gets added it should be read-only (report, not mutate).

### Shloka stanza convention

Line breaks within a stanza are encoded as `|` in Sheets cells (not actual newlines). `ShlokaViewer` splits on `|` to render separate lines. Columns: `script_devanagari`, `script_telugu`, `script_tamil`, `roman_iast`, `meaning_en/te/ta/hi`.

### Stories

Published story bodies are read from the `stories_content` tab (`story_slug, lang, paragraph_num, text`) via `getStoryBodyFromSheet()` in `lib/docs.ts`, sorted by `paragraph_num`.

`gdoc_id_en/te/ta/hi` on `stories_index` is **not** dead — it's still a live per-language override: `app/stories/[slug]/page.tsx` uses the Docs API (`getStoryBody`) for a given language when that story's `gdoc_id_{lang}` is populated, and falls back to `stories_content` otherwise (including for `en`). Migrating a story into `stories_content` means clearing its `gdoc_id_{lang}` values (see `scripts/upload-stories-content.mjs`) so the fallback path takes over.

### Search index

Built by `scripts/build-search-index.mjs`, run via the `prebuild` npm script before every `next build`. Covers gods, festivals, vrathams, shloka titles — not puja or story body text. Fuse.js threshold: 0.35 (intentionally loose for phonetic deity name variants); the client-side search options live in `lib/search-config.ts`, shared by `SearchBar` and `SearchPage`.

On Vercel/CI (`process.env.VERCEL || process.env.CI`), missing `GOOGLE_SERVICE_ACCOUNT_KEY` or `SHEETS_SPREADSHEET_ID` **hard-fails the build** (`process.exit(1)`). Locally, missing env instead logs a warning and writes an empty `public/search-index.json` so `npm run build` still succeeds without credentials.

### Google Sheets tabs

`gods`, `shlokas`, `shloka_stanzas`, `pujas`, `festivals`, `vrathams`, `stories_index`, `stories_content`, `god_links`, `procedure_steps`, `material_items`, `panchangam`, `config`, `occasions`, `puja_occasions`

(`tags` was previously listed here but has no current code references — treat as legacy/unused unless you find a new consumer.)

`god_links` is the join table for all deity↔entity relationships — never add cross-links directly to entity tabs.

`stories_content` holds current story paragraphs (`story_slug, lang, paragraph_num, text`) and is the primary path for story bodies; `stories_index.gdoc_id_{lang}` is a per-language override that routes to the legacy Docs API path instead (see Stories above).

`occasions` holds life-events / samskaras (housewarming, wedding, aksharabhyasam, …) — NOT calendar festivals, NOT vrathams. Schema: `slug, title_en/te/ta/hi, description_en/te/ta/hi, icon (emoji), display_order, status`.

`puja_occasions` is the many-to-many join between pujas and occasions. Schema: `occasion_slug, puja_slug, display_order`. A puja can appear under multiple occasions.

`pujas.frequent` (TRUE|FALSE) — when TRUE the puja appears in the "Daily & Frequent" grid on /pujas. A puja can be `frequent=TRUE` AND also mapped to occasions simultaneously (e.g. Vinayaka Puja).

### /pujas information architecture

`/pujas` has two sections toggled by a tab bar:
1. **Daily & Frequent** — card grid of pujas where `frequent=TRUE`.
2. **For Occasions** — accordion list of occasions; selecting one reveals its mapped pujas via `puja_occasions`.

Detail pages (`/pujas/[slug]`, `PujaProfile`) are unchanged.

Helper functions (all in `lib/relations.ts`):
- `getFrequentPujas()` → `Puja[]` (published, frequent=TRUE)
- `getOccasions()` → `Occasion[]` (published, ordered by display_order)
- `resolveOccasionPujas(occasionSlug)` → `Puja[]` (via puja_occasions)
- `getAllOccasionPujas()` → `Record<string, Puja[]>` (bulk fetch for the list page)

### Bhagavad Gita section (`/bhagavad-gita`)

Static-JSON, not Sheets-backed. `lib/gita.ts` imports `lib/data/bhagavad-gita.json` directly and exposes `getGitaChapters()`, `getGitaChapter(number)`, `getGitaVersesByChapter(chapter)`. `app/bhagavad-gita/[chapter]/page.tsx` uses `generateStaticParams` over the chapter list. If this content ever needs editing, edit the JSON file directly — there's no Sheets tab for it.

### Tabs primitive

Shared tabbed-UI components (`ShlokaTypeTabs`, `PujasBrowser`, `PujaProfile`, `VrathamProfile`, `FestivalProfile`, and the `/pujas` section toggle) are built on one common `Tabs` primitive rather than each rolling its own tab state/markup. Extend that primitive rather than adding another bespoke tab implementation.

### Accounts / Auth

Google sign-in, and nothing more. This is deliberately step 1 of the live-audio
**satsang** community foundation — community membership, teacher roles and
scheduled sessions are all planned on top of it and none of them exist yet.
Resist folding them in early: the value of this layer is that it is small enough
to be obviously correct.

**Stack and why**

- **Auth.js (next-auth v5), Google provider only.** Google is the sole sign-in
  method — no passwords, no OTP — so identity verification is entirely Google's
  problem and there is no credential handling in this repo. Auth.js handles
  session cookie signing/encryption, CSRF and the OAuth handshake; do not
  hand-roll anything around it.
- **JWT session strategy.** The signed cookie carries the identity, so rendering
  a page never queries Postgres to know who's asking. No session table, no
  adapter.
- **Supabase Postgres via `pg`.** The first feature on the site needing real
  persistent storage. One table, hand-written SQL, no ORM — reach for a query
  builder when that stops being true, not before. `@supabase/supabase-js` is
  deliberately **not** installed: that client is PostgREST-over-HTTP built around
  RLS and anon keys, which only makes sense if Supabase is also the auth
  provider. It isn't; Auth.js is. Connect over plain Postgres.

**Files**

| File | Role |
|------|------|
| `auth.ts` (repo root) | `NextAuth()` config; exports `handlers` / `auth` / `signIn` / `signOut` and `isAuthConfigured` |
| `app/api/auth/[...nextauth]/route.ts` | Mounts Auth.js on `/api/auth/*`; pinned to the Node runtime because `pg` is not Edge-compatible |
| `types/next-auth.d.ts` | Session/JWT augmentation for `accountId` and `googleId` |
| `lib/db.ts` / `lib/users.ts` | Connection pool and the single `users` writer |
| `db/migrations/*.sql` + `scripts/migrate.mjs` | Schema, and the runner that applies it |
| `components/AuthProvider.tsx` / `components/AuthControl.tsx` | Client session provider, and the nav sign-in/account control |

**Supabase specifics (learned the hard way — don't undo these)**

- **TLS needs Supabase's private root CA.** Supabase does not use a publicly
  trusted CA for Postgres: the pooler presents a chain rooted in a self-signed
  `Supabase Root 2021 CA`, so Node fails with `SELF_SIGNED_CERT_IN_CHAIN`
  against the system trust store. `lib/supabase-ca.mjs` inlines that root and
  `sslFor()` in `lib/db.ts` supplies it for `*.supabase.com/.co` hosts with
  verification still on. **Never "fix" a TLS error here with
  `rejectUnauthorized: false`** — that accepts any certificate and hands a
  network attacker the users table. The CA is inlined rather than read from a
  `.pem` so it survives Next's server bundling with no file-tracing config.
  It expires 2031-04-26.
- **Use the transaction pooler** (`...pooler.supabase.com:6543`), not the direct
  `db.<ref>.supabase.co:5432` endpoint, which is IPv6-only without a paid add-on
  and doesn't pool. Transaction mode forbids *named* prepared statements; `pg`
  only issues unnamed ones here, so `query()` is compatible as written.
- **RLS is on with zero policies**, which denies everything to the `anon` role.
  Supabase exposes `public` tables over PostgREST and the anon key is public, so
  a `users` table full of emails must not be reachable that way. The app is
  unaffected because it connects as the table owner, which bypasses RLS.
- **Supabase provisions its own `auth.users`** in the `auth` schema even though
  Supabase Auth is unused. Ours is always `public.users` — two tables named
  `users` in one database is an easy trap.
- Supavisor drops idle connections, so the `pool.on('error')` handler in
  `lib/db.ts` is load-bearing, not boilerplate: without it an idle-client
  `ETIMEDOUT` becomes an unhandled event that kills the process.

**Schema (`users`)**

`id` (uuid pk) · `google_id` (unique, the OAuth `sub`) · `email` (unique) ·
`name` · `avatar_url` · `created_at` · `updated_at`.

`id` is a surrogate UUID rather than the Google id precisely so future
`community` / `membership` / `teacher_role` tables can foreign-key to something
that has nothing to do with the identity provider. Upserts conflict on
`google_id`, which is stable across email and display-name changes, so a
returning user keeps the same `id`.

**Session shape — read this before using an id as a foreign key**

- `session.user.accountId` — our `users.id` UUID. **This is the FK target.**
  Optional: sign-in deliberately succeeds even when the Postgres write fails or
  no `DATABASE_URL` is set, so callers must handle its absence rather than
  assume a row exists.
- `session.user.googleId` — the OAuth `sub`; always present on a signed-in
  session, and enough to re-resolve or create the row later.
- `session.user.id` — Auth.js's own default, which is the provider account id
  (same value as `googleId`). **Never use it as a foreign key.**

**Failure behaviour (all deliberate)**

- Missing `AUTH_SECRET` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` →
  `isAuthConfigured` is false, the nav renders with no sign-in control at all,
  and the site behaves exactly as it did before accounts existed. Local dev and
  preview deploys without credentials are unaffected.
- Missing `DATABASE_URL` → sign-in works, no row is written, `accountId` is
  undefined. This is a supported state, not a broken one — the site ran that way
  in production before Supabase was linked.
- Postgres reachable but the write fails → logged as `AUTH ERROR` and sign-in
  still proceeds. Login gates nothing today, so blocking entry on a transient DB
  blip would be the worse failure. Revisit this when something actually depends
  on the row existing.
- `auth()` throwing in the root layout is caught and degrades to a signed-out
  nav, matching the `.catch(() => [])` discipline every Sheets fetch follows.

**Rendering**

The root layout resolves the session server-side and hands it to
`AuthProvider` / `SessionProvider` as the initial value, and passes
`isAuthConfigured` into `Nav` as `authEnabled`. This is the same no-flash rule
the language and theme providers follow: the first byte already shows the real
signed-in state, so the nav never paints "Sign in" and then swaps to an avatar.
Don't replace it with a client-side `useSession()` fetch on mount.

The layout is already per-request dynamic (see Rendering model), so reading the
session there costs nothing extra.

**Not built on purpose:** protected routes, middleware, gated content, roles.
The scope of this layer is "a user can sign in with Google and the app knows who
they are across requests".

### Schedule (community events)

A generic scheduled-events layer at `/schedule`, backed by Supabase Postgres
(user-generated dynamic data — NOT a Sheets tab; Sheets stays the editorial
CMS). This is deliberately a **shared, domain-agnostic primitive**: the planned
live-audio **satsang** sessions and the later **pandit-booking** feature are
both intended to be *kinds* of event on top of it. The `events.kind` column
(default `'gathering'`, not surfaced in UI) exists precisely so those become
new kinds, not new schemas. Keep audio/booking/pandit concepts out of this
layer.

**Tables** (`db/migrations/0002_create_events.sql`, RLS enabled with zero
policies on both — same PostgREST-exposure reasoning as `users`):

- `events` — `id` uuid pk · `owner_id` → `users.id` (the `accountId` from the
  session, **never** `session.user.id`/`googleId`) · `kind` · `title` ·
  `description` · `starts_at` timestamptz (the anchor occurrence) ·
  `duration_minutes` (informational) · `recurrence` (`none|daily|weekly`) ·
  `weekdays` smallint[] (0=Sunday…6=Saturday, weekly only) · `tz` (IANA) ·
  `status` (`scheduled|cancelled`) · timestamps.
- `event_interest` — `(event_id, user_id)` pk + `created_at`. The minimal
  "Interested" toggle + count; this is the attendee contract future features
  build on.

**Visibility model (v1):** the whole platform is one implicit community.
Reads are public (signed-out visitors see everything, with a sign-in nudge
where the create button would be); writes require sign-in. No community or
membership gating exists yet — that's a later layer.

**Recurrence & timezones:** the rule lives on the event row; upcoming
occurrences are computed at read time over a 60-day horizon
(`SCHEDULE_HORIZON_DAYS`) by the pure, unit-tested math in
`lib/occurrences.mjs` (`node scripts/test-occurrences.mjs`). Instance rows are
**never pre-generated**, and there is no per-instance editing — v1 edits/cancels
apply to the whole series. Recurring events are anchored to the wall-clock time
of the IANA zone they were created in (`tz`), so they track that zone's DST;
occurrences render in each viewer's local time (SSR pins Asia/Kolkata via a
useSyncExternalStore server snapshot, then swaps to the browser zone — see
`components/schedule/format.ts`), with an explicit timezone label on the
detail view.

**Files:** `lib/schedule.ts` (typed data access; reads degrade to empty on a
missing/unreachable DB, same discipline as Sheets fetches) ·
`lib/occurrences.mjs` (pure tz/recurrence math, .mjs so plain node can test it
and client code can share it) · `lib/ics.ts` ("Add to Calendar" export: single
VEVENT, RRULE for recurring; IANA TZID referenced without a VTIMEZONE block —
deliberate, revisit only if a real client rejects it) ·
`app/api/schedule/*` (Node runtime routes; `auth()`-guarded writes, ownership
enforced in SQL via `WHERE owner_id`; a session missing `accountId` gets a
`no_account` error the client renders as "try signing out and in again") ·
`app/schedule/*` + `components/schedule/*` (list + month calendar on the
shared Tabs primitive, create/edit form, detail view with Interested/ICS/
owner-only edit-cancel).

**Out of scope on purpose (v1):** notifications/reminders of any kind (ICS
export *is* the reminder story), per-instance recurrence edits, monthly/custom
RRULEs, community gating, event images.

**Event kinds live in `lib/event-kinds.ts`**, which must stay import-free.
`EVENT_KINDS` / `SATSANG_KIND` are needed as *runtime values* by client
components (the form's type toggle, the detail badge), and every other module
that could own them — `lib/schedule.ts`, `lib/satsang.ts` — reaches `lib/db.ts`
and therefore `pg`, which cannot be bundled for the browser. A value import
from either of those into a client component is a Turbopack build failure
(`Can't resolve 'dns'`); `tsc` and `next dev` will not catch it.

### Satsang (live audio sessions)

Phase 1 of the live-audio community feature: an event with `kind = 'satsang'`
can be taken **live** by its creator (the teacher), devotees join by audio in
the browser, and the teacher controls who is heard. **Circle form only** —
everyone who joins may speak; the teacher's authority is over mute.

Vendor is **LiveKit Cloud** (India South region confirmed), chosen in
`research/webrtc-vendor-eval-2026-08.md`. That memo's measured findings are
binding constraints, not suggestions — the four that shaped this code are
called out below. `spike/live-audio/` is the throwaway prototype it was
measured with; **nothing under `spike/` may be imported by the app.**

**Vendor isolation (a cost-control requirement from the owner, not a style
preference).** Two vendor-neutral contracts, one implementation each, and
exactly one selection point per side:

| File | Role |
|------|------|
| `lib/audio/audio-room.ts` | Client contract (`AudioRoom`): join/leave, self mute, teacher mute + mute-all + unmute-request, roster with active-speaker, autoplay recovery. **Imports no SDK.** |
| `lib/audio/livekit-room.ts` | The only place `livekit-client` may be imported. |
| `lib/audio/create-room.ts` | Client selection point; dynamically imports the adapter so the SDK only reaches browsers that actually join. |
| `lib/audio/admin.ts` | Server contract (`LiveAudioAdmin`): mint token, mute participant, mute all, close room. Plus `isLiveAudioConfigured` and `getLiveAudioAdmin()`. **Imports no SDK.** |
| `lib/audio/livekit-admin.ts` | The only place `livekit-server-sdk` may be imported. |

Swapping providers means rewriting the two `livekit-*` files and repointing the
two factories. `grep -rn "livekit" app/ lib/ components/` should only ever hit
`lib/audio/livekit-*.ts` (plus prose in comments) — treat a new hit as a bug.

Phase 2's **hall form** (stage/audience, raise hand) is anticipated rather than
designed away: `RoomParticipant.canSpeak` and `MintTokenInput.canSpeak` already
exist and vary per participant, so adding grant/revoke is additive.

**Schema (`db/migrations/0003_create_live_sessions.sql`)** — `live_sessions`,
RLS on with zero policies like 0001/0002. A row is one *run*, not the schedule:

- `id` uuid pk · `event_id` → `events.id` · `occurrence_starts_at` ·
  `room_name` (unique, `satsang-<id>`) · `started_by` → `users.id` ·
  `started_at` · `ended_at` (NULL = live).
- **Runs are rows, not columns on `events`,** because a recurring satsang goes
  live many times: columns could describe only one run, so every Start would
  overwrite the last and a client polling across a start/end boundary could not
  tell which room to join. A row per run also gives the room name something
  unguessable to derive from, so a second Start opens a genuinely fresh room
  instead of re-entering a name that may still hold lingering participants.
- A **partial unique index** (`WHERE ended_at IS NULL`) enforces at most one
  live run per event in the database, so two of the teacher's tabs both
  pressing Start cannot split the gathering in two. Start is idempotent.
- `occurrence_starts_at` is informational in v1 (the teacher may start any
  time; nothing ties a run to the timetable). It exists so per-occurrence
  attendance later has its join key already recorded.

**The Phase 0 constraints, and where each one lives**

- **Teacher mute is soft mute** (PRD FR-13 default, measured §3):
  `MutePublishedTrack` at the SFU stops the target without their cooperation
  but leaves them able to unmute themselves again. **No Lock mutes in Phase 1.**
  (Lock would mean revoking `canPublish`, i.e. demoting to audience — a hall
  form concept.)
- **Unmute is never a server command** — no vendor permits one (§3). The
  teacher's "ask to unmute" is a data-channel message; the target's client
  **auto-accepts if that user has already unmuted themselves this session**
  (they have granted mic access and shown intent to speak), otherwise it raises
  a one-tap consent prompt. Consent lives on the receiving client, by design.
- **Remote audio is registered with the MediaSession API** so Android Chrome
  classifies it as media playback. §5 measured playback dying on screen lock
  while the transport survived; this is the mitigation that memo asks to prove
  in the field, and the in-session UI also carries an explicit "keep the screen
  on" caveat rather than promising background listening.
- **Publish failures are silent at the SFU** (a timeout, not an error, §3), so
  no UI state is keyed off a publish result — the roster is rebuilt from the
  permission and mute state the provider reports.
- Join is **gesture-initiated** (autoplay policy) and nobody joins with their
  mic on; `playbackBlocked` surfaces an "enable audio" button when the browser
  refuses playback anyway.

**Lifecycle.** Teacher sees Start (any time) and, while live, End session for
all (confirmed). Others see a "hasn't started yet" state that flips to a Join
button when the teacher starts. Page state is **polled** (10s, paused when the
tab is hidden, stopped once joined — the room's own events are then the truth);
v1 adds no websocket infrastructure for page state on purpose. Reads are
public and joining requires sign-in, consistent with the schedule layer;
signed-out visitors see the live session exists and get a sign-in nudge.

**A teacher disconnecting does NOT end the session** — only the explicit End
action does. This is a deliberate deviation from the PRD's FR-15 two-minute
grace timer, which needs a scheduler this platform does not have. The failure
modes are asymmetric: a session left live degrades to an empty room the teacher
can end later, whereas a wrongly-expired one ejects a room full of devotees
mid-chant. Revisit in Phase 2.

**Files.** `lib/satsang.ts` (server-only data access; reads degrade to "not
live") · `lib/event-kinds.ts` (client-safe kind vocabulary — see the note in
the Schedule section) · `app/api/satsang/[id]/{state,start,end,token,control}`
(Node runtime; `auth()`-guarded, **teacher-only actions enforced server-side
against the event's `owner_id`**, never from a client claim; `guard.ts` holds
the shared guards) · `components/satsang/SatsangPanel.tsx` (lifecycle: poll,
start/end, gesture join) + `SessionRoom.tsx` (roster with teacher pinned top,
active-speaker ring, self mute, per-participant mute, mute all, ask-to-unmute).

Identity in the room is the signed-in user's **`accountId`** (our `users.id`) —
never `session.user.id`/`googleId`. Being stable per user also means a second
tab replaces the first join rather than doubling the roster.

**Degradation.** Missing `LIVEKIT_*` → `isLiveAudioConfigured` is false, the
event-type toggle disappears from the form and the live panel disappears from
the detail page; the schedule renders exactly as it did before this feature. A
DB or provider outage degrades to "not live" / a friendly message, never a
broken page.

**Out of scope on purpose:** hall form / stage-audience / raise hand, Lock
mutes, recording, reminders and push, community gating, per-occurrence
recurrence edits, native apps, payments.

### Pandit enquiries (the demand test)

A quiet enquiry form on the highest-intent puja pages, and nothing else. This
is `research/pandit-marketplace-prd-2026-08.md` §9.1's **demand test**: before
any marketplace is built, find out whether real booking demand exists. It is a
measuring instrument with a deliberate two-day budget, not the first slice of
a product — **no profiles, no listings, no matching, no reply path.** If the
answer comes back "no", the table, the route and the block are deleted and
nothing else has been spent.

**Placement is the experiment's design.** The site has no `/occasions/[slug]`
route, so the block rides on puja detail pages, chosen by a derived rule in
`lib/pandit-enquiry-placement.ts`:

> a puja carries the block when it is mapped to at least one life-event
> occasion **and** is not `frequent`.

The occasion mapping is what makes a puja something a family hires a pandit
for; `frequent=FALSE` excludes the daily and festival worship those same
occasions also list (Vinayaka Puja is mapped to seven occasions *and* is what
a family does at home on a Tuesday). Putting the block there would bury a
small signal under a large volume of unrelated traffic — the one measurement
error this test cannot afford. Against the current catalogue it selects five
pages: satyanarayana-puja, navagraha-puja, vastu-puja, gauri-puja,
kubera-puja. **Aksharabhyasam has no eligible page** (both its pujas are
frequent ones) — a known gap, not an oversight.

**Signing in is deliberately not required.** Every other write on this site
needs a session; this one must not, because a demand test gated behind Google
sign-in measures willingness to sign in rather than demand for a pandit, and
the number it produces is the whole deliverable. A session, when present, only
attributes the row (`user_id`) and prefills the contact field.

**Tone is bound by the PRD's §7.1 banned-patterns list**, which is a review
checklist, not a preference: no urgency, no countdown, no "limited", no count
of pandits, nothing implying anyone is waiting. One bordered card in the page
flow, below the procedure — no modal, no sticky bar, and the vidhi above it
stays complete and ungated. The card is collapsed to a heading and one button
until asked for. The confirmation says plainly that there is no list yet.

The **dakshina band** is the one field §7.2 bears on directly: the family
picks what *they* have in mind, the platform never quotes; the word is
dakshina, never price/fee/charges; figures are shagun-shaped (2,100 / 5,100 /
11,000 / 21,000), never round retail numbers; there is no "starting from"; and
nothing ranks, sorts or compares on it. "I would rather discuss it" is a
first-class answer. The bands are rupee amounts — an assumption about the
audience, not a fact about the platform. `city` is free text with no list and
no default for the same reason: where enquiries come from is part of what is
being measured, so nothing may prime a metro.

**Schema** (`db/migrations/0004_create_pandit_enquiries.sql` +
`0005_pandit_enquiry_details.sql`; RLS on with zero policies like 0001–0003).
Only ceremony, city and contact are required — a test that will not accept a
half-answered enquiry measures form-filling stamina. `ceremony_slug` (a puja
*or* occasion slug) xor `ceremony_other` free text; `source_puja_slug` records
which page earned the intent, which is the more useful of the two;
`timing_window` carries the case a date field cannot (`muhurtham-pending`) and
the one the §9.1 threshold turns on (`exploring` vs real intent).

**PRIVACY.** `contact` is personal data and lives only in Postgres: no page
reads this table, nothing is ever logged with the payload, and RLS is what
stops Supabase's public `anon` key reading it over PostgREST. `ip_hash` is a
salted SHA-256 (salt: `AUTH_SECRET`), never the address — it exists solely for
the rate limit. `area` and `note` are treated the same as `contact`. The full
note lives at the top of migration 0004; read it before adding any consumer.

**Abuse resistance is deliberately light** — a honeypot field and a per-hash
limit of 3 submissions/hour (`ENQUIRY_RATE_LIMIT`), counted in SQL so it works
across serverless instances. Neither is a security boundary; there is nothing
here worth attacking beyond wasting the owner's reading time.

**Files.** `lib/pandit-enquiry-fields.ts` (import-free client-safe vocabulary
— same constraint and reason as `lib/event-kinds.ts`) · `lib/pandit-enquiry.ts`
(server data access, validation, IP hashing) · `lib/pandit-enquiry-placement.ts`
(the placement rule and the ceremony catalogue; the route re-derives the
allowed slugs rather than trusting the client) · `app/api/pandit-enquiry/route.ts`
(Node runtime) · `components/pandit/PanditEnquiryBlock.tsx` ·
`scripts/list-pandit-enquiries.mjs` (read-only; `--summary` prints counts with
no personal data). **The read path is that script and only that script** —
there is no admin UI on purpose.

### scripts/ conventions

- `scripts/lib-sheets.mjs` is the shared helper module for one-off content scripts: `loadEnv()` (auto-loads `.env.local` relative to the script's own directory, so cwd doesn't matter), `getSheetsClient()` (memoized), `parseWriteFlag(argv)`, and `getTabWithHeaders(tab)` returning `{ headers, rows, col }`.
- **Dry-run by default**: scripts default to a dry run and only write to Sheets when passed `--write` on the CLI (via `parseWriteFlag`).
- **Header-name column lookup is the only sanctioned way to address a column** — use `col('some_header')` / `getTabWithHeaders`'s lookup, which throws loudly if the header is missing. Never hardcode a column index/letter.
- `scripts/archive/` holds retired one-off scripts (batch fixes, past migrations) kept for reference — don't build on top of them, and new one-off scripts that are fully spent should move there rather than staying in the active `scripts/` root.
- See `STOTRA_UPLOAD_PIPELINE.md` for the conventions specific to adding a new stotra/shloka's content end-to-end.
- **`scripts/check-content-health.mjs`** is the pre-deploy check: read-only (no `--write` mode), it verifies against the live Sheet that every tab's header row has the columns the app reads (hardcoded `EXPECTED_COLUMNS`, derived from the `rowTo*` mappers in `lib/relations.ts` — update it when a mapper changes), warns on 0 published rows for tabs that should never be empty (`gods`, `shlokas`, `pujas`, `festivals`, `vrathams`), and warns on `festivals`/`vrathams` `next_occurrence` values that aren't `YYYY-MM-DD`. Exits 1 only on a missing header; run it before "Publish to site".
- **`scripts/migrate.mjs`** applies `db/migrations/*.sql` to `DATABASE_URL`, tracking applied filenames in a `schema_migrations` table. Dry-run by default like the Sheets scripts; `--write` applies. Each migration runs in its own transaction. New schema changes go in a new numbered `.sql` file — never edit an already-applied one.
- **`scripts/list-pandit-enquiries.mjs`** is read-only (no `--write` mode, no UPDATE/DELETE anywhere in it): it prints demand-test enquiries newest-first (`--days N`, `--all`), and `--summary` prints counts only, with no personal data. Its plain output contains phone numbers and email addresses — see the Pandit enquiries section.
- **`scripts/report-translation-coverage.mjs`** is read-only (no `--write` mode): it auto-detects `*_en`/`_te`/`_ta`/`_hi` field groups from the live header row of each content tab and reports per-language fill rates against published rows; `--verbose` lists the slugs missing each language.

### Environment variables

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
SHEETS_SPREADSHEET_ID=
NEXT_PUBLIC_SITE_URL=
DRIVE_FOLDER_ID=

# Accounts / Auth (see that section for what each one is and where to get it)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
DATABASE_URL=

# Live audio (satsang) — LiveKit Cloud; see the Satsang section
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are the **OAuth client** credentials from Google Cloud Console — a different thing from `GOOGLE_SERVICE_ACCOUNT_KEY`, which is the read-only service account used for Sheets and Docs. The two are unrelated and must not be swapped.

Auth.js would pick up `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` by convention; `auth.ts` passes `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` explicitly instead, so those are the names to set.

`LIVEKIT_URL` (a `wss://` project endpoint) plus the API key/secret come from the LiveKit Cloud project — currently the same project the Phase 0 spike measured against. Missing any of the three turns live audio off entirely (see `isLiveAudioConfigured`): satsang event pages still render, without live-session controls.

All of these are optional in the sense that the app boots without them: missing any of the three auth values turns the sign-in UI off entirely (see `isAuthConfigured`), a missing `DATABASE_URL` lets sign-in work without persisting a row, and missing `LIVEKIT_*` leaves the schedule exactly as it was before satsang.

(`NEXT_PUBLIC_DEFAULT_LANGUAGE`, `NEXT_PUBLIC_SITE_NAME`, and `NEXT_PUBLIC_SHOW_TRANSLATION_BADGES` are no longer read anywhere in code — the translation-badge feature they supported was removed; don't reintroduce them without a real consumer.)

### Design tokens (Tailwind)

Warm stone palette: background `#FAF7F2`, surface `#F2EDE5`, accent gold `#B8860B`, accent saffron `#D4622A`. Fonts: Cormorant Garamond (display headings) + Noto Sans family (body + Telugu/Tamil/Devanagari scripts). Line heights: 1.8 Devanagari/Telugu, 1.9 Tamil, 1.6 Latin.

### Apps Script (in Google Sheets)

- "Publish to site" menu triggers Vercel deploy hook
- `validateTithis()` runs before every deploy — warns if a festival/vratham's `next_occurrence` date doesn't match the declared tithi in the panchangam tab
