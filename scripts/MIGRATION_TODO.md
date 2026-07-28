# Remaining scripts to migrate onto lib-sheets.mjs

`lib-sheets.mjs` (loadEnv, getSheetsClient, SPREADSHEET_ID, parseWriteFlag,
colLetter, getTabWithHeaders) now exists and 13 scripts have been migrated
onto it as the reference pattern:

- upload-puja-detail.mjs (also migrated off positional pujas columns)
- upload-puja-notes.mjs
- upload-puja-notes-localization.mjs
- upload-entity-notes.mjs
- upload-vratham-notes.mjs
- upload-festival-entity-notes.mjs
- upload-vratham-entity-notes.mjs
- fetch-stanzas-groupB.mjs (also migrated off positional shloka_stanzas columns)
- fix-shiva-tandava-missing-meanings.mjs (also migrated off positional column)
- fix-misc-data-bugs.mjs
- setup-puja-occasions.mjs
- update-upcoming-dates-2026.mjs (also standardized --apply → --write)
- verify-panchangam.mjs

The scripts below still hand-roll the dotenv + GoogleAuth + sheets client
(+ often their own colLetter) boilerplate that lib-sheets.mjs now
centralizes. None of them are broken — this is a "nice to have" cleanup, not
a correctness fix — so they were left alone rather than churned wholesale.
Migrate opportunistically the next time one of these is touched for a real
content change:

## Generic, reusable uploaders (SLUG-driven — still the right tool for new content)
upload-kavacham.mjs, upload-sahasranamam.mjs, upload-puja-content.mjs

## Reusable / periodic tools
seed-panchangam.mjs, add-localized-quantity-notes-columns.mjs,
backfill-quantity-localization.mjs

## Not applicable
build-search-index.mjs (prebuild script run via npm's `prebuild` hook, not
a Sheets-writer to migrate), publishToSite.gs (Apps Script, runs inside
Sheets, not Node).

---

The single-entity stotra/puja uploaders, targeted `update-*`/`fix-*`/`patch-*`
corrections, `generate-*-kavacham.mjs` sourcing generators, spent
read/diagnostic scripts, and Python content-prep one-offs that used to be
listed here have all been run against the live Sheet and moved to
`scripts/archive/` — see `scripts/archive/README.md` (section 3) for the
full list and rationale.
