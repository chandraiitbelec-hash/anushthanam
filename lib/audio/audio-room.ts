/**
 * Vendor-agnostic contract for what the app needs from a live-audio provider,
 * client side. **This file must not import any vendor SDK**, and no vendor type
 * may appear anywhere outside `lib/audio/livekit-room.ts` (client) and
 * `lib/audio/livekit-admin.ts` (server). That boundary is a cost-control
 * requirement, not a style preference: switching providers must mean rewriting
 * those two files, not auditing the UI.
 *
 * Phase 1 implements **circle form** only — everyone who joins may speak, and
 * the teacher's authority is over *mute* state. The hall form of Phase 2
 * (stage/audience, raise hand) is anticipated by `canSpeak` on
 * RoomParticipant and by leaving grant/revoke out rather than designing it
 * away: adding `bringToStage`/`sendToAudience` and a `handRaised` field later
 * is additive. Nothing here assumes everyone can always speak.
 */

/** A participant's authority in the room, not their identity on the site. */
export type RoomRole = 'teacher' | 'participant';

export type RoomParticipant = {
  /**
   * Provider-side identity string. Opaque here, but the app mints it as the
   * signed-in user's `accountId` so it is stable and FK-safe (see
   * lib/audio/admin.ts).
   */
  id: string;
  name: string;
  avatarUrl: string | null;
  role: RoomRole;
  isLocal: boolean;
  /**
   * Holds publish permission at the SFU. Always true in circle form; the
   * field exists so hall form can render an audience without a shape change.
   */
  canSpeak: boolean;
  /** Publishing an unmuted audio track right now. */
  micEnabled: boolean;
  speaking: boolean;
};

export type RoomConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

/** Why the room ended for this client — drives which message the UI shows. */
export type RoomEndReason = 'left' | 'ended-by-teacher' | 'lost';

export type AudioRoomEvents = {
  /** Full roster snapshot; fires on any roster or state change. */
  participants: (list: RoomParticipant[]) => void;
  connection: (state: RoomConnectionState) => void;
  closed: (reason: RoomEndReason) => void;
  /**
   * The teacher asked this client to unmute and the client did NOT auto-accept
   * (see `AudioRoom.requestUnmute`). The UI must show a one-tap prompt.
   */
  unmuteRequested: () => void;
  /**
   * Playback is blocked by the browser's autoplay policy. The UI must show an
   * "enable audio" button wired to `startAudio()`.
   */
  playbackBlocked: () => void;
  /** Non-fatal diagnostics, already localized-agnostic (English, for logs). */
  log: (line: string) => void;
};

export type JoinOptions = {
  /** Short-lived credential minted by our server for exactly this room. */
  token: string;
  /** Provider websocket endpoint, also supplied by our server. */
  url: string;
  /**
   * Our own endpoint for the teacher controls that must be enforced by the
   * provider rather than the client (see `muteParticipant`). Vendor-neutral in
   * shape — it takes `{ action, identity }` — so a second implementation reuses
   * it unchanged; it lives in the options rather than the implementation
   * because only the caller knows which session this room belongs to.
   */
  controlUrl: string;
  /**
   * Shown in the OS media notification so Android Chrome classifies remote
   * audio as media playback rather than an incidental page sound — the
   * mitigation the Phase 0 memo (§5) requires proving for screen-lock
   * listening.
   */
  mediaSessionTitle: string;
};

export type JoinResult = {
  /** Wall-clock ms from join() to connected, for the field-test log. */
  joinMs: number;
};

export interface AudioRoom {
  /**
   * Must be called from a user gesture: both mobile platforms' autoplay
   * policies require it, and a programmatic join yields a connected room with
   * silent playback (Phase 0 memo §5).
   */
  join(opts: JoinOptions): Promise<JoinResult>;
  leave(): Promise<void>;

  // --- self controls, available to every participant ---
  setMicEnabled(on: boolean): Promise<void>;
  /** Autoplay recovery; safe to call repeatedly. */
  startAudio(): Promise<void>;

  // --- teacher controls ---
  /**
   * Soft mute at the SFU: the target stops transmitting immediately and **may
   * unmute themselves again**. That is the PRD's FR-13 default and the only
   * mute semantics Phase 1 ships — no lock. Implementations route this through
   * our own server so the provider, not the target's cooperation, enforces it.
   */
  muteParticipant(id: string): Promise<void>;
  muteAll(): Promise<void>;
  /**
   * Unmute is never a server command — no provider permits one (Phase 0 memo
   * §3). This is a request delivered over the room's data channel. The target
   * auto-accepts if that user has already unmuted themselves during this
   * session (they have granted mic access and shown intent to speak);
   * otherwise the target's UI raises `unmuteRequested` for a one-tap consent.
   */
  requestUnmute(id: string): Promise<void>;

  on<K extends keyof AudioRoomEvents>(event: K, cb: AudioRoomEvents[K]): void;
}

/** Sorts a roster for display: teacher pinned, then speakers, then by name. */
export function sortRoster(list: readonly RoomParticipant[]): RoomParticipant[] {
  const rank = (p: RoomParticipant) => (p.role === 'teacher' ? 0 : p.micEnabled ? 1 : 2);
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}
