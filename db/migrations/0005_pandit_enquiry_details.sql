-- Adds the rest of what a family actually has to tell someone before a pandit
-- can be found for them: where exactly, how long, what time, how fixed the
-- date is, and what dakshina they have in mind.
--
-- A separate migration rather than an edit to 0004 because 0004 is already
-- applied — see the scripts/ conventions in CLAUDE.md. Every column here is
-- nullable and optional in the form: only ceremony, city and contact are
-- required, because a demand test that will not accept a half-answered
-- enquiry measures form-filling stamina rather than demand.
--
-- The PRIVACY note at the top of 0004 covers these columns too. `area` in
-- particular narrows a person's location and is treated exactly like
-- `contact`: Postgres only, never rendered, never logged.

ALTER TABLE pandit_enquiries
  -- Neighbourhood / locality within the city. Free text for the same reason
  -- `city` is: no list, no default, nothing that presumes a country.
  ADD COLUMN IF NOT EXISTS area text
    CHECK (area IS NULL OR char_length(area) BETWEEN 1 AND 120),

  -- Time of day, paired with the existing `preferred_date`. Separate from the
  -- date rather than one timestamptz: a family that knows "sometime that
  -- morning" should be able to say the date without inventing a clock time,
  -- and a muhurtham time carries no timezone of its own — it is wall-clock in
  -- the place the ceremony happens, which `city` names.
  ADD COLUMN IF NOT EXISTS preferred_time time,

  -- Expected length, as a band. Bands rather than a number because almost
  -- nobody knows the minutes, and a band is what a pandit needs to judge
  -- whether he can take it.
  ADD COLUMN IF NOT EXISTS duration_band text
    CHECK (duration_band IS NULL OR duration_band IN
      ('upto-1h', '1-2h', '2-4h', 'half-day', 'full-day', 'multi-day')),

  -- How settled the date is. 'muhurtham-pending' is the common Indian case
  -- that a plain date field cannot express — the family knows the ceremony is
  -- happening but the auspicious time has not been fixed yet — and
  -- 'exploring' is the answer that separates real booking intent from
  -- browsing, which is the distinction §9.1's threshold turns on.
  ADD COLUMN IF NOT EXISTS timing_window text
    CHECK (timing_window IS NULL OR timing_window IN
      ('date-fixed', 'muhurtham-pending', 'within-month', 'within-3-months', 'exploring')),

  -- Dakshina the family has in mind, as a band they choose for themselves.
  --
  -- This is the one field the PRD's §7.2 guardrails bear on directly, so:
  -- it is the family stating what they can offer, never the platform quoting
  -- a price. The word is dakshina, not price/fee/charges. The figures are
  -- shagun-shaped (2,100 / 5,100 / 11,000 / 21,000), never round retail
  -- numbers. There is no "starting from", no cheapest-first, and nothing on
  -- this site will ever rank or compare pandits on it. 'discuss' is a
  -- first-class answer, not a fallback.
  ADD COLUMN IF NOT EXISTS dakshina_band text
    CHECK (dakshina_band IS NULL OR dakshina_band IN
      ('upto-2100', '2100-5100', '5100-11000', '11000-21000', 'above-21000', 'discuss'));
