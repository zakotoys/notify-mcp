import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { AudioPlayer, AudioTrack } from "./types.js";

const execFileAsync = promisify(execFile);
export type CommandRunner = (command: string, args: string[]) => Promise<void>;

/** Creates a tiny PCM WAV in a temporary directory and delegates playback to the OS. */
export class SystemAudioPlayer implements AudioPlayer {
  private readonly run: CommandRunner;

  constructor(private readonly platform: NodeJS.Platform = process.platform, run?: CommandRunner) {
    this.run = run ?? (async (command, args) => { await execFileAsync(command, args); });
  }

  async play(track: AudioTrack): Promise<void> {
    const directory = await mkdtemp(join(tmpdir(), "notify-mcp-"));
    const file = track.assetFile
      ? join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "audio", track.assetFile)
      : join(directory, `${track.id}.wav`);
    try {
      if (!track.assetFile) await writeFile(file, makeWav(track));
      if (this.platform === "darwin") await this.run("afplay", [file]);
      else if (this.platform === "win32") {
        const script = `(New-Object Media.SoundPlayer '${file.replaceAll("'", "''")}').PlaySync()`;
        await this.run("powershell", ["-NoProfile", "-NonInteractive", "-Command", script]);
      } else if (this.platform === "linux") await this.run("aplay", ["-q", file]);
      else throw new Error(`Audio playback is unsupported on ${this.platform}`);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}

function makeWav(track: AudioTrack): Buffer {
  const sampleRate = 44100;
  const samples = Math.max(1, Math.round(sampleRate * track.durationMs / 1000));
  const dataSize = samples * 2;
  const wav = Buffer.alloc(44 + dataSize);
  wav.write("RIFF", 0); wav.writeUInt32LE(36 + dataSize, 4); wav.write("WAVE", 8);
  wav.write("fmt ", 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i += 1) {
    const envelope = Math.min(1, i / (sampleRate * 0.01), (samples - i) / (sampleRate * 0.02));
    wav.writeInt16LE(Math.round(Math.sin(2 * Math.PI * track.frequencyHz * i / sampleRate) * 0.22 * envelope * 32767), 44 + i * 2);
  }
  return wav;
}
