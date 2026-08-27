import { AccessToken, RoomServiceClient, TrackType } from 'livekit-server-sdk';
import type { LiveAudioAdmin, MintTokenInput, MintedToken } from './admin';

/**
 * The one place `livekit-server-sdk` may be imported. Implements LiveAudioAdmin
 * against LiveKit Cloud (India South region — see
 * research/webrtc-vendor-eval-2026-08.md for the vendor decision).
 *
 * Everything here runs on the Node runtime only: it holds the API secret and
 * signs tokens.
 */

/** Grants issued in the join token. Mirrors what circle form actually needs. */
function grantFor(canSpeak: boolean) {
  return {
    canSubscribe: true,
    canPublish: canSpeak,
    // The unmute *request* rides the data channel, so every participant needs
    // to send data — the teacher to ask, and (for hall form later) participants
    // to answer.
    canPublishData: true,
  };
}

export function createLiveKitAdmin(): LiveAudioAdmin {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) {
    // Unreachable via getLiveAudioAdmin(), which checks first; this keeps the
    // module honest if it is ever constructed directly.
    throw new Error('LiveKit is not configured');
  }

  // The server API is HTTP against the same host the client reaches over wss.
  const svc = new RoomServiceClient(
    url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:'),
    apiKey,
    apiSecret,
  );

  /** Sids of a participant's published audio tracks, or [] if they have none. */
  async function audioTrackSids(room: string, identity: string): Promise<string[]> {
    try {
      const p = await svc.getParticipant(room, identity);
      return p.tracks.filter(t => t.type === TrackType.AUDIO).map(t => t.sid);
    } catch {
      // Not in the room (left mid-click, or never joined) — nothing to mute.
      return [];
    }
  }

  return {
    async mintToken(input: MintTokenInput): Promise<MintedToken> {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: input.identity,
        name: input.displayName,
        // Room metadata the other clients read for display. Kept to what the
        // roster renders — no email, no account internals.
        metadata: JSON.stringify({ role: input.role, avatarUrl: input.avatarUrl }),
        // Long enough for a full satsang plus reconnects, short enough that a
        // leaked token is not a standing invitation.
        ttl: '4h',
      });
      at.addGrant({ roomJoin: true, room: input.room, ...grantFor(input.canSpeak) });
      return { token: await at.toJwt(), url };
    },

    async muteParticipant(room: string, identity: string): Promise<void> {
      for (const sid of await audioTrackSids(room, identity)) {
        await svc.mutePublishedTrack(room, identity, sid, true);
      }
    },

    async muteAll(room: string, exceptIdentity: string): Promise<void> {
      let participants;
      try {
        participants = await svc.listParticipants(room);
      } catch {
        return; // Room not up yet — nothing is transmitting.
      }
      for (const p of participants) {
        if (p.identity === exceptIdentity) continue;
        for (const track of p.tracks) {
          if (track.type !== TrackType.AUDIO || track.muted) continue;
          await svc.mutePublishedTrack(room, p.identity, track.sid, true);
        }
      }
    },

    async closeRoom(room: string): Promise<void> {
      try {
        await svc.deleteRoom(room);
      } catch (err) {
        // A room nobody joined was never created provider-side; ending such a
        // session is still a success from the teacher's point of view. The DB
        // row is what makes the session ended.
        console.error('SATSANG: closeRoom failed (continuing)', err);
      }
    },
  };
}
