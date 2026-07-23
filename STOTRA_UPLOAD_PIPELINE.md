# Stotra upload pipeline — shared context

This file exists so that multiple Claude Code threads can independently source and
upload stotra content to the `shloka_stanzas` Google Sheet tab, following the exact
same conventions. Read this before writing an upload script. Two fully-worked
examples already exist in the repo — read them first, they answer most "how do I..."
questions better than prose can:

- `scripts/upload-kala-bhairava-ashtakam.mjs` — 8-verse ashtakam, sourced from the
  web, cross-checked across 4 sites, 2 real discrepancies found and resolved.
- `scripts/upload-kanakadhara-stotram.mjs` — 21-verse stotram, sourced from the web,
  cross-checked across 5 sites, resolved a genuine 18-vs-21-verse structural
  question (3 inserted verses) by finding and verifying the inserted verses
  independently.

## What "done" looks like

One new file `scripts/upload-<slug>.mjs`, appended rows in `shloka_stanzas`,
verified rendering on the local dev server, committed and pushed to `main`.

## Step 1 — find the slug and expected count

Every stotra already has a metadata row in `scripts/populate-shlokas-metadata.mjs`.
Grep it for the slug to get the exact `title_en`, `deity_slug`, `stanza_count`, and
`source_text`/attribution. **`stanza_count` is a hard target** — your final row
count must match it exactly, or you must explain in the script's header comment
why it doesn't (see "Verse-count reconciliation" below). Never pad or trim to force
a match.

```bash
grep -n -A 14 "slug: '<slug>'," scripts/populate-shlokas-metadata.mjs
```

## Step 2 — source the text (if not already supplied)

No source text supplied means: find it yourself, using WebSearch/WebFetch.

**Never trust a single source.** Cross-check the Sanskrit (or Telugu, for
Telugu-original content) across at least 2-3 independent sites before finalizing
any wording. This session has repeatedly found real discrepancies between
sites — not just spelling-convention differences, but actual garbled/incorrect
words that don't parse as valid Sanskrit on one site while other sites agree on
the correct reading. When sources disagree:

1. Get 3+ opinions if 2 disagree.
2. Prefer the reading that (a) more sources agree on, and (b) actually parses as
   grammatically valid Sanskrit — a source with an isolated, ungrammatical variant
   is very likely an OCR/transcription slip, not a legitimate textual variant.
3. Note the resolution in the script's header comment: what disagreed, which
   sources said what, and why you picked the reading you did. Don't silently
   pick one source and move on — the reasoning should be auditable later.

Some sites request no reproduction of their specific formatted edition (e.g.
sanskritdocuments.org) even though the underlying ancient text is public domain —
respect that: use such sites for verification/cross-checking, not as your literal
copy source.

WebFetch's underlying summarizer sometimes paraphrases or truncates rather than
quoting verbatim (and occasionally refuses ancient public-domain scripture over
misapplied copyright caution). If you can't get a clean verbatim quote, that's
fine for spot-checking wording, but don't rely on it for meaning translations —
see Step 5.

## Step 3 — verse-count reconciliation

Many stotras exist in more than one commonly-published length: a "core" version
plus optional extra verses (an inserted block, a closing phala-shruti/benediction
verse, a dhyana preamble, etc.). Before transcribing everything:

- Figure out which "shape" you're looking at and whether the declared
  `stanza_count` implies the core-only version, or core-plus-something.
- The Kanakadhara case: 18-verse core + 3 inserted "namo'stu" verses = 21, matching
  the declared count exactly — so the 3 extra verses were included.
- The Kala Bhairava case: 8 core verses + 1 phala-shruti verse commonly appended =
  9, but the declared count was 8 — so the phala-shruti was excluded.
- If you genuinely can't reconcile a mismatch (count doesn't match under any
  reasonable interpretation), don't force it — flag it clearly in the script
  header and to the user, upload what you can verify, and say what's missing or
  extra. This mirrors how Vishnu Sahasranamam (108 of a declared 142, the rest
  being un-sourced phalashruti/dhyana verses) and Lalitha Sahasranamam (183 vs a
  metadata value of 182) were both handled — uploaded verified content, flagged
  the gap, did not fabricate to fill it.

## Step 4 — script structure

Follow the exact shape of the two example scripts:

- `import { google } from 'googleapis'`, `dotenv` config from `../.env.local`,
  `Sanscript` from `@indic-transliteration/sanscript`,
  `devanagariToTamilSuperscript` from `./lib-tamil-superscript.mjs`.
- `const WRITE = process.argv.includes('--write')` — defaults to dry run.
- Embed verses as data (array of `{ padas: [...], meaning: '...' }` objects, or
  a raw template-literal block parsed with a small state machine — whichever
  fits the source shape; see the two examples for both styles).
