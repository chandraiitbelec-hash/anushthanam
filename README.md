# Anushthanam

A Hindu devotion reference site covering gods (devatas), shlokas, stotras, pujas, festivals, vrathams, and panchangam — for Telugu, Tamil, Hindi, and English speakers. No e-commerce, no user accounts.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, statically generated and deployed on Vercel with ISR.

## Prerequisites

- Node.js and npm
- A Google Cloud service account with **read-only** access to the project's Google Sheet (and Docs, for legacy story content)
- The service account's JSON key
- The Sheet must be **shared with the service account's email** (found in the key JSON as `client_email`) as at least Viewer — otherwise Sheets API calls will fail with a permission error

## Setup

```bash
npm install
```

Create `.env.local` at the repo root with the following variables (see `CLAUDE.md` for full details on what each one gates):

```env
GOOGLE_SERVICE_ACCOUNT_KEY=
SHEETS_SPREADSHEET_ID=
NEXT_PUBLIC_SITE_URL=
DRIVE_FOLDER_ID=
```

- `GOOGLE_SERVICE_ACCOUNT_KEY` — the full service-account JSON key, as a single-line string
- `SHEETS_SPREADSHEET_ID` — the ID of the Google Sheet (from its URL), shared with the service account as above
- `NEXT_PUBLIC_SITE_URL` — the site's canonical public URL, used for SEO/sitemap generation
- `DRIVE_FOLDER_ID` — Drive folder ID used for content assets

Never commit `.env.local` or paste real values into commits, issues, or chat.

## Commands

```bash
npm run dev     # local dev server at http://localhost:3000
npm run build   # prebuild writes public/search-index.json, then next build (static generation)
npm run lint    # eslint .
```

`npm run build` needs valid Sheets credentials to fetch content; without them locally it still succeeds but with an empty search index (see `CLAUDE.md`). On Vercel/CI, missing credentials fail the build intentionally.

## Where content lives

All structured content (gods, shlokas, pujas, festivals, vrathams, panchangam, etc.) lives in **Google Sheets**, read at build/runtime through `lib/sheets.ts`. Each tab has a `status` column (`draft` / `review` / `published`) — only `published` rows ever reach the site. Long-form story prose lives in the `stories_content` Sheets tab, with a legacy per-language Google Docs override still supported for a subset of stories.

Publishing from Sheets to the live site is done via the "Publish to site" menu in the spreadsheet's Apps Script, which triggers a Vercel deploy hook.

**Never run `vercel` or deploy directly from this machine** — always push to GitHub; the user manages Vercel deploys from there.

See [CLAUDE.md](CLAUDE.md) for the full architecture (rendering model, caching layer, tab schemas, translation pattern, scripts conventions) and [STOTRA_UPLOAD_PIPELINE.md](STOTRA_UPLOAD_PIPELINE.md) for the workflow used to add a new stotra/shloka's content end-to-end.
