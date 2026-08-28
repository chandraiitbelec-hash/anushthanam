-- Generalises how a demand-test enquiry records where it came from.
--
-- 0004 assumed one entry point: a block at the foot of a booking-intent puja
-- detail page, so "where it came from" and "which puja page" were the same
-- fact and `source_puja_slug` held both. That assumption is now wrong. The
-- block was too hidden to measure anything (five pages, below the fold), so
-- the enquiry form is also reachable from a standalone page and from the
-- occasion accordion on /pujas.
--
-- SOURCE ATTRIBUTION IS THE POINT OF THE TEST. §9.1 does not just ask "are
-- there enquiries" — it asks which content earns booking intent, because that
-- is what tells the owner where the demand actually lives. An entry point
-- whose enquiries are indistinguishable from another's has measured nothing.
-- So every entry point gets its own value here, and the route validates the
-- shape rather than trusting whatever the client posts.
--
-- A separate migration rather than an edit to 0004/0005, which are applied.
--
-- The vocabulary (mirrored in lib/pandit-enquiry-fields.ts, which is the
-- authority the route validates against):
--
--   'puja:<slug>'            the card on that puja's detail page
--   'pujas-occasion:<slug>'  the link in that occasion's panel on /pujas
--   'standalone'             /find-a-pandit reached any other way (nav, a
--                            shared link, search)
--
-- `source_puja_slug` is NOT redundant with 'puja:<slug>' and is kept: it means
-- "the puja detail page whose content this enquiry came off", which is the
-- §9.1 content question, while `source` means "the control the visitor used",
-- which is the discovery question. They coincide today because there is one
-- control per puja page. It becomes nullable because the two new entry points
-- have no puja page behind them at all.

ALTER TABLE pandit_enquiries
  ADD COLUMN IF NOT EXISTS source text;

-- Every pre-existing row came from a puja page — that was the only entry point
-- that existed — so its source is exactly that.
UPDATE pandit_enquiries
   SET source = 'puja:' || source_puja_slug
 WHERE source IS NULL;

ALTER TABLE pandit_enquiries
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN source_puja_slug DROP NOT NULL,
  -- Long enough for the longest prefix plus a 100-char slug, which is the
  -- limit 0004 already puts on every slug column here.
  ADD CONSTRAINT pandit_enquiries_source_len
    CHECK (char_length(source) BETWEEN 1 AND 140);

-- Segmenting by entry point is the read this column exists for
-- (scripts/list-pandit-enquiries.mjs --summary).
CREATE INDEX IF NOT EXISTS pandit_enquiries_source_idx
  ON pandit_enquiries (source);
