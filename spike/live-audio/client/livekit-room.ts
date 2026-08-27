// The ONE place vendor types are allowed. Implements AudioRoom on livekit-client.
import {
  ConnectionState as LKConnectionState,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import type {
  AudioRoom,
  AudioRoomEvents,
  ConnectionState,
  JoinResult,
  ParticipantInfo,
  Role,
} from './audio-room';

type DataMsg = { type: 'unmute-request' };

export class LiveKitAudioRoom implements AudioRoom {
  private room: Room | null = null;
  private adminKey: string | undefined;
  private roomSlug = '';
  private handlers: { [K in keyof AudioRoomEvents]?: AudioRoomEvents[K][] } = {};
  private t0 = 0;
  private audioEls = new Map<string, HTMLAudioElement>();

  on<K extends keyof AudioRoomEvents>(event: K, cb: AudioRoomEvents[K]): void {
    const list = (this.handlers[event] ??= []) as AudioRoomEvents[K][];
    list.push(cb);
  }

  private emit<K extends keyof AudioRoomEvents>(event: K, arg: Parameters<AudioRoomEvents[K]>[0]) {
    for (const cb of this.handlers[event] ?? []) (cb as (a: unknown) => void)(arg);
  }

  private log(line: string) {
    // Wall clock first so latency can be compared across tabs, then ms since join.
    const wall = new Date().toISOString().slice(11, 23);
    const t = this.t0 ? `+${(performance.now() - this.t0).toFixed(0)}ms` : '';
    this.emit('log', `${wall} ${t} ${line}`);
  }

  async join(opts: { room: string; name: string; role: Role }): Promise<JoinResult> {
    this.t0 = performance.now();
    this.roomSlug = opts.room;
    const tokenStart = performance.now();
    const res = await fetch('/api/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) throw new Error(`token endpoint: ${res.status} ${await res.text()}`);
    const { token, url, adminKey } = await res.json();
    const tokenMs = performance.now() - tokenStart;
    this.adminKey = adminKey;

    const room = new Room();
    this.room = room;
    this.wireEvents(room);
    await room.connect(url, token);
    // Lab-bench escape hatch for the NFR-6 test (attempt a publish with the
    // SDK's local permission check patched out). Not part of the interface.
    (window as unknown as Record<string, unknown>).__lkRoom = room;
    const joinMs = performance.now() - this.t0;
    this.log(`connected (token ${tokenMs.toFixed(0)}ms, total ${joinMs.toFixed(0)}ms)`);
    this.snapshot();
    return { joinMs, tokenMs };
  }

  private wireEvents(room: Room) {
    const resnapshot = [
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
      RoomEvent.ParticipantAttributesChanged,
    ] as const;
    for (const ev of resnapshot) room.on(ev, () => this.snapshot());

    room.on(RoomEvent.ParticipantPermissionsChanged, (prev, p) => {
      this.log(`permissions changed for ${p.identity}: canPublish=${p.permissions?.canPublish}`);
      this.snapshot();
    });
    room.on(RoomEvent.ConnectionStateChanged, (s) => {
      const map: Record<string, ConnectionState> = {
        [LKConnectionState.Disconnected]: 'disconnected',
        [LKConnectionState.Connecting]: 'connecting',
        [LKConnectionState.Connected]: 'connected',
        [LKConnectionState.Reconnecting]: 'reconnecting',
        [LKConnectionState.SignalReconnecting]: 'reconnecting',
      };
      this.emit('connection', map[s] ?? 'disconnected');
      this.log(`connection: ${s}`);
    });
    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, p) => {
      if (track.kind !== Track.Kind.Audio) return;
      const el = track.attach() as HTMLAudioElement;
      this.audioEls.set(p.identity, el);
      document.body.appendChild(el);
      this.log(`audio subscribed: ${p.identity}`);
      this.snapshot();
    });
    room.on(RoomEvent.TrackUnsubscribed, (track, _pub, p) => {
      track.detach().forEach((el) => el.remove());
      this.audioEls.delete(p.identity);
      this.snapshot();
    });
    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      if (!room.canPlaybackAudio) {
        this.log('autoplay blocked — tap the "enable audio" button');
        const btn = document.getElementById('enable-audio');
        if (btn) btn.style.display = 'inline-block';
      }
    });
    room.on(RoomEvent.DataReceived, (payload, p) => {
      let msg: DataMsg;
      try {
        msg = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }
      if (msg.type === 'unmute-request') {
        this.log(`unmute request from ${p?.identity ?? '?'} — honoring (spike auto-accepts)`);
        this.setMicEnabled(true).catch((e) => this.log(`unmute request failed: ${e.message}`));
      }
    });
    room.on(RoomEvent.Disconnected, (reason) => {
      this.log(`disconnected: ${reason ?? 'unknown'}`);
      this.emit('connection', 'disconnected');
    });
  }

  private roleOf(p: Participant): Role {
    try {
      return (JSON.parse(p.metadata || '{}').role as Role) ?? 'listener';
    } catch {
      return 'listener';
    }
  }

  private toInfo(p: Participant, isLocal: boolean): ParticipantInfo {
    return {
      id: p.identity,
      name: p.name || p.identity,
      role: this.roleOf(p),
      isLocal,
      onStage: p.permissions?.canPublish ?? false,
      micEnabled: p.isMicrophoneEnabled,
      speaking: p.isSpeaking,
      handRaised: p.attributes?.handRaised === '1',
    };
  }

  private snapshot() {
    const room = this.room;
    if (!room) return;
    const list = [
      this.toInfo(room.localParticipant, true),
      ...[...room.remoteParticipants.values()].map((p) => this.toInfo(p, false)),
    ];
    this.emit('participants', list);
  }

  async leave() {
    await this.room?.disconnect();
    this.room = null;
  }

  async setMicEnabled(on: boolean) {
    if (!this.room) throw new Error('not joined');
    try {
      await this.room.localParticipant.setMicrophoneEnabled(on);
      this.log(`mic ${on ? 'on' : 'off'} (local)`);
    } catch (e) {
      // Expected for audience members: the SFU rejects the publish (NFR-6 evidence).
      this.log(`setMicEnabled(${on}) rejected: ${(e as Error).message}`);
      throw e;
    }
    this.snapshot();
  }

  async setHandRaised(up: boolean) {
    if (!this.room) throw new Error('not joined');
    await this.room.localParticipant.setAttributes({ handRaised: up ? '1' : '' });
    this.log(up ? 'hand raised' : 'hand lowered');
  }

  /** Also used by the "enable audio" button for autoplay-blocked browsers. */
  async startAudio() {
    await this.room?.startAudio();
  }

  // --- teacher ops: everything below goes through our server so the SFU, not
  // the client, is the enforcement point. adminKey is only issued to teachers.
  private async teacherApi(path: string, body: Record<string, unknown>) {
    const t = performance.now();
    const res = await fetch(`/api/teacher/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-key': this.adminKey ?? '' },
      body: JSON.stringify({ room: this.roomSlug, ...body }),
    });
    const text = await res.text();
    this.log(`teacher/${path} → ${res.status} in ${(performance.now() - t).toFixed(0)}ms ${text}`);
    if (!res.ok) throw new Error(text);
  }

  muteParticipant(id: string) {
    return this.teacherApi('mute', { identity: id });
  }
  requestUnmute(id: string) {
    return this.sendData({ type: 'unmute-request' }, [id]);
  }
  muteAll() {
    // teacherIdentity tells the server whom to skip — without it the teacher
    // mutes themselves too (found live: mute-all returned the teacher in its list).
    return this.teacherApi('mute-all', { teacherIdentity: this.room?.localParticipant.identity });
  }
  requestUnmuteAll() {
    return this.sendData({ type: 'unmute-request' });
  }
  bringToStage(id: string) {
    return this.teacherApi('stage', { identity: id, onStage: true });
  }
  sendToAudience(id: string) {
    return this.teacherApi('stage', { identity: id, onStage: false });
  }

  private async sendData(msg: DataMsg, to?: string[]) {
    if (!this.room) throw new Error('not joined');
    await this.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), {
      reliable: true,
      destinationIdentities: to,
    });
    this.log(`sent ${msg.type}${to ? ` to ${to.join(',')}` : ' to all'}`);
  }
}
