# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Anushthanam** (alt: anushthana, anushtanam, anusthanam, anustanam) — a Hindu devotion reference site covering gods (devatas), shlokas, stotras, pujas, festivals, vrathams, and panchangam. Serves Telugu, Tamil, Hindi, and English speakers. No e-commerce, no user accounts in Phase 1.

GitHub: https://github.com/chandraiitbelec-hash/anushthanam

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **CMS:** Google Sheets (structured data) + Google Docs (long prose/kathas)
- **Search:** Client-side Fuse.js over `public/search-index.json` (built at build time)
- **Deployment:** Vercel with ISR (`revalidate = 3600`) + manual deploy hook triggered from Sheets Apps Script
  - **NEVER run `vercel` or deploy to Vercel directly.** Always push to GitHub; the user manages Vercel from there.

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # production build (also writes search-index.json)
npm run lint
```

## Architecture

### Data flow

```
Google Sheets / Docs
  → Sheets API v4 / Docs API (read-only service account)
  → Next.js build (generateStaticParams + fetch at build time)
  → Static HTML + public/search-index.json on Vercel CDN
```

Publishing is intentional: a "Publish to site" menu in Apps Script triggers the Vercel deploy hook. ISR handles near-live updates between full deploys.

### Key lib files

| File | Purpose |
|------|---------|
| `lib/sheets.ts` | `getSheetRows()`, `getPublished()` — reads from Google Sheets via service account |
| `lib/docs.ts` | `getStoryBody()`, `getStoryBodiesBatched()` — fetches story paragraphs from Docs API with 200ms throttle between calls |
| `lib/types.ts` | All entity types |
| `lib/relations.ts` | Cross-entity resolution (god_links, linked slugs) |
| `lib/search-index.ts` | `buildSearchIndex()` — writes `public/search-index.json` at build time |
| `lib/panchangam.ts` | Reads the panchangam tab, exposes today's and date-specific data |
| `context/LanguageContext.tsx` | Active language (`en`/`te`/`ta`/`hi`) stored in context + localStorage |

### Status model

Every entity has `status`: `draft` | `review` | `published`. Only `published` rows are fetched by `getPublished()`. Nothing outside `published` appears on the site or in the search index.

### Language / translation pattern

- Every entity has `field_en`, `field_te`, `field_ta`, `field_hi` columns
- `t(record, field, lang)` in `lib/utils.ts` returns the value for the requested language, falling back to `_en` with `isFallback: true`
- `TranslationBadge` only renders when `NEXT_PUBLIC_SHOW_TRANSLATION_BADGES=true` (staging only)

### Shloka stanza convention

Line breaks within a stanza are encoded as `|` in Sheets cells (not actual newlines). `ShlokaViewer` splits on `|` to render separate lines. Columns: `script_devanagari`, `script_telugu`, `script_tamil`, `roman_iast`, `meaning_en/te/ta/hi`.

### Search index

Covers gods, festivals, vrathams, shloka titles — not puja or story body text. Written to `public/search-index.json` at build time. Fuse.js threshold: 0.35 (intentionally loose for phonetic deity name variants).

### Google Sheets tabs

`gods`, `shlokas`, `shloka_stanzas`, `pujas`, `festivals`, `vrathams`, `stories_index`, `god_links`, `procedure_steps`, `material_items`, `panchangam`, `tags`, `config`, `occasions`, `puja_occasions`

`god_links` is the join table for all deity↔entity relationships — never add cross-links directly to entity tabs.

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

Run `node scripts/setup-puja-occasions.mjs --write` to add the `frequent` column, backfill the 4 starter pujas, and create the `occasions` + `puja_occasions` tabs in Sheets.

### Environment variables

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
SHEETS_SPREADSHEET_ID=
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SITE_NAME=anushthanam
NEXT_PUBLIC_SHOW_TRANSLATION_BADGES=false
```

### Design tokens (Tailwind)

Warm stone palette: background `#FAF7F2`, surface `#F2EDE5`, accent gold `#B8860B`, accent saffron `#D4622A`. Fonts: Cormorant Garamond (display headings) + Noto Sans family (body + Telugu/Tamil/Devanagari scripts). Line heights: 1.8 Devanagari/Telugu, 1.9 Tamil, 1.6 Latin.

### Apps Script (in Google Sheets)

- "Publish to site" menu triggers Vercel deploy hook
- `validateTithis()` runs before every deploy — warns if a festival/vratham's `next_occurrence` date doesn't match the declared tithi in the panchangam tab
