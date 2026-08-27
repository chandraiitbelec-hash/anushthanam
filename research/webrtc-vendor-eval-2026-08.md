# Anushthanam — WebRTC Vendor Evaluation for Live Audio Satsang (August 2026)

Phase 0 spike per the satsang PRD's rollout plan (NFR-1: buy, not build). Hands-on
evaluation of **LiveKit Cloud** via a throwaway prototype (`spike/live-audio/`), with
**100ms, Agora, Zoom Video SDK, and Jitsi/JaaS** compared on paper (official
pricing/docs pages fetched 2026-08-27; every number cites its source; unverifiable
numbers are flagged as such). Live testing ran 2026-08-27 against a real LiveKit
Cloud project from an India network.

Framing already decided before this eval: v1 will be **web** (this platform is a
Next.js PWA) — a deliberate deviation from the PRD's mobile-app-first framing — so
vendors are judged through a browser-SDK lens, with Android Chrome as the primary
mobile target. The audio vendor must be **swappable** (owner requirement, cost
control); the prototype demonstrates this with a vendor-neutral `AudioRoom`
TypeScript interface implemented once for LiveKit.

> **STATUS: hands-on testing complete.** Headline finding beyond the vendor call:
> Android Chrome does **not** keep playing room audio on screen lock or app switch
> (§5) — the connection survives, the playback doesn't. The mobile-web listening
> story needs the MediaSession mitigation proven in the field test, or a native
> wrapper later.

---

## 1. Recommendation

**LiveKit Cloud.** The hands-on test confirmed everything the paper eval promised:

- Publish permission is enforced **at the SFU, by default** — a client with its
  local permission check deliberately bypassed still could not get a track into the
  room (§3). NFR-6 holds with no extra configuration.
- Stage grant/revoke applies **live, without reconnect**, and propagated to every
  connected client in the same millisecond (§3).
- India is real: our localhost clients were routed to LiveKit's **"India South"
  region (Hyderabad node)** automatically — the join-time numbers in §4 are
  India-region numbers.
- Cheapest at scale (~$16 per 500-listener hour vs ~$30 for 100ms/Agora and
  ~$105 for Zoom), and the **only managed vendor with a self-hosting escape hatch**
  (Apache-2.0 server, same protocol — switching is config, not code), which is the
  strongest possible backstop for the modularity/cost requirement.

Runners-up, and why not:

- **100ms** — closest feature fit (first-class raise-hand, India data residency,
  role templates) but the company's own homepage now says it is "building AI Agents
  for healthcare operations at 100ms.ai"; blog silent since Sep 2024; no funding
  since 2022. The SDK still ships releases, but that trajectory is the wrong bet
  for a multi-year community feature.
- **Agora** — viable and battle-tested, but SFU-enforced audience-no-publish is an
  **opt-in** console setting plus token discipline (not the default posture), docs
  are fragmented across current/legacy sites, and Shanghai-origin jurisdiction
  optics are a real perception risk for an India devotional product.
- **Zoom Video SDK** — eliminated on cost and fit: no audio-only rate (a listener
  bills like a video publisher → ~$105 per 500-listener hour, ~7× LiveKit), the
  server-side moderation endpoints (`audio.block`, `user.remove`) require a
  support ticket to enable, raise-hand must ride a command channel rate-limited to
  2 messages/sec **per session** (unusable with a 500-person audience), and its
  pricing is mid-migration to a prepaid-credits model with conflicting free-tier
  info.
- **Jitsi/JaaS** — the genuine budget floor (self-host ~$20–30/mo server rent;
  JaaS free ≤25 MAU then $99/mo) with real bridge-level force-mute (verified in
  source, not just docs). But a custom audio-room UI means building on
  lib-jitsi-meet against thin docs (the iframe/React SDKs embed the stock meeting
  UI), JaaS caps rooms at exactly 500 participants (zero headroom for our target),
  and Jitsi's broadcast-scale "visitors" mode has **no stage-promotion mechanism
  yet** — which is precisely our raise-hand flow. Keep it on file as cost-escape
  option #2 behind LiveKit self-hosting, not as the primary.

The riskiest open questions to settle in a field test are in §8.

## 2. What was tested and how

The prototype (`spike/live-audio/`) is a self-contained mini-app: a ~170-line Node
server (token minting + teacher controls through LiveKit's server API, so mute and
stage changes are enforced at the SFU per NFR-6) and a browser client where all
vendor calls sit behind `client/audio-room.ts` — a thin interface covering exactly
what our app needs: join/leave, publish-permission grant/revoke (stage/audience),
mute/unmute self, teacher mute others / mute all, consent-gated unmute requests,
raise hand, active-speaker events, participant list. `client/main.ts` (the UI)
imports zero vendor types; swapping vendors means reimplementing one file
(`livekit-room.ts`, ~240 lines).

