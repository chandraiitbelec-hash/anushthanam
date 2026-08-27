-- Scheduled events — a generic, domain-agnostic primitive. The planned
-- live-audio satsang sessions and the later pandit-booking feature are both
-- intended to be *kinds* of event on top of this table (see `kind`), not new
-- tables. Nothing here knows about audio, booking, or pandits on purpose.
--
-- Recurrence is deliberately tiny: none | daily | weekly-on-selected-weekdays.
-- The rule lives on the row and upcoming occurrences are computed at read time
-- over a bounded horizon (lib/occurrences.mjs) — instance rows are never
-- pre-generated, and edits always apply to the whole series.

CREATE TABLE IF NOT EXISTS events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Future event kinds (satsang session, pandit appointment, …) slot in here
  -- without a schema change. Not surfaced in any UI yet.
  kind             text NOT NULL DEFAULT 'gathering',
  title            text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description      text CHECK (description IS NULL OR char_length(description) <= 5000),
  -- The first (anchor) occurrence. For recurring events, later occurrences
  -- repeat at the same wall-clock time in `tz`, so they track that zone's DST.
  starts_at        timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 1 AND 1440),
  recurrence       text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly')),
  -- Weekdays for weekly recurrence, 0=Sunday … 6=Saturday (matches JS getDay()).
  weekdays         smallint[] NOT NULL DEFAULT '{}'
                     CHECK (weekdays <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  -- IANA zone the event was created in — the anchor for recurring wall-clock
  -- times. Occurrences render in each viewer's local time; this is what "7pm
  -- every Tuesday" is 7pm *in*.
  tz               text NOT NULL DEFAULT 'Asia/Kolkata',
  status           text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (recurrence <> 'weekly' OR cardinality(weekdays) > 0)
);

-- The schedule page lists scheduled events ordered by start; owner lookups
-- back the owner-only edit/cancel paths.
CREATE INDEX IF NOT EXISTS events_status_starts_at_idx ON events (status, starts_at);
CREATE INDEX IF NOT EXISTS events_owner_idx ON events (owner_id);

-- Minimal "Interested" join — the attendee contract future features build on.
-- One row per (event, user); toggling off deletes the row.
CREATE TABLE IF NOT EXISTS event_interest (
  event_id   uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_interest_user_idx ON event_interest (user_id);

-- Same reasoning as 0001: Supabase exposes every `public` table over PostgREST
-- to the `anon` role, whose key is public by design. RLS with zero policies
-- denies all of that; the app connects as the table owner, which bypasses RLS.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interest ENABLE ROW LEVEL SECURITY;