- **Devanagari is the field you hand-author/verify; Telugu, Tamil, and IAST are
  derived from it** via:
  - `Sanscript.t(pada, 'devanagari', 'telugu')` for Telugu.
  - `devanagariToTamilSuperscript(pada)` for Tamil (handles full sentences with
    spaces/punctuation fine — already validated this session).
  - `Sanscript.t(pada, 'devanagari', 'iast')` then `addMacrons()` for IAST — this
    site's convention is `e`→`ē`, `o`→`ō` applied to the whole IAST string
    (Sanskrit e/o are always long, so this is a safe global replace).
  - Exception: if your source directly supplies all four scripts already
    (verbatim, not something you're deriving), use them as given rather than
    re-deriving — see how `upload-lalitha-sahasranamam.mjs` and
    `upload-aditya-hridayam.mjs` handled that case earlier this session.
- **Verse-ending numeral convention**: `script_devanagari` keeps the traditional
  `॥N॥` marker (Devanagari numerals, via a small `toDevNumeral()` helper — see
  either example script). `script_telugu`, `script_tamil`, and `roman_iast` do
  NOT carry the numeral — only the pada text.
- **Pada-joining convention**: within one stanza row, join padas (lines) with a
  bare `|` character (`padas.join('|')`) — this is the sheet's own convention
  (`ShlokaViewer` splits on `|` and renders each pada as its own line). Danda
  punctuation (`।` after the half-verse, nothing after padas 1/3 in a 4-pada
  verse) goes inside the Devanagari pada text itself, not as a separate joiner.
- Known converter fixes already applied in `lib-tamil-superscript.mjs` (don't
  re-fix these, they're already handled): avagraha (`ऽ`) is dropped in Tamil
  output (no Tamil-script equivalent), and `ॐ` maps to literal `ஓம்`.
- Add a **structural self-check** at the top of the script that throws if the
  parsed verse count or pada-per-verse count doesn't match what you expect —
  every prior script does this and it catches real bugs before they reach the
  sheet.
- Before writing, query existing rows for the slug and refuse to append if any
  already exist (this pipeline only handles the pure-append/0-existing-rows
  case — see the `existingCount > 0` guard in both examples).

## Step 5 — meaning_en

If the source gives clean, complete, verbatim English translations, use them.
If not (very common — WebFetch's summarizer tends to paraphrase/truncate rather
than quote), **compose your own accurate translation per verse directly from the
verified Sanskrit**. This is a legitimate transformation of verified source text,
not fabrication — same as deriving IAST via Sanscript. Keep it to 1-3 sentences
per verse, accurate to the actual words, not a generic paraphrase.

If no meaning source exists and you're not confident enough in the Sanskrit to
translate it yourself, it is fine to leave `meaning_en` blank (see
`upload-lalitha-sahasranamam.mjs` and `upload-aditya-hridayam.mjs` — both left it
blank rather than fabricate) — but for a well-documented classical stotra, you
should usually be able to translate it accurately.

`meaning_en` renders as one continuous prose block on the site (not
pipe-split) — don't put `|` separators inside it.

## Step 6 — verify before writing

```bash
node scripts/upload-<slug>.mjs            # dry run — inspect the sample output
node scripts/upload-<slug>.mjs --write    # only after the dry run looks right
```

Then verify on the live dev server:

```bash
rm -rf .next   # Next/Turbopack cache goes stale after a Sheets write — always clear it
```

Use the `preview_*` tools (not Bash) to start the dev server, navigate to
`/shlokas/<slug>`, and confirm: content renders with no console errors, the
IAST view looks right, and clicking the Devanagari toggle button renders that
script correctly too (find it via `document.querySelectorAll('button')` and
match on text content — see prior scripts' verification steps for the exact
pattern).

## Step 7 — re-export the static stanza JSON

`app/shlokas/[slug]` and `app/vrathams/[slug]` read stanzas from static JSON
(`lib/data/stanzas/<slug>.json`, one file per shloka) via `lib/stanzas.ts`,
not live from Sheets — Sheets stays the authoring surface, but the built site
reads a build-time export instead of paying a Sheets API round trip (and the
`unstable_cache` 2MB limit) on every cold start. After `--write` has landed
your new rows in the `shloka_stanzas` tab, regenerate the JSON:

```bash
node scripts/export-shloka-stanzas.mjs
```

This is a **manual step, run once per upload** — deliberately not wired into
`prebuild` alongside `build-search-index.mjs`. Search-index rebuilds must
reflect every deploy because ordinary Sheets edits (status flips, typo fixes)
happen independently of code pushes; stanza content only changes when an
upload script runs, so tying the export to that event (rather than to every
build) avoids adding a live Sheets dependency to routine deploys and keeps the
static-JSON win intact. Commit the regenerated file(s) under
`lib/data/stanzas/` in the same commit as the upload script.

If you forget this step, `lib/stanzas.ts` still works — it falls back to a
live Sheets fetch for any slug missing a JSON file and logs a `CONTENT ERROR`
to the server console, so nothing breaks, but re-run the export before
merging so the site is not permanently relying on the fallback path.

## Step 8 — commit and push

Standard commit message, roughly: what was uploaded, how it was sourced/verified,
any notable discrepancy resolutions or flagged gaps. **Avoid apostrophes and
contractions in the commit message** — a heredoc gotcha (`git commit -m
"$(cat <<'EOF' ... EOF)"`) breaks on stray apostrophes; write "does not" not
"doesn't", "cannot" not "can't", etc.

**Never run `vercel` or deploy directly** — this is a hard rule from this repo's
CLAUDE.md. Push to `main` only; the user manages Vercel deploys from GitHub.

## Reference: fields in a `shloka_stanzas` row

```
shloka_slug, stanza_number, stanza_label, script_devanagari, script_telugu,
script_tamil, roman_iast, meaning_en, meaning_te, meaning_ta, meaning_hi, notes_en
```

Leave `meaning_te`/`meaning_ta`/`meaning_hi`/`notes_en` blank unless you have a
real source for them (the site falls back to `_en` with a translation badge in
staging). `stanza_label` is typically `` `Ślōka ${n}` `` unless you have a
verified reason to add more (e.g. a name-range, only when you can actually count
names accurately from a real source — see `upload-vishnu-sahasranamam.mjs`).
