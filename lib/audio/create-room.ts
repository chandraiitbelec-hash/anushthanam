import type { AudioRoom } from './audio-room';

/**
 * The single point where a client-side audio provider is chosen — the mirror of
 * `getLiveAudioAdmin()` on the server. UI code calls this and never names an
 * implementation, so the whole live surface swaps by editing this file plus the
 * adapter it points at.
 *
 * The import is dynamic for a second reason beyond isolation: the provider SDK
 * is a large dependency, and only a browser that actually joins a session
 * should download it.
 */
export async function createAudioRoom(): Promise<AudioRoom> {
  const { LiveKitAudioRoom } = await import('./livekit-room');
  return new LiveKitAudioRoom();
}
