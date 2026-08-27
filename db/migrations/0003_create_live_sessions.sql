-- Live audio (satsang) sessions — the runtime state behind an event whose
-- `kind` is 'satsang'. The event row stays the *schedule*; this table is the
-- *runs*.
--
-- Why a table and not columns on `events`:
--
--   A recurring satsang goes live many times. Live/ended state as columns could
--   only describe one run, so every Start would overwrite the last — losing the
--   history and, worse, making "which room am I joining?" ambiguous for a client
--   that polled across a start/end boundary. A row per run gives each run its
--   own identity, which is exactly what the audio room name needs to be derived
--   from: a second Start on the same event produces a genuinely fresh room
--   rather than re-entering a name that may still hold lingering participants at
--   the SFU.
--
--   `occurrence_starts_at` records *which* scheduled occurrence a run belongs to
--   (the anchor for a one-off, the nearest computed occurrence for a recurring
--   series — occurrence instants are never stored as rows, see
--   lib/occurrences.mjs). It is informational for v1: the teacher may start a
--   session at any time, and nothing enforces a relationship between the run and
--   the timetable. It exists so a later feature (attendance per occurrence, "you
--   missed Tuesday") has the join key already recorded rather than having to
--   reconstruct it.
--
-- Vendor neutrality: `room_name` is an opaque string this app generates and the
-- audio provider merely accepts. No LiveKit-specific column exists here, so
-- swapping providers does not touch this schema.

CREATE TABLE IF NOT EXISTS live_sessions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  -- Which scheduled occurrence this run belongs to (see header note).
  occurrence_starts_at timestamptz NOT NULL,
  -- Opaque room identifier handed to the audio provider. Derived from this
  -- row's id, so it is unguessable and unique per run.
  room_name            text NOT NULL UNIQUE,
  -- The teacher who started it. Always the event's owner in v1 (enforced in
  -- the route handlers), kept as its own column because co-teachers are a
  -- plausible Phase 2 and the row should record who actually pressed Start.
  started_by           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at           timestamptz NOT NULL DEFAULT now(),
  -- NULL means live. Set by the teacher's explicit "End session for all";
  -- a teacher merely disconnecting does NOT end the session in v1 (deliberate
  -- deviation from PRD FR-15's 2-minute grace timer — no timer infrastructure
  -- exists yet, and a stale-live row degrades to an empty room, whereas a
  -- wrongly-ended one kicks a room full of devotees).
  ended_at             timestamptz
);

-- At most one live run per event, enforced by the database rather than by a
-- read-then-write race in the application: two teachers' tabs both pressing
-- Start must not create two rooms for one event.
CREATE UNIQUE INDEX IF NOT EXISTS live_sessions_one_live_per_event_idx
  ON live_sessions (event_id) WHERE ended_at IS NULL;

-- The event page's state poll reads the newest run for an event on every tick.
CREATE INDEX IF NOT EXISTS live_sessions_event_started_at_idx
  ON live_sessions (event_id, started_at DESC);

-- Same reasoning as 0001/0002: Supabase exposes every `public` table over
-- PostgREST to the `anon` role, whose key is public by design. RLS with zero
-- policies denies all of that; the app connects as the table owner, which
-- bypasses RLS.
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
