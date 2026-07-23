# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Anushthanam** (alt: anushthana, anushtanam, anusthanam, anustanam) — a Hindu devotion reference site covering gods (devatas), shlokas, stotras, pujas, festivals, vrathams, and panchangam. Serves Telugu, Tamil, Hindi, and English speakers. No e-commerce, no user accounts in Phase 1.

GitHub: https://github.com/chandraiitbelec-hash/anushthanam

## Stack

- **Frontend:** Next.js 16.2.9 (App Router), React 19.2.4, TypeScript, Tailwind CSS. Builds run on Turbopack (Next 16's default build engine — no opt-in config needed).
- **CMS:** Google Sheets (structured data) + Google Docs (legacy long-form prose) + a Sheets tab (`stories_content`) for current story bodies
- **Search:** Client-side Fuse.js over `public/search-index.json` (built at `prebuild` time, before `next build`)
- **Deployment:** Vercel with static generation + ISR (`revalidate = 3600`) + manual deploy hook triggered from Sheets Apps Script
  - **NEVER run `vercel` or deploy to Vercel directly.** Always push to GitHub; the user manages Vercel from there.

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # prebuild writes search-index.json, then next build
npm run lint         # eslint . (flat config, eslint.config.mjs)
```

## Architecture

### Rendering model

The root layout (`app/layout.tsx`) does **not** read `cookies()` — it is fully static and can be prerendered/ISR'd rather than forced into per-request dynamic rendering. Almost every route builds as static (`○`) or SSG-via-`generateStaticParams` (`●`) with `revalidate: 1h` / `expire: 1y`; there are no dynamic (`ƒ`) routes.

Language and theme are seeded **client-side, pre-paint**, not from server cookies:
- Two `beforeInteractive` inline `<Script>` tags at the top of `<body>` (`lang-init`, `theme-init`) read the `anushthanam-lang` / `anushthanam-theme` cookies via `document.cookie`, falling back to `localStorage`, and set `document.documentElement.lang` / `data-theme` before first paint.
- `LanguageProvider` / `ThemeProvider` then pick up that DOM state via lazy `useState` initializers on mount.
- (The scripts live directly under `<body>`, not `<html>`, to avoid React 19's "`<html>` cannot contain nested `<script>`" warning.)

### Data flow

```
Google Sheets / Docs
  → Sheets API v4 / Docs API (read-only service account)
  → Next.js build (generateStaticParams + fetch at build time, unstable_cache at runtime)
  → Static HTML + public/search-index.json on Vercel CDN, revalidated hourly via ISR
```

Publishing is intentional: a "Publish to site" menu in Apps Script triggers the Vercel deploy hook. ISR handles near-live updates between full deploys.

### Data-cache layer (`lib/sheets.ts`)

- `getSheetRows(tab)` wraps the raw Sheets fetch in `unstable_cache(..., { revalidate: 3600 })` — each tab is cached separately for 1 hour, shared across all pages in the same build/runtime. An in-flight `Map` sits in front of it to coalesce concurrent requests for the same tab before they even reach the cache.
- `getPublished(tab)` filters `getSheetRows(tab)` to `status === 'published'`.
- **`shloka_stanzas` is special-cased** (`getSheetRowsLarge`): this tab is large enough (~4MB) to exceed `unstable_cache`'s ~2MB payload limit, which would otherwise throw and silently refetch the whole tab on every request. Instead it's memoized in an in-process `Map` with a manual TTL matching the normal revalidate window, bypassing `unstable_cache` entirely. Callers slice the full tab down per-slug themselves.

### Key lib files

| File | Purpose |
|------|---------|
| `lib/sheets.ts` | `getSheetRows()` / `getSheetRowsLarge()` / `getPublished()` — reads from Google Sheets via service account, with the caching behavior above |
| `lib/docs.ts` | `getStoryBody()` (Docs API, still used when a story has `gdoc_id_{lang}` set) and `getStoryBodyFromSheet()` (reads `stories_content` tab) — see Stories below. `getStoryBodiesBatched()` exists but is currently unused (no callers) |
| `lib/types.ts` | All entity types |
| `lib/relations.ts` | Cross-entity resolution (god_links, linked slugs, occasion↔puja resolution) |
| `lib/search-index.ts` | `buildSearchIndex()` helper — the actual build-time index writer is `scripts/build-search-index.mjs` (see Search index below), which does not import this file |
| `lib/panchangam.ts` | Reads the panchangam tab, exposes today's and date-specific data |
| `lib/ui-strings.ts` | Centralized UI-string dictionary — see Language / translation pattern below |
| `lib/gita.ts` + `lib/data/bhagavad-gita.json` | Static-JSON Bhagavad Gita section — see below |
| `lib/daily-devotional.ts` + `lib/data/daily-devotional.json` | Rotating daily devotional pick, static JSON, no Sheets dependency |
| `context/LanguageContext.tsx` | Active language (`en`/`te`/`ta`/`hi`) stored in context + localStorage/cookie |

### Status model

Every entity has `status`: `draft` | `review` | `published`. Only `published` rows are fetched by `getPublished()`. Nothing outside `published` appears on the site or in the search index.

### Language / translation pattern

The old `t(record, field, lang)` helper and `TranslationBadge` component have been **removed** (not present in the app anymore). Current pattern:

- Per-entity content still has `field_en`, `field_te`, `field_ta`, `field_hi` columns; components fall back inline: `field_${lang} || field_en`.
- All UI chrome strings (labels, nav, breadcrumbs, buttons — not entity content) are centralized in `lib/ui-strings.ts`: a typed `UiStrings` shape (~90 keys, some as functions like `partOf(n, total)`) with a hand-written table per language (`UI.en`, `UI.te`, `UI.ta`, `UI.hi`). Add new UI copy here, not as inline literals or ad hoc per-component label maps.
- `scriptClass(lang)` (`lib/utils.ts`) maps a language to its native-script CSS class (`te→script-telugu`, `ta→script-tamil`, `hi→script-devanagari`, `en→''`) for correct font/line-height rendering.
- There is no translation-coverage tooling checked in currently; if one gets added it should be read-only (report, not mutate).

### Shloka stanza convention

Line breaks within a stanza are encoded as `|` in Sheets cells (not actual newlines). `ShlokaViewer` splits on `|` to render separate lines. Columns: `script_devanagari`, `script_telugu`, `script_tamil`, `roman_iast`, `meaning_en/te/ta/hi`.

### Stories

Published story bodies are read from the `stories_content` tab (`story_slug, lang, paragraph_num, text`) via `getStoryBodyFromSheet()` in `lib/docs.ts`, sorted by `paragraph_num`.

`gdoc_id_en/te/ta/hi` on `stories_index` is **not** dead — it's still a live per-language override: `app/stories/[slug]/page.tsx` uses the Docs API (`getStoryBody`) for a given language when that story's `gdoc_id_{lang}` is populated, and falls back to `stories_content` otherwise (including for `en`). Migrating a story into `stories_content` means clearing its `gdoc_id_{lang}` values (see `scripts/upload-stories-content.mjs`) so the fallback path takes over.

`getStoryBodiesBatched()` (200ms-throttled batch fetch) still exists in `lib/docs.ts` but has no current callers — treat as dead code unless you're reviving batched Docs fetching.

### Search index

Built by `scripts/build-search-index.mjs`, run via the `prebuild` npm script before every `next build` (not by `lib/search-index.ts`, which is an unused library-level duplicate of the same logic). Covers gods, festivals, vrathams, shloka titles — not puja or story body text. Fuse.js threshold: 0.35 (intentionally loose for phonetic deity name variants).

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

### scripts/ conventions

- `scripts/lib-sheets.mjs` is the shared helper module for one-off content scripts: `loadEnv()` (auto-loads `.env.local` relative to the script's own directory, so cwd doesn't matter), `getSheetsClient()` (memoized), `parseWriteFlag(argv)`, and `getTabWithHeaders(tab)` returning `{ headers, rows, col }`.
- **Dry-run by default**: scripts default to a dry run and only write to Sheets when passed `--write` on the CLI (via `parseWriteFlag`).
- **Header-name column lookup is the only sanctioned way to address a column** — use `col('some_header')` / `getTabWithHeaders`'s lookup, which throws loudly if the header is missing. Never hardcode a column index/letter.
- `scripts/archive/` holds retired one-off scripts (batch fixes, past migrations) kept for reference — don't build on top of them, and new one-off scripts that are fully spent should move there rather than staying in the active `scripts/` root.
- See `STOTRA_UPLOAD_PIPELINE.md` for the conventions specific to adding a new stotra/shloka's content end-to-end.

### Environment variables

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
SHEETS_SPREADSHEET_ID=
NEXT_PUBLIC_SITE_URL=
DRIVE_FOLDER_ID=
```

(`NEXT_PUBLIC_DEFAULT_LANGUAGE`, `NEXT_PUBLIC_SITE_NAME`, and `NEXT_PUBLIC_SHOW_TRANSLATION_BADGES` are no longer read anywhere in code — the translation-badge feature they supported was removed; don't reintroduce them without a real consumer.)

### Design tokens (Tailwind)

Warm stone palette: background `#FAF7F2`, surface `#F2EDE5`, accent gold `#B8860B`, accent saffron `#D4622A`. Fonts: Cormorant Garamond (display headings) + Noto Sans family (body + Telugu/Tamil/Devanagari scripts). Line heights: 1.8 Devanagari/Telugu, 1.9 Tamil, 1.6 Latin.

### Apps Script (in Google Sheets)

- "Publish to site" menu triggers Vercel deploy hook
- `validateTithis()` runs before every deploy — warns if a festival/vratham's `next_occurrence` date doesn't match the declared tithi in the panchangam tab
