/**
 * Vendor-agnostic contract for the *server* side of live audio: minting join
 * credentials and performing the operations that must be enforced by the
 * provider rather than by a cooperating client (mute, room teardown).
 *
 * Like `audio-room.ts` this file imports no vendor SDK. Route handlers depend
 * only on these types plus `getLiveAudioAdmin()`, so the provider is reachable
 * from exactly one implementation module.
 */

export type MintTokenInput = {
  /** Opaque room name from `live_sessions.room_name`. */
  room: string;
  /**
   * Provider-side identity. The app passes the signed-in user's `accountId`
   * (our `users.id`) — never `session.user.id`/`googleId`, which are the
   * identity provider's ids. Using a stable per-user value also means a second
   * tab replaces the first join instead of doubling the roster.
   */
  identity: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'teacher' | 'participant';
  /**
   * Whether the token carries publish permission. Circle form grants it to
   * everyone; hall form (Phase 2) will withhold it from the audience, which is
   * why this is a parameter rather than a constant.
   */
  canSpeak: boolean;
};

export type MintedToken = {
  token: string;
  /** Provider endpoint the client should connect to. */
  url: string;
};

export interface LiveAudioAdmin {
  mintToken(input: MintTokenInput): Promise<MintedToken>;
  /**
   * Soft mute at the provider: stops the target's published audio without
   * their cooperation, but leaves them able to unmute themselves again
   * (PRD FR-13 default). No-op when the target publishes nothing.
   */
  muteParticipant(room: string, identity: string): Promise<void>;
  /** Soft-mutes every participant except `exceptIdentity` (the teacher). */
  muteAll(room: string, exceptIdentity: string): Promise<void>;
  /**
   * Tears the room down provider-side so every connected client is
   * disconnected. Backs "End session for all"; must succeed silently when the
   * room never existed (nobody ever joined).
   */
  closeRoom(room: string): Promise<void>;
}

/**
 * Live audio is off unless every credential is present — the same posture
 * `isAuthConfigured` takes. A deploy without these renders the schedule
 * exactly as it did before this feature: satsang events still show, their
 * live-session controls simply aren't there.
 */
export const isLiveAudioConfigured = Boolean(
  process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET,
);

/**
 * The single point where a provider is chosen. Returns null when unconfigured
 * so callers must handle absence rather than crash — route handlers turn that
 * into a 503 the UI renders as "live audio is unavailable".
 *
 * Dynamically imported so that merely importing this module (which the event
 * page does, transitively) never pulls the provider SDK into a bundle that
 * would not otherwise need it.
 */
export async function getLiveAudioAdmin(): Promise<LiveAudioAdmin | null> {
  if (!isLiveAudioConfigured) return null;
  const { createLiveKitAdmin } = await import('./livekit-admin');
  return createLiveKitAdmin();
}
