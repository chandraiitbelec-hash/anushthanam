# live-audio spike (throwaway)

Phase 0 vendor-eval prototype for the satsang live-audio PRD. **Not a product.**
Self-contained: own `package.json`, nothing here is imported by the production
app, and nothing in `app/` may import from here. Findings live in
`research/webrtc-vendor-eval-2026-08.md`.

What it proves: one room, unguessable link, teacher/listener roles chosen on
entry, stage/audience via SFU-enforced publish permission (PRD NFR-6), teacher
hard-mute / mute-all, consent-gated unmute requests, raise hand, active-speaker
indication, participant list, join-time measurement.

The client is split so vendor swap-ability is demonstrated, not just claimed:

- `client/audio-room.ts` — the vendor-agnostic interface (no vendor imports).
- `client/livekit-room.ts` — the only file allowed to import `livekit-client`.
- `client/main.ts` — UI; talks only to the interface.
- `server.mjs` — token minting + teacher controls via LiveKit's server API
  (secrets stay here; teacher endpoints require a per-boot admin key).

## One-time setup: LiveKit Cloud (manual, ~5 minutes)

1. Go to https://cloud.livekit.io and sign up (GitHub or Google SSO is fine).
   The free tier needs no credit card.
2. Create a project — name it something like `anushthanam-spike`. If asked to
   pick a region, choose the India/Asia option if offered (Cloud otherwise
   routes to the nearest edge automatically).
3. In the project dashboard, copy the **Project URL** (looks like
   `wss://anushthanam-spike-xxxxxxx.livekit.cloud`).
4. Go to **Settings → Keys** (or "API Keys"), create a key, and copy the
   **API Key** (`API...`) and **API Secret** (shown once — copy it now).
5. In this directory: `cp .env.example .env.local` and paste the three values
   into `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
   `.env.local` is gitignored; never commit these.

## Run

```
npm install
npm start
```

The server prints an unguessable room link (`/r/satsang-<hex>`). Open it in
multiple browser windows/profiles (normal + incognito + a second browser) to
simulate participants. Join one as `teacher`, the rest as `listener`.
Set `SPIKE_ROOM` in `.env.local` to keep the link stable across restarts.

### Testing from a phone on the same wifi

The server also prints a LAN URL. Listening works over plain http (WebRTC
playback needs no secure context); **publishing** (mic) from a non-localhost
http origin does not, so on the phone either stay a listener, or enable
`chrome://flags/#unsafely-treat-insecure-origin-as-secure` for the LAN origin.

### Experiments worth running (what the memo reports on)

- Audience listener taps "Unmute myself" → must be rejected by the SFU (NFR-6).
- Teacher hard-mutes someone → check latency in the event log; then can the
  muted student unmute themselves? (expected yes = the PRD's "soft mute").
- Server-initiated remote *unmute* (expected to be refused by the SFU —
  consent-gated): `curl -X POST localhost:3111/api/teacher/mute -H 'x-admin-key: <key>' -d '{"identity":"...","muted":false}'`.
- Android Chrome: join as listener, lock the screen → does audio keep playing?
