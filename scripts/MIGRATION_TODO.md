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

The remaining scripts below still hand-roll the dotenv + GoogleAuth + sheets
client (+ often their own colLetter) boilerplate that lib-sheets.mjs now
centralizes. None of them are broken — this is a "nice to have" cleanup, not
a correctness fix — so they were left alone rather than churned wholesale.
Migrate opportunistically the next time one of these is touched for a real
content change:

## `upload-*` — single-entity content uploaders (same boilerplate shape)
upload-aditya-hridayam.mjs, upload-bhairava-ashtothram.mjs,
upload-brahma-ashtothram.mjs, upload-devi-aparadha-kshama-stotram.mjs,
upload-durga-chalisa.mjs, upload-ganesh-chalisa.mjs,
upload-govinda-ashtakam.mjs, upload-govinda-namalu.mjs,
upload-hanuman-chalisa.mjs, upload-harivarasanam.mjs,
upload-indra-ashtothram.mjs, upload-kala-bhairava-ashtakam.mjs,
upload-kali-ashtothram.mjs, upload-kanakadhara-stotram.mjs,
upload-kavacham.mjs, upload-krishna-chalisa.mjs,
upload-kubera-ashtothram.mjs, upload-lakshmi-chalisa.mjs,
upload-lalitha-sahasranamam.mjs, upload-mahishasura-mardini-stotram.mjs,
upload-murugan-suprabhatam.mjs, upload-narasimha-pancharatnam.mjs,
upload-occasions-seed.mjs, upload-puja-content.mjs,
upload-puja-detail-gauri.mjs, upload-puja-detail-kubera.mjs,
upload-puja-detail-navagraha.mjs, upload-puja-detail-vastu.mjs,
upload-puja-occasions-seed.mjs, upload-pujas-seed.mjs,
upload-radha-ashtothram.mjs, upload-rama-raksha-stotram.mjs,
upload-sahasranamam.mjs, upload-sai-chalisa.mjs, upload-shani-chalisa.mjs,
upload-shiv-chalisa.mjs, upload-shiva-panchakshara-stotram.mjs,
upload-shiva-tandava-stotram.mjs, upload-sita-ashtothram.mjs,
upload-soundarya-lahari.mjs, upload-starter-pujas.mjs,
upload-subrahmanya-bhujangam.mjs, upload-venkateswara-suprabhatam.mjs,
upload-vishnu-sahasranamam.mjs

## `update-*` / `fix-*` / `patch-*` — targeted corrections
update-ayyappa-kavacham-meanings.mjs, update-kanda-sashti-kavasam-meanings.mjs,
update-rama-kavacham-meanings.mjs, update-sahasranamam-meanings.mjs,
update-stanza-translations-groupA.mjs, update-stanza-translations-groupB.mjs,
update-stanza-translations-groupC.mjs, fix-govinda-namalu-typos.mjs,
fix-missing-occurrence-dates.mjs, fix-narasimha-ashtothram.mjs,
fix-narasimha-ashtothram-v2.mjs, patch-ayyappa-english-meanings.mjs,
patch-ayyappa-hindi-meanings.mjs, patch-ayyappa-telugu-meanings.mjs,
repair-shlokas-metadata.mjs, cleanup-internal-flag-notes.mjs,
localize-notes-batch2.mjs

## `generate-*` — kavacham/stotra generators that also write to Sheets
generate-ayyappa-kavacham.mjs, generate-devi-kavacham.mjs,
generate-kanda-sashti-kavasam.mjs, generate-rama-kavacham.mjs,
generate-sudarshana-kavacham.mjs

## Misc read/utility scripts
check-festivals-coverage.mjs, read-festival-notes.mjs,
read-stanzas-groupA.mjs, derive-ganesha.mjs, seed-panchangam.mjs,
add-localized-quantity-notes-columns.mjs, backfill-quantity-localization.mjs,
build-search-index.mjs, parse-bhagavad-gita.mjs, parse-daily-devotional.mjs

## Shared libs (not scripts themselves — check whether they duplicate
## lib-sheets.mjs functionality before touching)
lib-ashtothram-generator.mjs, lib-ashtothram-uploader.mjs,
lib-parse-chalisa-md.mjs, lib-tamil-superscript.mjs

## Not applicable
compute-panchangam.py, extract-all-sahasranamams.py,
extract-vratham-content.py, generate-meanings.py, merge-meanings.py,
generate-stanza-translations-groupB.py, patch-devi-kavacham-meanings.py
(Python, no Sheets client to migrate), publishToSite.gs (Apps Script, runs
inside Sheets, not Node), vratham-content.json (data file).
