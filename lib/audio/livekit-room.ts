import {
  ConnectionState as LKConnectionState,
  DisconnectReason,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import type {
  AudioRoom,
  AudioRoomEvents,
  JoinOptions,
  JoinResult,
  RoomConnectionState,
  RoomEndReason,
  RoomParticipant,
  RoomRole,
} from './audio-room';

/**
 * The one place `livekit-client` may be imported. Implements AudioRoom for
 * LiveKit Cloud; every other client module talks to the interface only.
 *
 * Three behaviours here are load-bearing findings from the Phase 0 spike
 * (research/webrtc-vendor-eval-2026-08.md), not incidental choices:
 *
 *  - **Publish failures are silent at the SFU** (§3): a rejected publish times
 *    out rather than erroring. Nothing in this class treats a publish result as
 *    a source of truth; the roster is rebuilt from permission and mute state
 *    reported by the provider's events.
 *  - **Remote unmute is impossible on every vendor** (§3). `requestUnmute`
 *    sends a data message; consent lives on the receiving client.
 *  - **Android Chrome suspends WebRTC playback on screen lock** (§5). Remote
 *    audio is registered with the MediaSession API so Chrome classifies it as
 *    media playback, which is the mitigation the memo asks to prove in the
 *    field.
 */

type ControlAction = { action: 'mute' | 'mute-all'; identity?: string };
type DataMessage = { type: 'unmute-request' };

type Metadata = { role?: RoomRole; avatarUrl?: string | null };

export class LiveKitAudioRoom implements AudioRoom {
  private room: Room | null = null;
  private controlUrl = '';
  private handlers: { [K in keyof AudioRoomEvents]?: AudioRoomEvents[K][] } = {};
  private startedAt = 0;
  /**
   * Whether this user has unmuted themselves at least once this session. It is
   * the consent signal for auto-accepting a teacher's unmute request: they have
   * already granted mic access and chosen to speak, so a second prompt is
   * friction rather than protection.
   */
  private hasSelfUnmuted = false;
  private closeReason: RoomEndReason = 'lost';
  /** Attached remote audio elements, so playback can be paused as a unit. */
  private audioElements = new Map<string, HTMLAudioElement>();

  on<K extends keyof AudioRoomEvents>(event: K, cb: AudioRoomEvents[K]): void {
    const list = (this.handlers[event] ??= []) as AudioRoomEvents[K][];
    list.push(cb);
  }

  private emit<K extends keyof AudioRoomEvents>(
    event: K,
    arg: Parameters<AudioRoomEvents[K]>[0],
  ): void {
    for (const cb of this.handlers[event] ?? []) (cb as (a: unknown) => void)(arg);
  }

  private log(line: string): void {
    const since = this.startedAt ? `+${(performance.now() - this.startedAt).toFixed(0)}ms ` : '';
    this.emit('log', `${since}${line}`);
  }

  async join(opts: JoinOptions): Promise<JoinResult> {
    this.startedAt = performance.now();
    this.controlUrl = opts.controlUrl;
    this.closeReason = 'lost';

    const room = new Room();
    this.room = room;
    this.wireEvents(room);
    this.emit('connection', 'connecting');

    await room.connect(opts.url, opts.token);
    const joinMs = performance.now() - this.startedAt;
    this.log(`connected in ${joinMs.toFixed(0)}ms`);
    this.setUpMediaSession(opts.mediaSessionTitle);
    this.snapshot();
    return { joinMs };
  }

  private wireEvents(room: Room): void {
    // Any of these can change what the roster should show; recomputing the
    // whole snapshot is cheap at circle-form sizes and avoids a pile of
    // incremental-update bugs.
    const rosterEvents = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.ActiveSpeakersChanged,
      RoomEvent.ParticipantMetadataChanged,
      RoomEvent.ParticipantPermissionsChanged,
    ] as const;
    for (const event of rosterEvents) room.on(event, () => this.snapshot());

    room.on(RoomEvent.ConnectionStateChanged, state => {
      const map: Partial<Record<LKConnectionState, RoomConnectionState>> = {
        [LKConnectionState.Disconnected]: 'disconnected',
        [LKConnectionState.Connecting]: 'connecting',
        [LKConnectionState.Connected]: 'connected',
        [LKConnectionState.Reconnecting]: 'reconnecting',
        [LKConnectionState.SignalReconnecting]: 'reconnecting',
      };
      this.emit('connection', map[state] ?? 'disconnected');
    });

    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, participant) => {
      if (track.kind !== Track.Kind.Audio) return;
      const element = track.attach() as HTMLAudioElement;
      element.autoplay = true;
      // Off-screen but in the document: an element outside the DOM does not
      // reliably play, and this is audio-only so there is nothing to show.
      element.style.display = 'none';
      document.body.appendChild(element);
      this.audioElements.set(participant.identity, element);
      this.snapshot();
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
      track.detach().forEach(element => element.remove());
      this.audioElements.delete(participant.identity);
      this.snapshot();
    });

    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      if (!room.canPlaybackAudio) {
        this.log('playback blocked by autoplay policy');
        this.emit('playbackBlocked', undefined);
      }
    });

    room.on(RoomEvent.DataReceived, payload => {
      let message: DataMessage;
      try {
        message = JSON.parse(new TextDecoder().decode(payload)) as DataMessage;
      } catch {
        return;
      }
      if (message.type !== 'unmute-request') return;
      if (this.hasSelfUnmuted) {
        this.log('unmute request — auto-accepted (already spoke this session)');
        this.setMicEnabled(true).catch(err => this.log(`auto-unmute failed: ${err.message}`));
      } else {
        this.log('unmute request — asking for consent');
        this.emit('unmuteRequested', undefined);
      }
    });

    room.on(RoomEvent.Disconnected, reason => {
      // A teacher's "End session for all" deletes the room provider-side, and
      // that arrives here as ROOM_DELETED — the only way a client learns the
      // difference between being ended and losing its connection.
      if (reason === DisconnectReason.ROOM_DELETED || reason === DisconnectReason.PARTICIPANT_REMOVED) {
        this.closeReason = 'ended-by-teacher';
      }
      this.log(`disconnected (${reason ?? 'unknown'})`);
      this.teardownMediaSession();
      this.emit('connection', 'disconnected');
      this.emit('closed', this.closeReason);
    });
  }

  /**
   * Registers the room as media playback with the OS. On Android Chrome this is
   * what distinguishes "a page making noise" (suspended on screen lock) from
   * "media the user is listening to" — see the memo §5. Harmless where
   * unsupported.
   */
  private setUpMediaSession(title: string): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const session = navigator.mediaSession;
      session.metadata = new MediaMetadata({
        title,
        artist: 'Anushthanam',
        album: 'Satsang',
      });
      session.playbackState = 'playing';
      // Chrome only surfaces the media notification when handlers exist. These
      // control *playback of others' audio*, never the microphone: pausing the
      // notification must not silently take a devotee off the air.
      session.setActionHandler('pause', () => {
        for (const element of this.audioElements.values()) element.pause();
        session.playbackState = 'paused';
      });
      session.setActionHandler('play', () => {
        for (const element of this.audioElements.values()) void element.play().catch(() => {});
        session.playbackState = 'playing';
      });
    } catch (err) {
      this.log(`media session unavailable: ${(err as Error).message}`);
    }
  }

  private teardownMediaSession(): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('play', null);
    } catch {
      // Nothing to recover: teardown is best-effort.
    }
  }

  private toParticipant(p: Participant, isLocal: boolean): RoomParticipant {
    let metadata: Metadata = {};
    try {
      metadata = JSON.parse(p.metadata || '{}') as Metadata;
    } catch {
      // Metadata is minted by our own server; an unparseable value means an
      // older token shape, which should degrade to a plain participant.
    }
    return {
      id: p.identity,
      name: p.name || p.identity,
      avatarUrl: metadata.avatarUrl ?? null,
      role: metadata.role === 'teacher' ? 'teacher' : 'participant',
      isLocal,
      canSpeak: p.permissions?.canPublish ?? false,
      micEnabled: p.isMicrophoneEnabled,
      speaking: p.isSpeaking,
    };
  }

  private snapshot(): void {
    const room = this.room;
    if (!room) return;
    this.emit('participants', [
      this.toParticipant(room.localParticipant, true),
      ...[...room.remoteParticipants.values()].map(p => this.toParticipant(p, false)),
    ]);
  }

  async leave(): Promise<void> {
    this.closeReason = 'left';
    await this.room?.disconnect();
    this.room = null;
  }

  async setMicEnabled(on: boolean): Promise<void> {
    const room = this.room;
    if (!room) throw new Error('not joined');
    await room.localParticipant.setMicrophoneEnabled(on);
    if (on) this.hasSelfUnmuted = true;
    this.log(`mic ${on ? 'on' : 'off'}`);
    this.snapshot();
  }

  async startAudio(): Promise<void> {
    await this.room?.startAudio();
    for (const element of this.audioElements.values()) {
      await element.play().catch(() => {});
    }
    this.log('playback started by user gesture');
  }

  /**
   * Teacher mutes go through our own server, which calls the provider's server
   * API — so the mute is enforced at the SFU and does not depend on the target
   * client cooperating. The resulting state change arrives back through the
   * provider's mute events, which is what updates the roster.
   */
  private async control(body: ControlAction): Promise<void> {
    const res = await fetch(this.controlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`control ${body.action} failed: ${res.status} ${text}`);
    }
  }

  muteParticipant(id: string): Promise<void> {
    return this.control({ action: 'mute', identity: id });
  }

  muteAll(): Promise<void> {
    return this.control({ action: 'mute-all' });
  }

  async requestUnmute(id: string): Promise<void> {
    const room = this.room;
    if (!room) throw new Error('not joined');
    const message: DataMessage = { type: 'unmute-request' };
    await room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(message)), {
      reliable: true,
      destinationIdentities: [id],
    });
    this.log(`unmute request sent to ${id}`);
  }
}
