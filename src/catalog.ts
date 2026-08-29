import type { AudioId, AudioTrack } from "./types.js";

const TRACKS: readonly AudioTrack[] = [
  { id: "zako", label: "Zako", description: "A short vocal clip", frequencyHz: 0, durationMs: 900, assetFile: "zako.wav" }
];

const BY_ID = new Map(TRACKS.map((track) => [track.id, track]));

export function listBuiltInAudio(): readonly AudioTrack[] {
  return TRACKS;
}

export function getBuiltInAudio(id: string): AudioTrack {
  const track = BY_ID.get(id as AudioId);
  if (!track) throw new Error(`Unknown built-in audio: ${id}`);
  return track;
}