Live test setup: three simultaneous browser contexts (teacher + two listeners)
against LiveKit Cloud from an India network, driven for ~15 minutes through the
full teacher/listener flow. One environment caveat: the test harness browser
blocks `getUserMedia`, so publishing used synthetic oscillator tracks pushed
through the real SFU publish path (`publishTrack` with a WebAudio
MediaStreamTrack). This exercises identical signaling/permission/media machinery —
only actual mic capture (a well-trodden path) was substituted. The Android phone
test (§5) uses a real mic-capable browser.

## 3. Does the PRD's stage/audience permission model hold up? — YES, measured

- **NFR-6 verified at the SFU.** An audience listener's token carries no publish
  grant. With the client SDK's local permission check deliberately patched out,
  the forced `publishTrack` request went to the server and was **never answered**
  — the SDK timed out after 10s ("publication of local track timed out, no
  response from server"), and the server's participant list confirmed
  `tracks: none` for that participant. A compromised client cannot transmit.
  Note the failure mode is a **silent ignore**, not an explicit error — product
  UI must key off permission state, not publish errors.
- **Stage promote is fast and reconnect-free.** Teacher click → our server →
  LiveKit `updateParticipant`: **396ms** HTTP round-trip; the
  `ParticipantPermissionsChanged` event landed on the promoted listener's client
  and every other client **in the same millisecond** — before the teacher's own
  HTTP response returned. After promotion, the listener's mic published in
  **84ms** (vs. the 10s rejection timeout pre-promotion).
- **Demote force-unpublishes at the SFU.** Sending a *live-publishing* speaker
  back to the audience revoked `canPublish` everywhere in the same millisecond and
  the server killed the track mid-stream (participant list: `tracks: none`) — no
  client cooperation involved.
- **PRD surprise #1 — "Unmute all" cannot be a command, on any vendor.** LiveKit's
  API refused a server-initiated unmute outright (`remote unmute not enabled` —
  Cloud default, deliberate). 100ms models remote unmute as a request the client
  accepts; Agora and Zoom likewise; Jitsi's AV moderation is approve-to-unmute.
  The spike implements it as a data-channel *unmute request* the target client
  honors (delivered and acted on in <1s); production can auto-accept or prompt —
  a product choice, and consistent with the PRD's own soft-mute philosophy.
- **PRD surprise #2 — the mute matrix maps onto two different primitives, cleanly.**
  Server-side `MutePublishedTrack` (teacher hard-mute: **643ms** round-trip;
  mute-all across the room: **720ms**) is *reversible by the student* — the muted
  client's self-unmute succeeded instantly. That is exactly the PRD's FR-13
  **soft mute** default. The PRD's **Lock mutes** maps to revoking `canPublish`
  (demote to audience) — meaning a locked-muted "stage" member is, at the
  transport level, an audience member. UI can present it either way; the data
  model shouldn't pretend otherwise.
- **Raise hand** rides participant attributes: propagated to the teacher's list
  (with raised-hands-first ordering) in well under a second. Minor event noise
  observed: an attribute change also fires a redundant permissions-changed event
  with unchanged values — harmless, worth knowing.
- **Incidental resilience finding:** restarting our app server mid-session did
  not drop the room — clients hold their connection to LiveKit, not to us. Only
  token minting/teacher endpoints blip during a deploy.

## 4. Join time and latency — measured, India region

Four joins measured end-to-end (button click → connected), localhost app server,
LiveKit **India South (Hyderabad)** edge, real Cloud project:

| Join | Time | Notes |
|---|---|---|
| 1st (room creation) | 1735ms | includes LiveKit room provisioning |
| 2nd | 817ms | token mint 8ms |
| 3rd | 558ms | token mint 6ms |
| 4th (rejoin) | 1165ms | after teacher page reload |

All four are comfortably inside NFR-2's <3s p90 — on a good network. Token minting
is negligible (6–53ms). Media flow verified via WebRTC stats on a listener:
**~99 kbps inbound** for one speaker (LiveKit enables RED audio redundancy by
default — roughly 3× a bare 32 kbps Opus stream; see cost note in §6), jitter 3ms.

What this environment **cannot** establish, regardless of results:

- **Mobile-network reality.** All clients sat on one machine on home broadband.
  4G jitter/loss behavior, Opus concealment quality, reconnect-with-state-restore
  under churn (FR-9), and p90 join on Jio/Airtel are field-test questions.
- **Perceived mouth-to-ear latency** — not measurable with synthetic tones on one
  machine; needs two humans on real networks.
- **Scale.** Three participants say nothing about client-side behavior (list
  renders, event volume) at 500.
- A follow-up field test needs: 2–3 real users in India on Jio/Airtel 4G (at
  least one mid-range Android), a 30–60 min session, join-time and
  disconnect/reconnect counts from the event log, and one walk-out-of-wifi test.

## 5. Mobile browser reality check

This materially shapes the PWA-vs-native question later.

- **Android Chrome (our primary target): MEASURED — audio does NOT survive screen
  lock or app-switch on the test device.** Real Android phone over LAN, listener
  role: playback stopped within moments of locking the screen, and likewise when
  switching to another app. The common "Android Chrome keeps WebRTC audio playing
  in the background" assumption is **false as tested** — this finding alone
  justifies the spike. Crucially, the *transport survived*: the participant
  remained ACTIVE in LiveKit's server-side list throughout, and on unlock the
  audio **resumed instantly with no user action** — so Chrome suspends the
  playback pipeline (WebRTC-fed audio elements are not treated as background
  "media" the way a music site's `<audio>` is), not the connection. That points at
  playback-layer mitigations to trial in the field test rather than a vendor
  problem: register the remote audio with the **MediaSession API** so Chrome
  classifies it as media playback (the standard audio-room workaround), a screen
  wake lock as a stopgap, or accept screen-on listening for web v1. Caveat: one
  device, one OEM — Android battery managers (Samsung/Xiaomi/OnePlus) vary wildly,
  so the field test needs a device spread. **Product consequence: the PRD's
  mobile-app-first instinct now has measured justification on Android too, not
  just iOS. Web v1 remains viable for the join/permission model, but
  background listening needs either the MediaSession mitigation proven or an
  explicit "keep the screen on" caveat until a native wrapper exists.**
- **iOS Safari: known-bad, and no vendor fixes it.** WebKit suspends WebRTC/Web
  Audio on screen lock or backgrounding (WebKit bug 231105; Apple developer forum
  thread 774239 requesting background WebRTC for exactly this "live audio spaces"
  use case). LiveKit has an open issue (client-sdk-js #1751) on backgrounded-tab
  audio; Agora's docs say they "do not recommend" their Web SDK on iOS Safari;
  100ms documents several iOS Safari audio quirks; Zoom documents nothing on
  backgrounding. **Consequence: a web v1 serves iPhone users only with the screen
  on.** If iOS listeners matter, that argues for the PRD's native-app framing (or
  an explicit iOS caveat in product copy) — all five vendors are equally hostage
  to WebKit.
- Autoplay policies (both platforms): audio playback needs a user gesture; the
  spike joins via a button press and surfaces an "enable audio" recovery button
  when blocked. Any production join flow must be gesture-initiated.

## 6. Cost model

60-minute audio-only session, 1 teacher + N listeners, list prices fetched
2026-08-27. Marginal per-session cost; platform fees noted inline.

| Concurrent listeners | LiveKit Cloud | 100ms | Agora | Zoom Video SDK | JaaS (8x8) | Jitsi self-host |
|---|---|---|---|---|---|---|
| 5 | **$0.19** (free tier absorbs ~13/mo) | **$0.36** (~27/mo free) | **$0.36** (~27/mo free) | **$1.26** | $0 marginal — free ≤25 MAU | $0 marginal |
| 50 | **$1.62** (free tier: ~1.6/mo; ≤100 concurrent OK) | **$3.06** (~3/mo free) | **$3.03** (~3/mo free) | **$10.71** | $0 marginal — **$99/mo** plan (≤300 MAU) | $0 marginal |
| 500 | **~$15.90** + **$50/mo** Ship plan (free tier caps at 100 concurrent; Ship's included minutes cover ~4.9 such sessions) | **$30.06** | **$29.76** | **$105.21** (≈ the entire ₹10,000/mo base credit plan) | **$499/mo** plan (≤1,500 MAU) and sits **exactly at the 500/room hard cap** | $0 marginal — **~$20–80/mo** servers + ops |

Basis. **LiveKit:** participant-minutes ($0.0005/min Ship overage) + downstream GB
($0.12/GB). Measured caveat: LiveKit's default RED redundancy put one speaker at
~99 kbps, ~3× the 32 kbps assumed in the bandwidth term — worst case that term
triples (N=500: ~$0.86 → ~$2.60), still <15% of session cost; participant-minutes
dominate. **100ms:** $0.004/min conferencing with a stated 75% audio-only discount
→ $0.001/participant-min (discount mechanics unverified on the pricing page).
**Agora:** $0.99/1,000 interactive audio participant-minutes; the advertised $0.59
rate is the broadcast (CDN-latency) audience product, which can't do instant
raise-hand promotion. **Zoom:** ₹0.31/min ≈ $0.0035/participant-min, **no audio-only
rate**; new prepaid "Build Platform" credits (₹10,000/mo base); free tier in flux
(legacy 10,000 min/mo vs new "20 free credits" ≈ 64 minutes — conflicting official
copy, unverified). **JaaS:** billed per **monthly active user**, not minutes — a
stable community ≤300 uniques/month is $99/mo flat regardless of session count;
churny audiences break the model ($0.99/extra MAU). **Jitsi self-host:** Apache-2.0;
a 4-vCPU Mumbai VPS (~$20–30/mo) trivially serves 50 concurrent audio; 500 needs
your own load test (no published audio-only benchmark) and you own
Prosody/Jicofo/JVB/TURN/monitoring.

**Recording (fast-follow, for completeness):** LiveKit audio-only egress ≈
$0.30/hr; 100ms $0.81/hr; Agora $0.089/hr; Zoom ₹0.82/min (~$0.56/hr) + storage;
JaaS $0.01/min ($0.60/hr); self-hosted Jitsi needs a dedicated Jibri VM (a full
Chrome instance per concurrent recording, ~8GB RAM — comically heavy for audio).
All negligible except Jibri's ops shape.

**Self-hosting escape hatch (the modularity axis).** Only two vendors have one:

- **LiveKit** — Apache-2.0 server speaking the same protocol as Cloud ("switch
  without changing a line of code"); their own benchmark: one 16-core node
  sustains 10 publishers + 3,000 audio-only subscribers at ~80% CPU. Self-hosting
  trades the ~$15/big-session participant-minute fee for owning TURN, TLS,
  monitoring, failover (OSS pins a room to one node — fine for single-region
  India usage). At low volume the $50/mo Ship plan is far cheaper than the ops
  burden; the hatch is also negotiation leverage even if never pulled.
- **Jitsi** — fully open-source (nothing withheld), bridge-enforced force-mute
  included; the tax is lib-jitsi-meet's thin docs for custom UIs and the missing
  stage-promotion path at broadcast scale.
- **100ms, Agora, Zoom: none.** Exit from any of them = rewrite one adapter file
  behind our `AudioRoom` interface (which this spike proves is a real boundary).

## 7. Vendor comparison beyond price

| | LiveKit Cloud | 100ms | Agora | Zoom Video SDK | Jitsi / JaaS |
|---|---|---|---|---|---|
| Publish-permission enforcement | **Server-side by default** — verified live (§3) | Role/template-based, server-verified | Opt-in ("co-host token auth" toggle + token discipline); default is client-cooperative | JWT `role_type` + REST `audio.block`/`user.remove` — but moderation endpoints **require a support ticket to enable** | JWT moderator role + AV moderation; **bridge-level force-mute verified in source** (JVB drops audio from force-muted endpoints) |
| Live permission change w/o reconnect | Yes — measured: event on all clients same-ms, 396ms API round-trip | Yes (role change API, single + bulk) | Role switch + new token from our server | Host/manager promote; consent-based unmute | Approve-to-unmute flow; "visitors" mode has **no promotion mechanism yet** (WIP) |
| India presence | **Confirmed live: routed to India South (Hyderabad)**; Mumbai PoP too | Data residency incl. India media servers | SD-RTN PoPs incl. India; `AREA_CODE_IN` geofence | Mumbai + Hyderabad DCs; JWT `geo_regions: IN` preference (not a residency guarantee) | JaaS: Mumbai DC, routes to nearest; self-host: wherever we rent |
| Browser SDK | livekit-client v2.22, weekly releases, Apache-2.0; web first-class | Actively released; web first-class; documented iOS Safari quirks | Mature but **vendor discourages iOS Safari**; docs split current/legacy, official links 404 | Hybrid WASM/WebRTC (mobile browsers always WebRTC audio); Android Firefox unsupported; actively released | iframe/React SDK = stock meeting UI; custom UI = lib-jitsi-meet, thin docs, app-layer features to re-implement |
| Raise hand | Participant attributes (this spike) — trivial, <1s propagation | **First-class SDK API** | Build-your-own via RTM signaling | Command channel, **2 msgs/sec per session cap** — route via own backend at scale | First-class in Jitsi Meet app; re-implement on lib-jitsi-meet |
| Room size | 100 free tier / 1,000 Ship / 5,000 Scale | 2,500 standard, 20k "large rooms" | Thousands (broadcast product beyond) | 1,000 default, self-service to 5,000 | **JaaS hard cap 500/room**; self-host untested at 500 audio |
| Recording later | Audio-only room egress to own storage | Composite, India-region storage | Cloud recording, cheapest | Cloud recording + BYOS | Jibri (1 Chrome VM per recording) / JaaS $0.01/min |
| Vendor viability | Well-funded, OSS moat, shipping fast | **Red flag: pivoted to healthcare AI agents (own homepage); blog silent since Sep 2024** | Public co (NASDAQ: API); Shanghai-origin optics risk for India | Public co, stable; pricing model mid-migration | OSS backed by 8x8; healthy community |
| Exit story | **Apache-2.0 self-host, same protocol** | Adapter rewrite only | Adapter rewrite only | Adapter rewrite only; plan migration already forces new accounts | **Fully OSS** — strongest exit, weakest managed offering |

## 8. Riskiest things to validate in a real-network field test (before Phase 1)

1. **India-region join time and audio latency on Jio/Airtel 4G** against NFR-2
   (<3s p90 join, <400ms p90 e2e). Localhost joins hit 0.6–1.7s against the
   Hyderabad edge, which is encouraging but not mobile reality.
2. **The MediaSession mitigation for Android background audio.** Screen-lock
   playback measurably dies today (§5). Build the MediaSession-registered audio
   path, then re-test: screen lock, app switch, a full 60-min session under
   Doze/battery-saver, an incoming phone call (PRD edge case 3) — across at least
   Samsung + Xiaomi + stock Android. If MediaSession doesn't rescue it, the
   PWA-vs-native decision is effectively made for background listening.
3. **Reconnect quality under real mobile-network churn** (walking between wifi
   and 4G) — does LiveKit's resume restore publish permission and mute state, or
   does state drift (FR-9)? The permission model held perfectly on a stable
   network; churn is where it would crack.
4. **Stage promote/demote under jitter** — permission renegotiation while packets
   drop is where audible glitches would live; localhost cannot produce this.
5. **iOS reality decision** — field-confirm the WebKit screen-lock suspension on
   actual devotee-demographic devices, then make the explicit product call:
   accept "screen must stay on" for iPhone web users in v1, or move iOS to the
   native-app track. This gates PWA-vs-native and should not be decided by default.

## Appendix: sources

- LiveKit pricing/quotas: livekit.com/pricing (+ /pricing.md), kb.livekit.io
  "Understanding LiveKit Cloud pricing", docs.livekit.io/home/cloud/quotas-and-limits/
- LiveKit regions: docs.livekit.io/deploy/admin/regions/endpoints/
- LiveKit permissions: docs.livekit.io/home/server/managing-participants/
- LiveKit self-host benchmark: docs.livekit.io/home/self-hosting/benchmark/
- iOS background audio: bugs.webkit.org/show_bug.cgi?id=231105,
  developer.apple.com/forums/thread/774239, github.com/livekit/client-sdk-js/issues/1751
- 100ms: 100ms.live/pricing, /docs (templates-and-roles, large-rooms, known-issues,
  workspaces), github.com/100mslive/web-sdks/releases, 100ms.live homepage (pivot),
  tracxn.com profile (funding)
- Agora: docs.agora.io voice-calling + interactive-live-streaming pricing,
  browser_support FAQ, geofencing docs, channel-management ban-rules API,
  investor.agora.io corporate profile; Stanford Internet Observatory Clubhouse
  coverage (thenewsminute.com, scmp.com, 2021)
- Zoom Video SDK: zoom.us/pricing/developer (+ ?showRate=true rate card, INR),
  developers.zoom.us/blog/video-sdk-fact-sheet/, docs (auth `geo_regions` /
  `role_type`, browser-support, audio, command-channel), Video SDK OpenAPI spec
  (audio.block / user.remove), devforum.zoom.us threads (billing, session caps,
  recording add-on)
- Jitsi/JaaS: cpaas.8x8.com JaaS pricing, developer.8x8.com/jaas FAQ + JWT docs,
  jitsi.github.io/handbook (requirements, scalable, browsers, lib-jitsi-meet),
  github.com/jitsi (extra-large-conference README, jitsi-videobridge force-mute
  commit, jicofo Colibri2Session), jitsi.org bridge-cascading blog, github.com/jitsi/jibri
- Live measurements: this spike, 2026-08-27, LiveKit Cloud project
  `anushthanam-spike`, India South (Hyderabad) region, livekit-client 2.22.1 /
  livekit-server-sdk 2.18.0 / SFU 1.13.5.
