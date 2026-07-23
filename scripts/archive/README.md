# Archived scripts

Everything in this directory is **spent** — it did the one job it was written
for, and that job is done. Nothing here should be run again in the ordinary
course of work. Two kinds of script ended up here:

## 1. Destructive delete-then-append content fixes

`fix-kathas-batch4a/4b/4c.mjs`, `fix-kathas-batch5a/5b.mjs`,
`fix-kathas-batch6a/6b/6c.mjs`, `fix-stories-batch1/2/3.mjs`,
`fix-satyanarayana.mjs`.

Each of these hard-codes a batch of corrected katha/story paragraphs, deletes
the existing `stories_content` rows for those (slug, lang) pairs via
`deleteDimension`, then appends the corrected rows. **Re-running one of these
would silently overwrite whatever is in the Sheet today with the stale
paragraph text baked into the script**, even if the content has since been
edited or re-translated by hand. They all default to a dry run (pass
`--write` to apply) as a safety net, but the content itself is what makes
them one-shot: there's no "re-run to update" story here, only "re-run to
regress."

If a similar correction is needed again, write a new script with fresh
content — don't resurrect one of these.

## 2. One-off seed scripts

`populate-gods.mjs`, `populate-ashtothrams.mjs`, `populate-festivals.mjs`,
`populate-festival-details.mjs`, `populate-missing-vrathams.mjs`,
`populate-more-content.mjs`, `populate-shlokas-metadata.mjs`,
`populate-stories.mjs`, `populate-vratham-details.mjs`,
`populate-vratham-kathas.mjs`, `populate-vrathams.mjs`.

These seeded the initial `gods`, `shlokas`, `festivals`, `vrathams`, and
`stories_index`/`stories_content` tabs from hard-coded data or local
markdown/JSON files (some of which no longer exist on disk, e.g.
`~/Downloads/deity_ashtothrams.md`). The tabs they populate are live and have
since been edited directly in Sheets, so re-running them risks duplicate rows
or clobbering hand-edited content with the original seed data.

## Why archived instead of deleted

Kept for reference — to see what content originally shipped, or as a
starting template if a genuinely new batch-content script is needed later.
None of them are wired into any reusable tooling (`setup-*`, `upload-*`,
`verify-*`, `seed-panchangam`, `lib-*` in `scripts/` proper are the ones still
safe to run).

Note: these scripts' `.env.local` path resolution was updated from
`../.env.local` to `../../.env.local` when they moved into this
subdirectory — that's the only change made after archiving.
