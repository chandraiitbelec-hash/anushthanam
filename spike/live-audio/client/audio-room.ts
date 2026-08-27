// Vendor-agnostic contract for what OUR app needs from a live-audio provider.
// This file must not import from any vendor SDK. The rest of the client talks
// only to these types; swapping vendors means writing one new implementation.

export type Role = 'teacher' | 'listener';

export interface ParticipantInfo {
  /** Stable identity for the session (vendor identity string, opaque to us). */
  id: string;
  name: string;
  role: Role;
  isLocal: boolean;
  /** Has publish permission at the SFU (stage). Audience members are false. */
  onStage: boolean;
  /** Currently publishing unmuted audio. */
  micEnabled: boolean;
  speaking: boolean;
  handRaised: boolean;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface AudioRoomEvents {
  /** Full participant snapshot; fires on any roster/state change. */
  participants: (list: ParticipantInfo[]) => void;
  connection: (state: ConnectionState) => void;
  /** Timestamped diagnostics (permission changes, errors, latency marks). */
  log: (line: string) => void;
}

export interface JoinResult {
  /** Wall-clock ms from join() call to connected state. */
  joinMs: number;
  /** Of which: ms spent fetching our own server's token. */
  tokenMs: number;
}

export interface AudioRoom {
  join(opts: { room: string; name: string; role: Role }): Promise<JoinResult>;
  leave(): Promise<void>;

  // --- self controls (any participant) ---
  /** No-op / rejected by the SFU when not on stage — that rejection is the NFR-6 check. */
  setMicEnabled(on: boolean): Promise<void>;
  setHandRaised(up: boolean): Promise<void>;

  // --- teacher controls (server-enforced; implementations route via our backend) ---
  muteParticipant(id: string): Promise<void>;
  /** Remote unmute is consent-gated on every vendor; this is a request the target's client honors. */
  requestUnmute(id: string): Promise<void>;
  muteAll(): Promise<void>;
  requestUnmuteAll(): Promise<void>;
  bringToStage(id: string): Promise<void>;
  sendToAudience(id: string): Promise<void>;

  on<K extends keyof AudioRoomEvents>(event: K, cb: AudioRoomEvents[K]): void;
}
